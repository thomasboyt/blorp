/* @flow */

var Entity = require('./Entity');

type Coordinates = {
  x: number;
  y: number;
};

class TileEntity extends Entity {
  getCenter(tileX: number, tileY: number): Coordinates {
    var tileH = this.game.tileHeight;
    var tileW = this.game.tileWidth;

    return {
      x: (tileX * this.size.x) + (this.size.x / 2),
      y: (tileY * this.size.y) + (this.size.y / 2)
    };
  }
}

module.exports = TileEntity;
