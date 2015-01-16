/* @flow */

var Entity = require('./Entity');
var Player = require('./Player');
var Block = require('./Block');
var Level = require('../Level');

class World extends Entity {
  width: number;
  height: number;
  camY: number;

  init(settings: any) {
    var level: Level = settings.level;
    this._createEntities(level);

    this.width = level.tileMap[0].length * this.game.tileWidth;
    this.height = level.tileMap.length * this.game.tileHeight;

    this.camY = this.game.height / 2;
  }

  /*
   * This weird-lookin' method sets `isEdgeCollidable` on created blocks, which denotes whether
   * or not they have an adjacent block on a given side. This prevents collision detection from
   * firing on "seams" between blocks, which causes lots of weird issues.
   *
   * More info: http://gamedev.stackexchange.com/a/29037
   */
  _createBlock(level: Level, x: number, y: number) {
    var row = level.tileMap[y];

    var getTypeAtCoords = (x, y) => {
      var tile = level.tileMap[y][x];
      if (tile === 0) { return null; }
      return level.getEntityTypeForTile(tile);
    };

    var tAbove = y > 0 ? getTypeAtCoords(x, y-1)  : null;
    var tBelow = y < level.tileMap.length - 1 ? getTypeAtCoords(x, y+1) : null;
    var tLeft = x > 0 ? getTypeAtCoords(x-1, y) : null;
    var tRight = x < row.length - 1 ? getTypeAtCoords(x+1, y) : null;

    this.game.createEntity(Block, {
      tileX: x,
      tileY: y,

      isEdgeCollidable: {
        top: tAbove !== Block,
        bottom: tBelow !== Block,
        left: tLeft !== Block,
        right: tRight !== Block
      }
    });
  }

  _createEntities(level: Level) {
    // Create entiies from tiles

    level.tileMap.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile === 0) { return; }

        var Type = level.getEntityTypeForTile(tile);

        if (Type === Block) {
          this._createBlock(level, x, y);
        } else {
          this.game.createEntity(Type, {
            tileX: x,
            tileY: y
          });
        }
      });
    });

    // Create entities from objects
    level.objects.forEach((obj) => {
      this.game.createEntity(obj.Type, {
        center: {
          x: obj.x,
          y: obj.y
        }
      });
    });
  }

  draw(ctx: any) {
    // camY only moves if player is >1/5 screen px above/below it
    var threshold = this.game.height/5;

    var player = this.game.c.entities.all(Player)[0];
    var diff = this.camY - player.center.y;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        this.camY -= diff - threshold;
      } else {
        this.camY -= diff + threshold;
      }
    }

    this.game.c.renderer.setViewCenter({
      x: player.center.x,
      y: this.camY
    });
  }
}

module.exports = World;
