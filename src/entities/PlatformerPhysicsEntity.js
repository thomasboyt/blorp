/* @flow */

var Entity = require('./Entity');
var rectangleIntersection = require('../lib/math').rectangleIntersection;

var Block = require('./tiles/Block');
var Platform = require('./tiles/Platform');

class PlatformerPhysicsEntity extends Entity {
  grounded: boolean;

  vec: {
    x: number;
    y: number;
  };

  handlePlatformerCollision(other: Entity) {
    var intersect;

    if (other instanceof Block) {
      intersect = rectangleIntersection(this, other);

      if (intersect.w > intersect.h) {

        // this is falling into a block from above
        if (intersect.fromAbove && other.isEdgeCollidable.top) {
          this.center.y -= intersect.h;

          // Zero out this velocity when they hit the block, and set grounded
          if (this.vec.y > 0) {
            this.vec.y = 0;
            this.grounded = true;
          }

        // this is rising into a block from below
        } else if (other.isEdgeCollidable.bottom) {
          this.center.y += intersect.h;

          // Zero out this velocity when they bump their head
          if (this.vec.y < 0) {
            this.vec.y = 0;
          }
        }

      } else {
        // this is colliding with the block from the left
        if (intersect.fromLeft && other.isEdgeCollidable.left) {
          this.center.x -= intersect.w;

        // this is colliding with the block from the right
        } else if (other.isEdgeCollidable.right) {
          this.center.x += intersect.w;
        }
      }
    } else if (other instanceof Platform) {
      intersect = rectangleIntersection(this, other);

      // Platforms can only be collided with from the top
      if (intersect.w > intersect.h && intersect.fromAbove && other.isEdgeCollidable.top) {
        this.center.y -= intersect.h;
        this.vec.y = 0;
        this.grounded = true;
      }
    }
  }
}

module.exports = PlatformerPhysicsEntity;
