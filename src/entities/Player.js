/* @flow */

var TileEntity = require('./TileEntity');
var Block = require('./Block');
var Coquette = require('coquette');
var rectangleIntersection = require('../math').rectangleIntersection

class Player extends TileEntity {
  img: Image;
  grounded: boolean;

  vec: {
    x: number;
    y: number;
  };

  init(settings: any) {
    this.size = {x: 20, y: 20};
    this.vec = {x: 0, y: 0};
    this.grounded = true;

    this.center = this.getCenter(settings.tileX, settings.tileY);
    this.img = this.game.assets.images.player;
  }

  update(dt: number) {
    dt = dt/100;

    var spd = this.game.config.playerSpeed * dt;

    if (this.game.c.inputter.isDown(this.game.c.inputter.LEFT_ARROW)) {
      this.vec.x = -spd;
    } else if (this.game.c.inputter.isDown(this.game.c.inputter.RIGHT_ARROW)) {
      this.vec.x = spd;
    }

    if (this.game.c.inputter.isPressed(this.game.c.inputter.UP_ARROW)) {
      if (this.grounded) {
        this.vec.y = -this.game.config.jumpSpeed;
      }
    }

    this.vec.y += this.game.config.gravityAccel;

    this.center.x += this.vec.x;
    this.center.y += this.vec.y * dt;
  }

  draw(ctx: any) {
    var img = this.img;

    var x = this.center.x - this.size.x / 2;
    var y = this.center.y - this.size.y / 2;

    ctx.drawImage(img, x, y);
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
          this.center.y += Math.ceil(intersect.h);
          this.vec.y = 0;
        }
      } else {
        // do x correction
        if (intersect.fromLeft) {
          this.center.x -= intersect.w;
        } else {
          this.center.x += intersect.w;
        }
        this.vec.x = 0;
      }
    }
  }
}

module.exports = Player;
