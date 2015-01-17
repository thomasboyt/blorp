/* @flow */

var Entity = require('./Entity');
var World = require('./World');
var Block = require('./tiles/Block');
var Ladder = require('./tiles/Ladder');
var Platform = require('./tiles/Platform');

var rectangleIntersection = require('../lib/math').rectangleIntersection;
var SpriteSheet = require('../lib/SpriteSheet');
var AnimationManager = require('../lib/AnimationManager');

var WALK_STATE = 'walk';
var LADDER_STATE = 'ladder';

class Player extends Entity {
  img: Image;
  anim: AnimationManager;
  world: World;

  grounded: boolean;
  facingLeft: boolean;

  state: string;

  vec: {
    x: number;
    y: number;
  };

  init(settings: any) {
    this.center = settings.center;
    this.size = {x: 11, y: 20};
    this.vec = {x: 0, y: 0};
    this.world = settings.world;
    this.state = WALK_STATE;

    this.grounded = true;
    this.facingLeft = false;

    var sheet = new SpriteSheet(this.game.assets.images.playerSheet, this.game.tileWidth, this.game.tileHeight);

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
      },

      climb: {
        sheet: sheet,
        frames: [2, 3],
        frameLengthMs: this.game.config.playerWalkAnimMs
      },

      idleLadder: {
        sheet: sheet,
        frames: [4],
        frameLengthMs: null
      }
    });
  }

  update(dt: number) {
    var step = dt/100;

    var spd = this.game.config.playerSpeed * step;

    this.vec.x = 0;

    if (this.state === WALK_STATE) {

      if (this.game.c.inputter.isDown(this.game.c.inputter.LEFT_ARROW)) {
        this.vec.x = -spd;
        this.facingLeft = true;
      } else if (this.game.c.inputter.isDown(this.game.c.inputter.RIGHT_ARROW)) {
        this.vec.x = spd;
        this.facingLeft = false;
      }

      if (this.game.c.inputter.isPressed(this.game.c.inputter.UP_ARROW)) {
        if (this.grounded) {
          var behind = this.world.getTileAt(Ladder.layerNum, this.center.x, this.center.y);
          if (behind instanceof Ladder) {
            this._enterLadder(behind);
          } else {
            this.jump();
          }
        }
      }

      this.vec.y += this.game.config.gravityAccel;

      this.center.x += this.vec.x;
      this.center.y += this.vec.y * step;

      if (this.vec.x && this.grounded) {
        this.anim.set('walk');
      } else {
        this.anim.set('stand');
      }

    } else if (this.state === LADDER_STATE) {

      this.vec.y = 0;

      if (this.game.c.inputter.isDown(this.game.c.inputter.LEFT_ARROW)) {
        // fall left
      } else if (this.game.c.inputter.isDown(this.game.c.inputter.RIGHT_ARROW)) {
        // fall right
      }

      if (this.game.c.inputter.isDown(this.game.c.inputter.UP_ARROW)) {
        // climb
        this.vec.y -= this.game.config.climbSpeed;
      } else if (this.game.c.inputter.isDown(this.game.c.inputter.DOWN_ARROW)) {
        // descend
        this.vec.y += this.game.config.climbSpeed;
      }

      this.center.x += this.vec.x;
      this.center.y += this.vec.y * step;

      if (!this._checkOnLadder()) {
        this._exitLadder();
      }

      if (this.vec.y) {
        this.anim.set('climb');
      } else {
        this.anim.set('idleLadder');
      }
    }

    this.anim.update(dt);
  }

  jump() {
    this.vec.y = -this.game.config.jumpSpeed;
    this.grounded = false;
  }

  _enterLadder(ladder) {
    this.state = LADDER_STATE;
    this.vec.x = 0;
    this.vec.y = 0;

    this.center.x = ladder.center.x;
    this.center.y = ladder.center.y;
  }

  _exitLadder() {
    this.state = WALK_STATE;
  }

  _checkOnLadder(): boolean {
    var y;

    if (this.vec.y < 0) {
      // We're climbing, so check if the bottom edge of the player is on a ladder
      y = this.center.y + this.size.y / 2;
    } else if (this.vec.y > 0) {
      // We're descending, so check if the top edge of the player is on a ladder
      y = this.center.y - this.size.y / 2;
    } else {
      y = this.center.y;
    }

    var tile = this.world.getTileAt(Ladder.layerNum, this.center.x, y);
    return tile instanceof Ladder;
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
    var intersect;

    if (this.state === WALK_STATE) {
      if (other instanceof Block) {
        intersect = rectangleIntersection(this, other);

        if (intersect.w > intersect.h) {
          // do y correction
          if (intersect.fromAbove && other.isEdgeCollidable.top) {

            this.center.y -= intersect.h;

            if (this.vec.y > 0) {
              this.grounded = true;
              this.vec.y = 0;
            }
          } else if (other.isEdgeCollidable.bottom) {
            this.center.y += intersect.h;

            if (this.vec.y < 0) {
              this.vec.y = 0;
            }
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

      } else if (other instanceof Platform) {
        intersect = rectangleIntersection(this, other);

        // Ladders can be stood upon
        if (intersect.w > intersect.h && intersect.fromAbove && other.isEdgeCollidable.top) {
          this.center.y -= intersect.h;
          this.vec.y = 0;
          this.grounded = true;
        }
      }
    }
  }
}

module.exports = Player;
