/*
 * @flow
 * Displays the current UI for any given game state.
 */

var Entity = require('./Entity');
var AvgTick = require('../lib/AvgTick');

class UI extends Entity {
  avgTick: AvgTick;

  init(settings: any) {
    this.zindex = 999;
    this.avgTick = new AvgTick(100);
  }

  drawAttract(ctx: any) {
    ctx.textAlign = 'center';

    ctx.font = '40px "Press Start 2P"';
    ctx.fillText('BLORP!', 210, 150);

    var offset = 250;

    ctx.font = '16px "Press Start 2P"';
    ctx.fillText('arrows move', 200, offset);
    ctx.fillText('z jumps / x shoots', 200, offset + 20);
    ctx.fillText("press space to start", 200, offset + 40);
  }

  drawPlaying(ctx: any) {
    this._drawFps(ctx);

    if (this.game.session.levelEnded) {
      ctx.textAlign = 'center';
      ctx.font = '32px "Press Start 2P"';
      ctx.fillText('you escaped', 200, 220);

      ctx.font = '16px "Press Start 2P"';
      ctx.fillText('press space to continue', 200, 240);
    } else {
      this._drawFuelBar(ctx);
    }
  }

  _drawFuelBar(ctx: any) {
    var fuelNeeded = this.game.session.fuelNeeded;
    var fuel = this.game.session.currentFuel;

    var percent = fuel / fuelNeeded;
    percent = (percent > 1) ? 1 : percent;

    this._drawBar(ctx, percent, 150, 25, 100, 20);
  }

  drawDead(ctx: any) {
    ctx.font = '16px "Press Start 2P"';
    ctx.textAlign = "center";

    var reason = this.game.timeLeft < 0 ? 'out of time :(' : 'you died :(';
    ctx.fillText(reason, 200, 180);
    ctx.fillText('press space', 200, 200);
    ctx.fillText('to retry...', 200, 220);
  }

  drawLoading(ctx: any) {
    this._drawLoadingBar(ctx);
  }

  _drawLoadingBar(ctx: any) {
    var numTotal = this.game.preloader.numTotal;
    var numLoaded = this.game.preloader.numLoaded;

    this._drawBar(ctx, numLoaded / numTotal, 150, 200, 100, 20);
  }

  _drawBar(ctx: any, fillPercent: number, x: number, y: number, width: number, height: number) {
    var barWidth = width * fillPercent;

    ctx.strokeRect(x, y, width, height);
    ctx.fillRect(x, y, barWidth, height);
  }

  _drawFps(ctx: any) {
    var fps = Math.round(1000 / this.avgTick.get());

    ctx.fillStyle = 'black';
    ctx.font = '8px "Press Start 2P"';
    ctx.textAlign = 'right';
    ctx.fillText(fps, this.game.width - 5, 10);
  }

  draw(ctx: any) {
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';

    var viewCenter = this.game.c.renderer.getViewCenter();
    var viewTranslate = {
      x: (viewCenter.x - this.game.width / 2),
      y: (viewCenter.y - this.game.height / 2)
    };

    ctx.translate(viewTranslate.x, viewTranslate.y);

    var fsm = this.game.fsm;

    if (fsm.is('playing')) {
      this.drawPlaying(ctx);
    } else if (fsm.is('dead')) {
      this.drawDead(ctx);
    } else if (fsm.is('attract')) {
      this.drawAttract(ctx);
    } else if (fsm.is('loading')) {
      this.drawLoading(ctx);
    }

  }

  update(dt: number) {
    this.avgTick.update(dt);
  }
}

module.exports = UI;
