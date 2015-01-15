/* @flow */

var Entity = require('./Entity');
var TileEntity = require('./TileEntity');
var Block = require('./Block');
var Coquette = require('coquette');
var rectangleIntersection = require('../lib/math').rectangleIntersection;
var SpriteSheet = require('../lib/SpriteSheet');
var AnimationManager = require('../lib/AnimationManager');

class Player extends TileEntity {
  img: Image;
  anim: AnimationManager;

  grounded: boolean;
  facingLeft: boolean;

  vec: {
    x: number;
    y: number;
  };

  init(settings: any) {
    this.size = {x: 11, y: 20};
    this.vec = {x: 0, y: 0};
    this.grounded = true;

    this.center = this.getCenter(settings.tileX, settings.tileY);
    var sheet = new SpriteSheet(this.game.assets.images.playerSheet, this.game.tileWidth);

    this.facingLeft = false;

    this.anim = new AnimationManager('stand', {
      stand: {
        sheet: sheet,
        frames: [0],
        frameLengthMs: null
      },

      walk: {
        sheet: sheet,
        frames: [1, 0],
        frameLengthMs: this.game.config.playerWalkAnimMs
      }
    });
  }

  jump() {
    this.vec.y = -this.game.config.jumpSpeed;
    this.grounded = false;
  }

  update(dt: number) {
    var step = dt/100;

    var spd = this.game.config.playerSpeed * step;

    this.vec.x = 0;

    if (this.game.c.inputter.isDown(this.game.c.inputter.LEFT_ARROW)) {
      this.vec.x = -spd;
      this.facingLeft = true;
    } else if (this.game.c.inputter.isDown(this.game.c.inputter.RIGHT_ARROW)) {
      this.vec.x = spd;
      this.facingLeft = false;
    }

    if (this.game.c.inputter.isPressed(this.game.c.inputter.UP_ARROW)) {
      if (this.grounded) {
        this.jump();
      }
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

    if (this.facingLeft) {
      ctx.scale(-1, 1);
      destX = (destX * -1) - sprite.width;
    }

    sprite.draw(ctx, destX, destY);
  }

  collision(other: Entity) {

    if (other instanceof Block) {
      var intersect = rectangleIntersection(this, other);

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
          this.center.y += intersect.h;
          this.vec.y = 0;
        }
      } else {
        // do x correction
        if (intersect.fromLeft && other.isEdgeCollidable.left) {
          this.center.x -= intersect.w;
        } else if (other.isEdgeCollidable.right) {
          this.center.x += intersect.w;
        }
        this.vec.x = 0;
      }
    }
  }
}

module.exports = Player;
