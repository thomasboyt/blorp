/* @flow */

var Entity = require('./Entity');
var Block = require('./tiles/Block');
var Platform = require('./tiles/Platform');
var Player = require('./Player');
var Bullet = require('./Bullet');
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
    this.walkingRight = settings.direction === 'left' ? - 1 : 1;

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

    if (this.vec.y !== 0) {
      this.grounded = false;
    }

    var spd = this.game.config.blorpSpeed * step;

    var walkDirection = this.walkingRight ? 1 : -1;

    // if player is within 3 x tiles and 1 y tile, walk towards player
    var playerCenter = this.game.currentWorld.getPlayer().center;

    var xDiff = playerCenter.x - this.center.x;
    var yDiff = playerCenter.y - this.center.y;

    if (Math.abs(xDiff) < 60 && Math.abs(yDiff) < 25) {
      walkDirection = xDiff > 0 ? 1 : -1;
    }

    this.vec.x = walkDirection * spd;

    // Check to see if there's a block in front of us, and jump if so
    var tileInFront = this.game.currentWorld.getTileAt(0, this.center.x + (this.game.tileWidth * walkDirection), this.center.y);

    if (tileInFront instanceof Block) {
      // Check to make sure there's not a tile above it that can't be reached
      var tileInFrontAbove = this.game.currentWorld.getTileAt(0,
        this.center.x + (this.game.tileWidth * walkDirection),
        this.center.y - this.game.tileHeight);

      if (!(tileInFrontAbove instanceof Block)) {
        if (this.grounded) {
          this.jump();
        }
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

  jump() {
    this.vec.y = -this.game.config.jumpSpeed;
  }

  draw(ctx: any) {
    var sprite = this.anim.getSprite();

    var destX = this.center.x - sprite.width / 2;
    var destY = this.center.y - sprite.height / 2;

    sprite.draw(ctx, destX, destY);
  }

  collision(other: Entity) {
    var intersect = rectangleIntersection(this, other);

    // TODO: replace with nicer code from Player
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
    }

    if (other instanceof Bullet) {
      this.game.c.entities.destroy(this);
      this.game.c.entities.destroy(other);
    }

  }
}

module.exports = Blorp;
