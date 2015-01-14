/* @flow */

var TileEntity = require('./TileEntity');

class Block extends TileEntity {
  init(settings: any) {
    this.size = {
      x: 20, y: 20
    };

    this.center = this.getCenter(settings.tileX, settings.tileY);
    this.img = this.game.assets.images.block;
  }

  draw(ctx: any) {
    var img = this.img;

    var x = this.center.x - this.size.x / 2;
    var y = this.center.y - this.size.y / 2;

    ctx.drawImage(img, x, y);
  }
}

module.exports = Block;
