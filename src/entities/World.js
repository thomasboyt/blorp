/* @flow */

var _ = require('lodash');
var Entity = require('./Entity');
var Player = require('./Player');
var SpawnPoint = require('./SpawnPoint');
var Block = require('./tiles/Block');
var Platform = require('./tiles/Platform');
var Level = require('../Level');
var Maths = require('coquette').Collider.Maths;
var PF = require('pathfinding');

// TIL flow will not parse 3D arrays
type Tiles = Array<Array<?Entity>>;
type TileLayers = Array<Tiles>;

type Coordinates = {x: number; y: number};

// Get the indicies of every item in array for which cb(item) returns true
function filterIndex(array: Array<any>, cb: (item: any) => boolean): Array<number> {
  var res = [];
  for (var i = 0; i < array.length; i++) {
    if (cb(array[i]) === true) {
      res.push(i);
    }
  }
  return res;
}

class World extends Entity {
  width: number;
  height: number;

  camX: number;
  camY: number;

  level: Level;
  tileLayers: TileLayers;
  objects: Array<Entity>;

  pickupSafeTileLocations: Array<Coordinates>;

  _pfGrid: any;  // TODO: a Grid declaration would be nice
  _lastPtx: number;
  _lastPty: number;

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

    if (col > this.level.getWidth() - 1 || row > this.level.getHeight() - 1 || col < 0 || row < 0) {
      return null;
    }

    return this.tileLayers[layer][row][col];
  }

  getPlayer(): Player {
    return this.game.c.entities.all(Player)[0];
  }

  isInBounds(tileX: number, tileY: number): boolean {
    return tileX < this.tileLayers[0][0].length &&
           tileY < this.tileLayers[0].length;
  }

  /**
   * Accepts a pixel coordinate pair, not tiled
   */
  findPathToPlayer(from: Coordinates): Array<Array<number>> {
    var tx = Math.floor(from.x / this.game.tileWidth);
    var ty = Math.floor(from.y / this.game.tileWidth);

    var player = this.getPlayer();

    if (!player) {
      // player escaped, so use previous player coords
      return this.findPath({x: tx, y: ty}, {x: this._lastPtx, y: this._lastPty});
    }

    var ptx = Math.floor(player.center.x / this.game.tileWidth);
    var pty = Math.floor(player.center.y / this.game.tileHeight);

    var path = this.findPath({x: tx, y: ty}, {x: ptx, y: pty});

    if (path.length === 0) {
      // No path could be found, so use previous player coords
      path = this.findPath({x: tx, y: ty}, {x: this._lastPtx, y: this._lastPty});
    } else {
      this._lastPtx = ptx;
      this._lastPty = pty;
    }

    return path;
  }

  findPath(from: Coordinates, to: Coordinates): Array<Array<number>> {
    var grid = this._pfGrid.clone();
    var finder = new PF.AStarFinder({
      allowDiagonal: true,
      dontCrossCorners: false
    });

    var path;
    try {
      path = finder.findPath(from.x, from.y, to.x, to.y, grid);
    } catch(err) {
      console.error('Error while pathfinding from ' + from.x + ',' + from.y + ' to ' + to.x + ',' + to.y);
      throw err;
    }

    return path;
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
      var entity = this.game.createEntity(obj.Type, {
        // Tiled objects give x, y from bottom left:
        // https://github.com/bjorn/tiled/issues/91
        center: {
          x: obj.x + this.game.tileWidth / 2,
          y: obj.y - this.game.tileHeight / 2
        },
        properties: obj.properties
      });

      if (entity instanceof Player) {
        this._lastPtx = Math.floor(entity.center.x / this.game.tileWidth);
        this._lastPty = Math.floor(entity.center.y / this.game.tileHeight);
      }

      return entity;
    });

    this._pfGrid = this._createPFGrid();

    this.pickupSafeTileLocations = this._findPickupSafeTiles();
  }

  _createPFGrid() {
    var terrainTiles = this.tileLayers[0];

    var grid = new PF.Grid(terrainTiles[0].length, terrainTiles.length);

    for (var y = 0; y < terrainTiles.length; y++) {
      for (var x = 0; x < terrainTiles[0].length; x++) {
        grid.setWalkableAt(x, y, !(terrainTiles[y][x] instanceof Block));
      }
    }

    return grid;
  }

  _findPickupSafeTiles(): Array<Coordinates> {
    // Filter down to only tiles that are:
    //    a. Empty
    //    b. Between 1 & 2 tiles above a Block or Platform
    //    c. Not within 1 tile in any direction of a SpawnPoint

    var terrainTiles = this.tileLayers[0];

    var emptyTileIndices = _.flatten(
      terrainTiles.map((row, y) => {
        return filterIndex(row, (tile) => tile === null)
          .map((x) => [x, y]);
      }),
      true  // shallow flatten
    );

    var spawns = this.objects.filter((object) => object instanceof SpawnPoint);

    var safeTiles = emptyTileIndices.filter((pair) => {
      var [x, y] = pair;

      // Are we 1 to 2 tiles above a Block or Platform?
      var tile1Below = this.isInBounds(x, y+1) && terrainTiles[y+1][x];
      var tile2Below = this.isInBounds(x, y+2) && terrainTiles[y+2][x];

      var aboveSurface = tile1Below instanceof Block || tile1Below instanceof Platform ||
                         tile2Below instanceof Block || tile2Below instanceof Platform;

      if (!aboveSurface) return false;

      // ...this should be better
      var tilesAround = [
        [x - 1, y - 1],
        [x    , y - 1],
        [x + 1, y - 1],
        [x + 1, y    ],
        [x + 1, y + 1],
        [x    , y + 1],
        [x - 1, y - 1],
        [x - 1, y    ]
      ];

      var isNearSpawn = _.some(tilesAround, (coord) => {
        var [tx, ty] = coord;
        var x = tx * this.game.tileHeight;
        var y = ty * this.game.tileWidth;

        return _.some(spawns, (spawn) => {
          // are x and y inside spawn box?
          return Maths.unrotatedRectanglesIntersecting(spawn, {
            size: { x: 1, y: 1 },
            center: { x: x, y: y }
          });
        });
      });

      if (isNearSpawn) {
        return false;
      } else {
        return true;
      }
    });

    return safeTiles.map((pair) => {
      return { x: pair[0], y: pair[1] };
    });
  }

}

module.exports = World;
