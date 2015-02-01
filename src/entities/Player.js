/* @flow */

var _ = require('lodash');
var Maths = require('coquette').Collider.Maths;
var Timer = require('../lib/Timer');

var Entity = require('./Entity');
var Ladder = require('./tiles/Ladder');
var Spikes = require('./tiles/Spikes');
var FuelPickup = require('./FuelPickup');

var Blorp = require('./Blorp');
var Blat = require('./Blat');
var Bullet = require('./Bullet');
var Ship = require('./Ship');

var SpriteSheet = require('../lib/SpriteSheet');
var AnimationManager = require('../lib/AnimationManager');
var PlatformerPhysicsEntity = require('./PlatformerPhysicsEntity');

var WALK_STATE = 'walk';
var LADDER_STATE = 'ladder';
var DEAD_STATE = 'dead';

class Player extends PlatformerPhysicsEntity {
  img: Image;
  anim: AnimationManager;
  shotThrottleTimer: Timer;

  facingLeft: boolean;

  state: string;

  init(settings: any) {
    this.center = settings.center;
    this.size = {x: 11, y: 20};

    this.vec = {x: 0, y: 0};
    this.zindex = this.game.config.zIndexes.player;

    this.state = WALK_STATE;

    this.facingLeft = false;

    this.shotThrottleTimer = new Timer(this.game.config.fireThrottleMs);
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

  getFootBox(): any  { // BoundingBox, see lib/math.js
    return {
      center: {
        x: this.center.x,
        y: this.center.y + 8
      },
      size: {
        x: this.size.x,
        y: 4
      }
    };
  }

  jump() {
    this.vec.y = -this.game.config.jumpSpeed;
    this.currentElevator = null;
  }

  _shoot() {
    if (this.shotThrottleTimer.expired()) {
      this.shotThrottleTimer.reset();

      var direction = this.facingLeft ? 'left' : 'right';

      if (this.game.c.inputter.isDown(this.game.c.inputter.UP_ARROW)) {
        direction = 'up';
      }

      this.game.createEntity(Bullet, {
        creator: this,
        direction: direction,
        speed: 15
      });
    }
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
    this.shotThrottleTimer.update(dt);

    var step = dt/100;

    if (this.vec.y !== 0 && !this.currentElevator) {
      this.grounded = false;
    }

    if (this.center.y + this.size.y / 2 > this.game.session.currentWorld.height) {
      this._enterDead();
    }

    // Zero out x velocity, since it doesn't have any form of (de)acceleration
    this.vec.x = 0;

    // Up button has several meanings depending on context (what you're standing in front of)
    if (this.game.c.inputter.isPressed(this.game.c.inputter.UP_ARROW)) {
      var tileBehind = this.game.session.currentWorld.getTileAt(Ladder.layerNum, this.center.x, this.center.y);

      if (tileBehind instanceof Ladder) {
        this._enterLadder(dt, tileBehind);
        return;
      }

      // Standing in front of ship - fly away!
      if (this.game.session.exitEnabled) {
        var exit = this.game.c.entities.all(Ship)[0];

        if (Maths.unrotatedRectanglesIntersecting(this, exit)) {
          this.game.session.escape();
          this.game.c.entities.destroy(this);
          return;
        }
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
        var tileBelow = this.game.session.currentWorld.getTileAt(Ladder.layerNum, this.center.x, yBelow);

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

    this.updateElevator();

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
    var bottomEdgeTile = this.game.session.currentWorld.getTileAt(Ladder.layerNum, this.center.x, y);

    // Check that the player's center is on a ladder
    var centerTile = this.game.session.currentWorld.getTileAt(Ladder.layerNum, this.center.x, this.center.y);

    return (bottomEdgeTile instanceof Ladder && centerTile instanceof Ladder);
  }

  _updateDead(dt: number) {
    this.anim.set('dead');
  }

  _enterDead() {
    this.state = DEAD_STATE;
    this.vec.x = 0;
    this.vec.y = 0;
    this.game.session.died();
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
    if (this.state === WALK_STATE) {
      this.handlePlatformerCollision(other);
    }

    if (other instanceof Blorp || other instanceof Spikes || other instanceof Blat) {
      if (this.game.godMode) {
        return;
      }

      if (this.state !== DEAD_STATE) {
        this._enterDead();
      }
    }

    if (other instanceof FuelPickup) {
      this.game.session.gotFuel();
      this.game.c.entities.destroy(other);
    }

  }
}

module.exports = Player;
