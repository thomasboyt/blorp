/* @flow */

var Sprite = require('./Sprite');

class SpriteSheet {
  img: Image;
  xOffset: number;

  constructor(img: Image, xOffset: number) {
    this.img = img;
    this.xOffset = xOffset;
  }

  get(num: index): Sprite {
    return new Sprite(this.img, num * this.xOffset, 0, this.xOffset, this.img.height);
  }
}

module.exports = SpriteSheet;
