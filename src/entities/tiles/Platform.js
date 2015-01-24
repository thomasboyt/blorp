/* @flow */

var TileEntity = require('../TileEntity');

class Platform extends TileEntity {
  img: Image;
  tileY: number;

  init(settings: any) {
    this.size = {
      x: 20, y: 1
    };

    super(settings);

    var topY = settings.tileY * this.game.tileHeight;
    this.center.y = topY + this.size.y / 2;
    this.tileY = settings.tileY;

    this.img = this.game.assets.images.platform;
  }

  draw(ctx: any) {
    // Platform sprite is 20x20 since that makes it easier to place in Tiled

    var img = this.img;

    var x = this.center.x - this.size.x / 2;
    var y = this.tileY * this.game.tileHeight;

    ctx.drawImage(img, x, y);
  }
}

module.exports = Platform;
