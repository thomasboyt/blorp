/* @flow */

var Coquette = require('coquette');
var Entity = require('../Entity');
var Block = require('../tiles/Block');
var Bullet = require('../Bullet');
var math = require('../../lib/math');

class Blorb extends Entity {
  vec: {
    x: number;
    y: number;
  };

  init(settings: any) {
    this.center = settings.center;
    this.size = {x: 15, y: 15};

    var spd = this.game.config.blorbSpeed;
    this.vec = {x: spd, y: -spd};

    this.boundingBox = Coquette.Collider.CIRCLE;
    this.zindex = this.game.config.zIndexes.blorb;
  }

  update(dt: number) {
    if (this.center.y - this.size.y / 2 > this.game.session.currentWorld.height) {
      this.game.c.entities.destroy(this);
    }

    var step = dt/100;

    this.center.x += this.vec.x * step;
    this.center.y += this.vec.y * step;
  }

  draw(ctx: any) {
    ctx.strokeStyle = '#193725';
    ctx.fillStyle = '#9FBB32';
    ctx.beginPath();
    ctx.arc(this.center.x, this.center.y, this.size.x/2, 0, 360);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }

  collision(other: Entity) {
    var spd = this.game.config.blorbSpeed;

    if (other instanceof Block) {
      // bounce off in other direction
      var intersect = math.rectangleIntersection(this, other);

      if (intersect.w > intersect.h) {
        if (intersect.fromAbove && other.isEdgeCollidable.top) {
          this.center.y -= intersect.h;
          this.vec.y = -spd;
        } else if (other.isEdgeCollidable.bottom) {
          this.center.y += intersect.h;
          this.vec.y = spd;
        }

      } else {
        if (intersect.fromLeft && other.isEdgeCollidable.left) {
          this.center.x -= intersect.w;
          this.vec.x = -spd;
        } else if (other.isEdgeCollidable.right) {
          this.center.x += intersect.w;
          this.vec.x = spd;
        }

      }

    }

    if (other instanceof Bullet) {
      this.game.c.entities.destroy(this);
      this.game.c.entities.destroy(other);

      this.game.session.addPoints(this.game.config.pointValues.blorb);
    }
  }
}

module.exports = Blorb;
