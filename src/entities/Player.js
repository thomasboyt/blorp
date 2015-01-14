/* @flow */

var TileEntity = require('./TileEntity');

class Player extends TileEntity {
  img: Image;

  init(settings: any) {
    this.size = {
      x: 20, y: 20
    };

    this.center = this.getCenter(settings.tileX, settings.tileY);
    this.img = this.game.assets.images.player;
  }

  update(dt: number) {
    var spd = this.game.config.playerSpeed * dt/100;

    if (this.game.c.inputter.isDown(this.game.c.inputter.LEFT_ARROW)) {
      this.center.x -= spd;
    } else if (this.game.c.inputter.isDown(this.game.c.inputter.RIGHT_ARROW)) {
      this.center.x += spd;
    }
  }

  draw(ctx: any) {
    var img = this.img;

    var x = this.center.x - this.size.x / 2;
    var y = this.center.y - this.size.y / 2;

    ctx.drawImage(img, x, y);
  }
}

module.exports = Player;
