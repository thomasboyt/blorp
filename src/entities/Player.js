/* @flow */

var Entity = require('./Entity');
var Block = require('./tiles/Block');
var Ladder = require('./tiles/Ladder');
var Platform = require('./tiles/Platform');
var Spikes = require('./tiles/Spikes');
var TimerExtendPickup = require('./TimerExtendPickup');

var Blorp = require('./Blorp');
var Blat = require('./Blat');
var Bullet = require('./Bullet');

var rectangleIntersection = require('../lib/math').rectangleIntersection;
var SpriteSheet = require('../lib/SpriteSheet');
var AnimationManager = require('../lib/AnimationManager');

var WALK_STATE = 'walk';
var LADDER_STATE = 'ladder';
var DEAD_STATE = 'dead';

class Player extends Entity {
  img: Image;
  anim: AnimationManager;

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
    this.zindex = 100;

    this.state = WALK_STATE;

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
        frames: [4, 5],
        frameLengthMs: this.game.config.playerWalkAnimMs
      },

      idleLadder: {
        sheet: sheet,
        frames: [6],
        frameLengthMs: null
      },

      dead: {
        sheet: sheet,
        frames: [null, 2],
        frameLengthMs: 200
      }
    });
  }

  jump() {
    this.vec.y = -this.game.config.jumpSpeed;
  }

  _shoot() {
    this.game.createEntity(Bullet, {
      creator: this,
      direction: this.facingLeft ? 'left' : 'right',  // TODO: shoot up/down?
      speed: 15
    });
  }

  update(dt: number) {
    if (this.state === WALK_STATE) {
      this._updateWalking(dt);
    } else if (this.state === LADDER_STATE) {
      this._updateOnLadder(dt);
    } else if (this.state === DEAD_STATE) {
      this._updateDead(dt);
    }

    this.anim.update(dt);
  }

  _updateWalking(dt: number) {
    var step = dt/100;

    // TODO: Does this allow you to double jump if you jump at the peak of an arc?
    if (this.vec.y !== 0) {
      this.grounded = false;
    }

    // Zero out x velocity, since it doesn't have any form of (de)acceleration
    this.vec.x = 0;

    // Up button has several meanings depending on context (what you're standing in front of)
    if (this.game.c.inputter.isPressed(this.game.c.inputter.UP_ARROW)) {
      var tileBehind = this.game.currentWorld.getTileAt(Ladder.layerNum, this.center.x, this.center.y);

      if (tileBehind instanceof Ladder) {
        this._enterLadder(dt, tileBehind);
        return;
      }
    }

    if (this.game.c.inputter.isPressed(this.game.c.inputter.Z)) {
      if (this.grounded) {
        this.jump();
      }
    }

    if (this.game.c.inputter.isPressed(this.game.c.inputter.X)) {
      this._shoot();
    }

    if (this.game.c.inputter.isPressed(this.game.c.inputter.DOWN_ARROW)) {
      if (this.grounded) {
        var yBelow = this.center.y + this.game.tileHeight;
        var tileBelow = this.game.currentWorld.getTileAt(Ladder.layerNum, this.center.x, yBelow);

        if (tileBelow instanceof Ladder) {
          this._enterLadder(dt, tileBelow, true);
          return;
        }
      }
    }

    // Handle left/right movement
    var spd = this.game.config.playerSpeed ;

    if (this.game.c.inputter.isDown(this.game.c.inputter.LEFT_ARROW)) {
      this.vec.x = -spd;
      this.facingLeft = true;
    } else if (this.game.c.inputter.isDown(this.game.c.inputter.RIGHT_ARROW)) {
      this.vec.x = spd;
      this.facingLeft = false;
    }

    this.vec.y += this.game.config.gravityAccel;

    this.center.x += this.vec.x * step;
    this.center.y += this.vec.y * step;

    if (this.vec.x && this.grounded) {
      this.anim.set('walk');
    } else {
      this.anim.set('stand');
    }
  }

  _updateOnLadder(dt: number) {
    var step = dt/100;

    // TODO: left/right exits off ladders have been disabled until collision detection is better
    // if (this.game.c.inputter.isPressed(this.game.c.inputter.LEFT_ARROW) ||
    //     this.game.c.inputter.isPressed(this.game.c.inputter.RIGHT_ARROW)) {
    //   if (this._canExitLadder()) {
    //     this._exitLadder(dt);
    //     return;
    //   }
    // }

    this.vec.y = 0;

    if (this.game.c.inputter.isDown(this.game.c.inputter.UP_ARROW)) {
      // climb
      this.vec.y -= this.game.config.climbSpeed;
    } else if (this.game.c.inputter.isDown(this.game.c.inputter.DOWN_ARROW)) {
      // descend
      this.vec.y += this.game.config.climbSpeed;
    }

    this.center.y += this.vec.y * step;

    if (!this._checkOnLadder()) {
      this._exitLadder(dt);
      return;
    }

    if (this.vec.y) {
      this.anim.set('climb');
    } else {
      this.anim.set('idleLadder');
    }
  }

  _enterLadder(dt: number, ladder: Ladder, fromAbove?: boolean) {
    this.state = LADDER_STATE;
    this.vec.x = 0;
    this.vec.y = 0;

    this.center.x = ladder.center.x;

    if (fromAbove) {
      this.center.y = this.center.y + 12;
    } else {
      this.center.y = ladder.center.y;
    }

    this._updateOnLadder(dt);
  }

  _exitLadder(dt: number) {
    this.state = WALK_STATE;
    this._updateWalking(dt);
  }

  _checkOnLadder(): boolean {
    // Check that player's bottom edge is on a ladder
    var y = this.center.y + this.size.y / 2;
    var bottomEdgeTile = this.game.currentWorld.getTileAt(Ladder.layerNum, this.center.x, y);

    // Check that the player's center is on a ladder
    var centerTile = this.game.currentWorld.getTileAt(Ladder.layerNum, this.center.x, this.center.y);

    return (bottomEdgeTile instanceof Ladder && centerTile instanceof Ladder);
  }

  _updateDead(dt: number) {
    this.anim.set('dead');
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

          // Player is falling into a block from above
          if (intersect.fromAbove && other.isEdgeCollidable.top) {
            this.center.y -= intersect.h;

            // Zero out player velocity when they hit the block, and set grounded
            if (this.vec.y > 0) {
              this.vec.y = 0;
              this.grounded = true;
            }

          // Player is rising into a block from below
          } else if (other.isEdgeCollidable.bottom) {
            this.center.y += intersect.h;

            // Zero out player velocity when they bump their head
            if (this.vec.y < 0) {
              this.vec.y = 0;
            }
          }

        } else {
          // Player is colliding with the block from the left
          if (intersect.fromLeft && other.isEdgeCollidable.left) {
            this.center.x -= intersect.w;

          // Player is colliding with the block from the right
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

    if (other instanceof Blorp || other instanceof Spikes || other instanceof Blat) {
      if (this.game.godMode) {
        return;
      }

      if (this.state !== DEAD_STATE) {
        this.state = DEAD_STATE;

        // TODO: move this to a Timer inside updateDead()
        setTimeout(() => {
          this.game.died();
        }, 2000);
      }
    }

    if (other instanceof TimerExtendPickup) {
      this.game.timeLeft += other.timeAdded;
      this.game.c.entities.destroy(other);
    }
  }
}

module.exports = Player;
