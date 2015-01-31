/*
 * @flow
 * Displays the current UI while loading. Kept separate because the regular UI may rely on loaded
 * assets.
 */

var Entity = require('./Entity');

var palette = {
  lighter: '#CEE682',
  light: '#9FBB32',
  dark: '#426E2B',
  darker: '#193725'
};

class LoadingUI extends Entity {
  init(settings: any) {
    this.zindex = 999;
  }

  drawLoading(ctx: any) {
    var numTotal = this.game.preloader.numTotal;
    var numLoaded = this.game.preloader.numLoaded;

    this._drawBar(ctx, numLoaded / numTotal, 150, 200, 100, 20);
  }

  _drawBar(ctx: any, fillPercent: number, x: number, y: number, width: number, height: number) {
    var barWidth = width * fillPercent;

    ctx.strokeRect(x, y, width, height);
    ctx.fillRect(x, y, barWidth, height);
  }

  draw(ctx: any) {
    ctx.strokeStyle = palette.darker;
    ctx.fillStyle = palette.darker;

    this.drawLoading(ctx);
  }
}

module.exports = LoadingUI;
