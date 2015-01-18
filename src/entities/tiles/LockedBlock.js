/* @flow */

var Block = require('./Block');

class LockedBlock extends Block {
  init(settings: any) {
    super(settings);

    this.img = this.game.assets.images.lockedBlock;
  }
}

module.exports = LockedBlock;
