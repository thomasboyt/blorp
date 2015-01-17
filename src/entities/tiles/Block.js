/* @flow */

var TileEntity = require('../TileEntity');

class Block extends TileEntity {
  img: Image;

  isEdgeCollidable: {
    top: boolean;
    left: boolean;
    right: boolean;
    bottom: boolean;
  };

  init(settings: any) {
    this.size = {
      x: 20, y: 20
    };

    this.layerNum = settings.layerNum;
    this.zindex = this.layerNum;

    this.center = this.getCenter(settings.tileX, settings.tileY);
    this.img = this.game.assets.images.block;
    this.isEdgeCollidable = settings.isEdgeCollidable;
  }

  draw(ctx: any) {
    var img = this.img;

    var x = this.center.x - this.size.x / 2;
    var y = this.center.y - this.size.y / 2;

    ctx.drawImage(img, x, y);
  }
}

module.exports = Block;
