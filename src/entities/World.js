/* @flow */

var Entity = require('./Entity');
var Player = require('./Player');
var Level = require('../Level');

class World extends Entity {
  width: number;
  height: number;

  init(settings: any) {
    var level: Level = settings.level;
    this._createEntities(level);

    this.width = level.tileMap[0].length * this.game.tileWidth;
    this.height = level.tileMap.length * this.game.tileHeight;
  }

  _createEntities(level: Level) {
    level.tileMap.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile === 0) { return; }

        var Type = level.getEntityTypeForTile(tile);

        this.game.createEntity(Type, {
          tileX: x,
          tileY: y
        });
      });
    });
  }

  draw(ctx: any) {
    var player = this.game.c.entities.all(Player)[0];
    this.game.c.renderer.setViewCenter(player.center);
  }
}

module.exports = World;
