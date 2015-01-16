/*
 * Maps of the audio and images included in your game. Webpack resolves the require statements
 * here to being URLs to your assets. These URLs are then loaded into the game through the
 * `AssetPreloader` class.
 *
 * This file is purposely not type-checked! Flow does not like non-JS imports.
 */

module.exports = {
  audio: {
  },
  images: {
    'block': require('../../assets/images/block.png'),
    'ladder': require('../../assets/images/ladder.png'),
    'playerSheet': require('../../assets/images/player_sheet.png'),
    'blorpSheet': require('../../assets/images/blorp_sheet.png')
  },
  levels: {
    '1-1': require('../../assets/levels/1-1.tmx')
  }
};
