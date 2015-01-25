/* @flow */

var Entity = require('./Entity');

class Ship extends Entity {
  img: Image;
  flyingImg: Image;
  flying: boolean;

  init(settings: any) {
    this.center = settings.center;
    this.size = {x: 30, y: 20};
    this.flying = false;

    // TODO: creating an object currently tries to adjust its center for a 20x20 tile
    this.center.x += this.game.tileWidth / 2;

    this.img = this.game.assets.images.exitShip;
    this.flyingImg = this.game.assets.images.flyingShip;

    this.zindex = this.game.config.zIndexes.exit;
  }

  fly() {
    this.flying = true;
  }

  update(dt: number) {
    var spd = dt/100 * 5;

    if (this.flying) {
      this.zindex = this.game.config.zIndexes.flyingShip;

      this.center.x += spd*2;
      this.center.y -= spd;
    }
  }

  draw(ctx: any) {
    var img = this.img;

    if (this.flying) {
      img = this.flyingImg;
    }

    var x = this.center.x - img.width / 2;
    var y = this.center.y - img.height / 2;

    ctx.drawImage(img, x, y);
  }
}

module.exports = Ship;
