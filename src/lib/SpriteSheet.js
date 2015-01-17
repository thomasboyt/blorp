/* @flow */

var Sprite = require('./Sprite');

class SpriteSheet {
  img: Image;
  spriteWidth: number;
  spriteHeight: number;

  constructor(img: Image, spriteWidth: number, spriteHeight: number) {
    this.img = img;
    this.spriteWidth = spriteWidth;
    this.spriteHeight = spriteHeight;
  }

  get(num: number): Sprite {
    var x = num * this.spriteWidth;

    var row = 0;
    while (x > (this.img.width - this.spriteWidth)) {
      row++;
      x -= this.img.width;
    }

    return new Sprite(this.img, x, row * this.spriteHeight, this.spriteWidth, this.spriteHeight);
  }
}

module.exports = SpriteSheet;
