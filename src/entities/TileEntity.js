/* @flow */

var Entity = require('./Entity');

type Coordinates = {
  x: number;
  y: number;
};

class TileEntity extends Entity {
  layerNum: number;

  getCenter(tileX: number, tileY: number): Coordinates {
    var tileH = this.game.tileHeight;
    var tileW = this.game.tileWidth;

    return {
      x: (tileX * tileW) + (tileW / 2),
      y: (tileY * tileH) + (tileH / 2)
    };
  }
}

module.exports = TileEntity;
