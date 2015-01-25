/* @flow */

var StarfieldEntity = require('./StarfieldEntity');

var palette = {
  lighter: '#CEE682',
  light: '#9FBB32',
  dark: '#426E2B',
  darker: '#193725'
};

class TitleScreen extends StarfieldEntity {
  init(settings: any) {
    this.initStarfield();
  }

  update(dt: number) {
    this.updateStarfield(dt);
  }

  draw(ctx: any) {
    // draw background
    this.drawStarfield(ctx);

    ctx.fillStyle = palette.lighter;

    ctx.textAlign = 'center';

    ctx.font = '40px "Press Start 2P"';
    ctx.fillText('BLORP', 210, 150);

    ctx.font = '16px "Press Start 2P"';
    ctx.fillText('the journey home', 210, 180);

    var offset = 250;

    ctx.fillText('arrows move', 200, offset);
    ctx.fillText('z jumps / x shoots', 200, offset + 20);
    ctx.fillText("press space to start", 200, offset + 40);
  }
}

module.exports = TitleScreen;
