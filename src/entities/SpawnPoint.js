/* @flow */

var _ = require('lodash');
var Entity = require('./Entity');
var Blorp = require('./Blorp');
var Blat = require('./Blat');

class SpawnPoint extends Entity {
  img: Image;
  direction: string;

  init(settings: any) {
    this.center = settings.center;
    this.size = {x: 20, y: 20};
    this.zindex = this.game.config.zIndexes.spawnPoint;

    this.direction = settings.properties.direction;

    this.img = this.game.assets.images.exitDoor;
  }

  spawnBlorp() {
    var Type = _.sample([Blat, Blorp]);

    this.game.createEntity(Type, {
      center: {
        x: this.center.x,
        y: this.center.y
      },
      direction: this.direction
    });
  }

  draw(ctx: any) {
    var img = this.img;

    var x = this.center.x - this.size.x / 2;
    var y = this.center.y - this.size.y / 2;

    ctx.drawImage(img, x, y);
  }
}

module.exports = SpawnPoint;
