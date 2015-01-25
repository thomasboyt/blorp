/* @flow */

var Entity = require('./Entity');
var Timer = require('../lib/Timer');

class TimerExtendPickup extends Entity {
  img: Image;

  timeToLive: number;
  destroyTimer: Timer;

  blinkOff: boolean;
  lastBlink: number;

  init(settings: any) {
    this.center = settings.center;
    this.size = {x: 15, y: 15};
    this.zindex = this.game.config.zIndexes.timeExtend;

    this.img = this.game.assets.images.clock;

    this.timeToLive = settings.timeToLive;
    this.destroyTimer = new Timer(settings.timeToLive);

    this.lastBlink = Date.now();
    this.blinkOff = false;
  }

  draw(ctx: any) {
    if (this.blinkOff) {
      return;
    }

    var img = this.img;

    var x = Math.floor(this.center.x - this.size.x / 2);
    var y = Math.floor(this.center.y - this.size.y / 2);

    ctx.drawImage(img, x, y);
  }

  update(dt: number) {
    this.destroyTimer.update(dt);

    // Toggle blink if close to expiring
    if (this.destroyTimer.elapsed() > this.timeToLive - 3000) {
      var now = Date.now();
      if (now > this.lastBlink + 350) {
        this.lastBlink = now;
        this.blinkOff = !this.blinkOff;
      }
    }

    if (this.destroyTimer.expired()) {
      this.game.c.entities.destroy(this);
    }
  }
}

module.exports = TimerExtendPickup;
