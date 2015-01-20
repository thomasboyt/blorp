/* @flow */

var Entity = require('./Entity');
var Player = require('./Player');
var Block = require('./tiles/Block');
var Level = require('../Level');

// TIL flow will not parse 3D arrays
type Tiles = Array<Array<?Entity>>;  // </>
type TileLayers = Array<Tiles>;  // </>

class World extends Entity {
  width: number;
  height: number;

  camX: number;
  camY: number;

  level: Level;
  tileLayers: TileLayers;
  objects: Array<Entity>;  // </>

  init(settings: any) {
    var level = this.level = settings.level;
    this._createEntities(level);

    this.width = level.getWidth() * this.game.tileWidth;
    this.height = level.getHeight() * this.game.tileHeight;

    this.camX = 0;
    this.camY = 0;
  }

  getTileAt(layer: number, x: number, y: number): ?Entity {
    var row = Math.floor(y / this.game.tileHeight);
    var col = Math.floor(x / this.game.tileWidth);

    return this.tileLayers[layer][row][col];
  }

  getPlayer(): Player {
    return this.game.c.entities.all(Player)[0];
  }

  destroy() {
    this.game.c.entities.destroy(this);

    this.tileLayers.forEach((layer) => layer.forEach((row) => row.forEach((tile) => {
      this.game.c.entities.destroy(tile);
    })));

    this.objects.forEach((obj) => {
      this.game.c.entities.destroy(obj);
    });
  }

  /*
   * This weird-lookin' method sets `isEdgeCollidable` on created entities, which denotes whether
   * or not they have an adjacent entity on a given side. This prevents collision detection from
   * firing on "seams" between entities, which causes lots of weird issues.
   *
   * TODO: currently this just looks for any tile on any side to exist within the same layer. This
   * works, but could get nasty if e.g. more tile types are added to the ladder layer.
   *
   * More info: http://gamedev.stackexchange.com/a/29037
   */
  _createEdgeSafeEntity(level: Level, layerIdx: number, Type: any, x: number, y: number): Entity {

    var getType = level.getEntityTypeForTileCoordinates.bind(level, layerIdx);

    var tAbove = y > 0 ? getType(x, y-1)  : null;
    var tBelow = y < level.getWidth() - 1 ? getType(x, y+1) : null;
    var tLeft = x > 0 ? getType(x-1, y) : null;
    var tRight = x < level.getHeight() - 1 ? getType(x+1, y) : null;

    return this.game.createEntity(Type, {
      tileX: x,
      tileY: y,
      layerNum: layerIdx,

      isEdgeCollidable: {
        top: tAbove === null,
        bottom: tBelow === null,
        left: tLeft === null,
        right: tRight === null
      }
    });
  }

  _createEntities(level: Level) {
    // Create entiies from tiles

    this.tileLayers = level.tileLayers.map((layer, layerIdx) => {
      return layer.map((row, y) => {
        return row.map((tile, x) => {
          if (tile === 0) { return null; }

          var Type = level.getEntityTypeForTile(tile);

          return this._createEdgeSafeEntity(level, layerIdx, Type, x, y);
        });
      });
    });

    // Create entities from objects
    this.objects = level.objects.map((obj) => {
      return this.game.createEntity(obj.Type, {
        // Tiled objects give x, y from bottom left:
        // https://github.com/bjorn/tiled/issues/91
        center: {
          x: obj.x + this.game.tileWidth / 2,
          y: obj.y - this.game.tileHeight / 2
        },
        properties: obj.properties
      });
    });
  }

  _updateCamera() {
    var xThreshold = 5;
    var yThreshold = 25;

    var player = this.getPlayer();

    if (!player) {
      return;
    }

    var xDiff = this.camX - player.center.x;

    if (Math.abs(xDiff) > xThreshold) {
      var mult = xDiff > 0 ? -1 : 1;
      this.camX -= xDiff + mult * xThreshold;
    }

    var yDiff = this.camY - player.center.y;

    if (Math.abs(yDiff) > yThreshold) {
      var mult = yDiff > 0 ? -1 : 1;
      this.camY -= yDiff + mult * yThreshold;
    }

    this.game.c.renderer.setViewCenter({
      x: this.camX,
      y: this.camY
    });
  }

  update(dt: number) {
    // this._updateCamera();
  }
}

module.exports = World;
