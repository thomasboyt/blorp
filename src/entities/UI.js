/*
 * @flow
 * Displays the current UI for any given game state.
 */

var Entity = require('./Entity');
var SpriteSheet = require('../lib/SpriteSheet');
var Sprite = require('../lib/Sprite');

var palette = {
  lighter: '#CEE682',
  light: '#9FBB32',
  dark: '#426E2B',
  darker: '#193725'
};

class UI extends Entity {
  playerSprite: Sprite;

  init(settings: any) {
    this.zindex = 999;

    // TODO: move SpriteSheets to the assets hash so they can be shared
    var playerSheet = new SpriteSheet(this.game.assets.images.playerSheet, this.game.tileWidth, this.game.tileHeight);
    this.playerSprite = playerSheet.get(0);
  }

  drawPlaying(ctx: any) {
    if (this.game.session.isInLevel()) {
      this._drawFuel(ctx);
      this._drawLives(ctx);
    }
  }

  _drawFuel(ctx: any) {
    var img = this.game.assets.images.fuel;
    ctx.drawImage(img, 25, 23, 16, 24);

    ctx.font = '16px "Press Start 2P"';
    var fuelLeft = this.game.session.fuelNeeded - this.game.session.currentFuel;
    if (fuelLeft === 0) {
      fuelLeft = 'FUELED!';
    }
    ctx.fillText(fuelLeft, 50, 48);
  }

  _drawLives(ctx: any) {
    var sprite = this.playerSprite;
    sprite.draw(ctx, 325, 28);

    ctx.font = '16px "Press Start 2P"';
    var lives = this.game.session.currentLives;
    ctx.fillText(lives, 350, 48);
  }

  drawGameOver(ctx: any) {
    ctx.font = '16px "Press Start 2P"';
    ctx.textAlign = "center";

    ctx.fillText('game over', 200, 180);
    ctx.fillText('press space', 200, 200);
    ctx.fillText('to play again', 200, 220);
  }

  draw(ctx: any) {
    ctx.strokeStyle = palette.darker;
    ctx.fillStyle = palette.darker;

    var fsm = this.game.fsm;

    if (fsm.is('playing')) {
      this.drawPlaying(ctx);
    } else if (fsm.is('gameOver')) {
      this.drawGameOver(ctx);
    }

  }
}

module.exports = UI;
