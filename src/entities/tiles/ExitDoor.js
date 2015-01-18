/* @flow */

var TileEntity = require('../TileEntity');

class ExitDoor extends TileEntity {
  img: Image;

  init(settings: any) {
    this.size = {
      x: 12, y: 20
    };

    super(settings);

    this.img = this.game.assets.images.exitDoor;
  }

  draw(ctx: any) {
    var img = this.img;

    var x = this.center.x - this.size.x / 2;
    var y = this.center.y - this.size.y / 2;

    ctx.drawImage(img, x, y);
  }
}

ExitDoor.layerNum = 1;

module.exports = ExitDoor;
