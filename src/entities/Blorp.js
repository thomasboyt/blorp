/* @flow */

var Entity = require('./Entity');
var Block = require('./tiles/Block');
var Platform = require('./tiles/Platform');
var Player = require('./Player');
var rectangleIntersection = require('../lib/math').rectangleIntersection;
var SpriteSheet = require('../lib/SpriteSheet');
var AnimationManager = require('../lib/AnimationManager');

class Blorp extends Entity {
  img: Image;
  anim: AnimationManager;

  grounded: boolean;
  walkingRight: boolean;

  vec: {
    x: number;
    y: number;
  };

  init(settings: any) {
    this.center = settings.center;
    this.size = {x: 13, y: 13};
    this.vec = {x: 0, y: 0};
    this.zindex = 100;

    this.grounded = true;
    this.walkingRight = false;

    var sheet = new SpriteSheet(this.game.assets.images.blorpSheet, this.size.x, this.size.y);

    this.anim = new AnimationManager('stand', {
      stand: {
        sheet: sheet,
        frames: [0],
        frameLengthMs: null
      },

      walk: {
        sheet: sheet,
        frames: [1, 0],
        frameLengthMs: this.game.config.blorpWalkAnimMs
      }
    });
  }

  update(dt: number) {
    var step = dt/100;

    var spd = this.game.config.blorpSpeed * step;

    if (this.walkingRight) {
      this.vec.x = spd;
    } else {
      this.vec.x = -spd;
    }

    this.vec.y += this.game.config.gravityAccel;

    this.center.x += this.vec.x;
    this.center.y += this.vec.y * step;

    this.anim.update(dt);

    if (this.vec.x && this.grounded) {
      this.anim.set('walk');
    } else {
      this.anim.set('stand');
    }
  }

  draw(ctx: any) {
    var sprite = this.anim.getSprite();

    var destX = this.center.x - sprite.width / 2;
    var destY = this.center.y - sprite.height / 2;

    sprite.draw(ctx, destX, destY);
  }

  collision(other: Entity) {
    var intersect = rectangleIntersection(this, other);

    if (other instanceof Block) {
      if (intersect.w > intersect.h) {
        // do y correction
        if (intersect.fromAbove) {
          this.center.y -= intersect.h;

          // prevent "sticky corners" while ascending
          if (this.vec.y > 0) {
            this.grounded = true;
            this.vec.y = 0;
          }
        } else {
          this.center.y += Math.ceil(intersect.h);
          this.vec.y = 0;
        }
      } else if (intersect.h > intersect.w) {
        // do x correction
        if (intersect.fromLeft && other.isEdgeCollidable.left) {
          this.center.x -= intersect.w;
          this.walkingRight = false;
        } else if (other.isEdgeCollidable.right) {
          this.center.x += intersect.w;
          this.walkingRight = true;
        }
        this.vec.x = 0;
      }
    } else if (other instanceof Platform) {
      if (intersect.w > intersect.h && intersect.fromAbove && other.isEdgeCollidable.top) {
        this.center.y -= intersect.h;
        this.vec.y = 0;
        this.grounded = true;
      }
    }

    if (other instanceof Player) {
      if (intersect.w > intersect.h) {
        if (!intersect.fromAbove) {
          this.game.c.entities.destroy(this);
          other.jump();
        }
      }
    }
  }
}

module.exports = Blorp;
