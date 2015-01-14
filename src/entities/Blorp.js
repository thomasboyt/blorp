/* @flow */

var Entity = require('./Entity');
var TileEntity = require('./TileEntity');
var Block = require('./Block');
var Player = require('./Player');
var Coquette = require('coquette');
var rectangleIntersection = require('../lib/math').rectangleIntersection;
var SpriteSheet = require('../lib/SpriteSheet');
var AnimationManager = require('../lib/AnimationManager');

class Blorp extends TileEntity {
  img: Image;
  anim: AnimationManager;

  grounded: boolean;
  walkingRight: boolean;

  vec: {
    x: number;
    y: number;
  };

  init(settings: any) {
    this.size = {x: 13, y: 13};
    this.vec = {x: 0, y: 0};
    this.grounded = true;
    this.walkingRight = false;

    this.center = this.getCenter(settings.tileX, settings.tileY);
    var sheet = new SpriteSheet(this.game.assets.images.blorpSheet, this.size.y);

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
      } else {
        // do x correction
        if (intersect.fromLeft) {
          this.center.x -= Math.floor(intersect.w);
          this.walkingRight = false;
        } else {
          this.center.x += intersect.w;
          this.walkingRight = true;
        }
        this.vec.x = 0;
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
