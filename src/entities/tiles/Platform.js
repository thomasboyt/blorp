/* @flow */

var TileEntity = require('../TileEntity');

class Platform extends TileEntity {
  img: Image;

  init(settings: any) {
    this.size = {
      x: 20, y: 20
    };

    super(settings);

    this.img = this.game.assets.images.platform;
  }

  draw(ctx: any) {
    var img = this.img;

    var x = this.center.x - this.size.x / 2;
    var y = this.center.y - this.size.y / 2;

    ctx.drawImage(img, x, y);
  }
}

module.exports = Platform;
