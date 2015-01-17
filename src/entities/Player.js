/* @flow */

var Entity = require('./Entity');
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

  // TODO: This causes a breaking circular dependency
  // world: World;
  world: any;

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

    this.world = settings.world;
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

  jump() {
    this.vec.y = -this.game.config.jumpSpeed;
  }

  update(dt: number) {
    if (this.state === WALK_STATE) {
      this._updateWalking(dt);
    } else if (this.state === LADDER_STATE) {
      this._updateOnLadder(dt);
    }

    this.anim.update(dt);
  }

  _updateWalking(dt: number) {
    var step = dt/100;

    // TODO: Does this allow you to double jump if you jump at the peak of an arc?
    var grounded = this.vec.y === 0;

    // Zero out x velocity, since it doesn't have any form of (de)acceleration
    this.vec.x = 0;

    // Up button has several meanings depending on context (what you're standing in front of)
    if (this.game.c.inputter.isPressed(this.game.c.inputter.UP_ARROW)) {
      var tileBehind = this.world.getTileAt(Ladder.layerNum, this.center.x, this.center.y);

      if (tileBehind instanceof Ladder) {
        this._enterLadder(dt, tileBehind);
        return;
      } else if (grounded) {
        this.jump();
      }
    }

    if (this.game.c.inputter.isPressed(this.game.c.inputter.DOWN_ARROW)) {
      if (grounded) {
        var yBelow = this.center.y + this.game.tileHeight;
        var tileBelow = this.world.getTileAt(Ladder.layerNum, this.center.x, yBelow);

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

    if (this.vec.x && grounded) {
      this.anim.set('walk');
    } else {
      this.anim.set('stand');
    }
  }

  _updateOnLadder(dt: number) {
    var step = dt/100;

    if (this.game.c.inputter.isPressed(this.game.c.inputter.LEFT_ARROW)) {
      this._exitLadder(dt);
      return;
    } else if (this.game.c.inputter.isPressed(this.game.c.inputter.RIGHT_ARROW)) {
      this._exitLadder(dt);
      return;
    }

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

  _enterLadder(dt: number, ladder: Ladder, fromAbove: ?boolean) {
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

          // Player is falling into a block from above
          if (intersect.fromAbove && other.isEdgeCollidable.top) {
            this.center.y -= intersect.h;

            // Zero out player velocity when they hit the block, and set grounded
            if (this.vec.y > 0) {
              this.vec.y = 0;
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
        }
      }
    }
  }
}

module.exports = Player;
