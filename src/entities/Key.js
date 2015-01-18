/* @flow */

var Entity = require('./Entity');

class Key extends Entity {
  img: Image;

  init(settings: any) {
    this.center = settings.center;
    this.size = {x: 10, y: 5};
    this.zindex = 100;

    this.img = this.game.assets.images.key;
  }

  draw(ctx: any) {
    var img = this.img;

    var x = this.center.x - this.size.x / 2;
    var y = this.center.y - this.size.y / 2;

    ctx.drawImage(img, x, y);
  }
}

module.exports = Key;
