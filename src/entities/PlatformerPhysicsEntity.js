/* @flow */

var Entity = require('./Entity');
var rectangleIntersection = require('../lib/math').rectangleIntersection;

var Block = require('./tiles/Block');
var Platform = require('./tiles/Platform');
var Elevator = require('./Elevator');
var Maths = require('coquette').Collider.Maths;

class PlatformerPhysicsEntity extends Entity {
  grounded: boolean;
  currentElevator: ?Elevator;

  vec: {
    x: number;
    y: number;
  };

  afterBlockCollision(block: Block, intersect) {}

  updateElevator() {
    if (!this.currentElevator) {
      return;

    } else {
      // Are we still on current elevator?
      if (!Maths.unrotatedRectanglesIntersecting(this, this.currentElevator)) {
        this.currentElevator = null;
        return;
      }

      this.vec.y = this.currentElevator.getSpeed();
    }
  }

  handlePlatformerCollision(other: Entity) {
    var intersect;

    if (other instanceof Block) {
      intersect = rectangleIntersection(this, other);

      if (intersect.w > intersect.h) {

        // Self is falling into a block from above
        if (intersect.fromAbove && other.isEdgeCollidable.top) {
          this.center.y -= intersect.h;

          if (this.vec.y > 0) {
            this.vec.y = 0;
            this.grounded = true;
          }

        // Self is rising into a block from below
        } else if (other.isEdgeCollidable.bottom) {
          this.center.y += intersect.h;

          if (this.vec.y < 0) {
            this.vec.y = 0;
          }
        }

      } else {
        // Self is colliding with the block from the left
        if (intersect.fromLeft && other.isEdgeCollidable.left) {
          this.center.x -= intersect.w;

        // Self is colliding with the block from the right
        } else if (other.isEdgeCollidable.right) {
          this.center.x += intersect.w;
        }
      }

      this.afterBlockCollision(other, intersect);

    } else if (other instanceof Platform || other instanceof Elevator) {
      if (this.getFootBox) {
        intersect = rectangleIntersection(this.getFootBox(), other);
      } else {
        intersect = rectangleIntersection(this, other);
      }

      // Platforms can only be collided with from the top
      if (intersect.w > intersect.h && intersect.fromAbove && this.vec.y > 0) {
        this.center.y -= intersect.h;
        this.vec.y = 0;
        this.grounded = true;

        if (other instanceof Elevator) {
          this.currentElevator = other;
          this.vec.y = other.getSpeed();
        }
      }
    }
  }
}

module.exports = PlatformerPhysicsEntity;
