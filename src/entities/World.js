/* @flow */

var Entity = require('./Entity');
var Player = require('./Player');

class World extends Entity {
  init(settings: any) {
    var level = settings.level;
    this.children = this._createEntities(level);

    this.width = level.tileMap[0].length * this.game.tileWidth;
    this.height = level.tileMap.length * this.game.tileHeight;
  }

  _createEntities(level) {
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
    ctx.fillStyle = '#CEE682';
    ctx.fillRect(0, 0, this.width, this.height);

    var player = this.game.c.entities.all(Player)[0];

    this.game.c.renderer.setViewCenter(player.center);
  }
}

module.exports = World;
