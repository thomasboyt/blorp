/* @flow */

var TileEntity = require('../TileEntity');

class Ladder extends TileEntity {
  img: Image;

  init(settings: any) {
    this.size = {
      x: 20, y: 20
    };

    super(settings);

    this.img = this.game.assets.images.ladder;
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
