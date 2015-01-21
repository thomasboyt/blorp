/* @flow */

var Entity = require('./Entity');
var Bullet = require('./Bullet');
var SpriteSheet = require('../lib/SpriteSheet');
var AnimationManager = require('../lib/AnimationManager');
var math = require('../lib/math');

class Blat extends Entity {
  img: Image;
  anim: AnimationManager;

  _lastPtx: number;
  _lastPty: number;

  vec: {
    x: number;
    y: number;
  };

  init(settings: any) {
    this.center = settings.center;
    this.size = {x: 23, y: 10};
    this.vec = {x: 0, y: 0};
    this.zindex = 105;

    var sheet = new SpriteSheet(this.game.assets.images.blatSheet, this.size.x, this.size.y);

    this.anim = new AnimationManager('flying', {
      flying: {
        sheet: sheet,
        frames: [0, 1, 2, 3],
        frameLengthMs: this.game.config.blatFlyAnimMs
      }
    });
  }

  // TODO: don't update path per frame, throttle it a bit!
  update(dt: number) {
    var step = dt/100;

    var spd = this.game.config.blatSpeed * step;

    // Find a path from us to the player
    var btx = Math.floor(this.center.x / this.game.tileWidth);
    var bty = Math.floor(this.center.y / this.game.tileWidth);

    var playerCenter = this.game.currentWorld.getPlayer().center;
    var ptx = Math.floor(playerCenter.x / this.game.tileWidth);
    var pty = Math.floor(playerCenter.y / this.game.tileHeight);

    var path = this.game.currentWorld.findPath({x: btx, y: bty}, {x: ptx, y: pty});

    // fly toward the next target in the path
    var next = path[1];

    if (next === undefined) {
      // No path could be found, so use previous player coords
      path = this.game.currentWorld.findPath({x: btx, y: bty}, {x: this._lastPtx, y: this._lastPty});
      next = path[1];
    } else {
      this._lastPtx = ptx;
      this._lastPty = pty;
    }

    var vec;

    if (next === undefined) {
      // If we STILL don't have a set next, that means that the player has been found,
      // and we can just hang out until they are dead
      next = path[0];

      vec = {x: 0, y: 0};
    } else {
      var nx = next[0] * this.game.tileWidth + (this.game.tileWidth / 2);
      var ny = next[1] * this.game.tileHeight + (this.game.tileHeight / 2);

      // angle between us and the player
      var angle = Math.atan2(ny - this.center.y, nx - this.center.x);
      vec = math.calcVector(spd, angle);
    }

    this.center.x += vec.x;
    this.center.y += vec.y;

    this.anim.update(dt);
  }

  draw(ctx: any) {
    var sprite = this.anim.getSprite();

    var destX = this.center.x - sprite.width / 2;
    var destY = this.center.y - sprite.height / 2;

    sprite.draw(ctx, destX, destY);
  }

  collision(other: Entity) {
    if (other instanceof Bullet) {
      this.game.c.entities.destroy(this);
      this.game.c.entities.destroy(other);
    }
  }
}

module.exports = Blat;
