/* @flow */

var TileEntity = require('../TileEntity');

class Ladder extends TileEntity {
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
    this.img = this.game.assets.images.ladder;
    this.isEdgeCollidable = settings.isEdgeCollidable;
  }

  draw(ctx: any) {
    var img = this.img;

    var x = this.center.x - this.size.x / 2;
    var y = this.center.y - this.size.y / 2;

    ctx.drawImage(img, x, y);
  }
}

Ladder.layerNum = 1;

module.exports = Ladder;
