/* @flow */

var TileEntity = require('../TileEntity');

class Spikes extends TileEntity {
  img: Image;
  topY: number;

  init(settings: any) {
    this.size = {
      x: 20,
      y: 3
    };

    super(settings);

    // Spikes are bottom-aligned in their tile
    var topY = settings.tileY * this.game.tileHeight;
    this.center.y = topY + this.game.tileHeight - this.size.y / 2;
    this.topY = topY;

    this.img = this.game.assets.images.spikes;
  }

  draw(ctx: any) {
    var img = this.img;

    var x = this.center.x - this.size.x / 2;
    var y = this.topY;

    ctx.drawImage(img, x, y);
  }
}

module.exports = Spikes;
