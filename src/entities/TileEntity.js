/* @flow */

var Entity = require('./Entity');

type Coordinates = {
  x: number;
  y: number;
};

class TileEntity extends Entity {
  layerNum: number;

  isEdgeCollidable: {
    top: boolean;
    left: boolean;
    right: boolean;
    bottom: boolean;
  };

  init(settings: any) {
    this.layerNum = settings.layerNum;
    this.zindex = this.layerNum;
    this.center = this._getCenter(settings.tileX, settings.tileY);
    this.isEdgeCollidable = settings.isEdgeCollidable;
  }

  _getCenter(tileX: number, tileY: number): Coordinates {
    var tileH = this.game.tileHeight;
    var tileW = this.game.tileWidth;

    return {
      x: (tileX * tileW) + (this.size.x / 2),
      y: (tileY * tileH) + (this.size.y / 2)
    };
  }
}

module.exports = TileEntity;
