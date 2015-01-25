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
    // TODO: spritesheet these
    'block': require('../../assets/images/block.png'),
    'platform': require('../../assets/images/platform.png'),
    'ladder': require('../../assets/images/ladder.png'),
    'exitDoor': require('../../assets/images/exit_door.png'),
    'spikes': require('../../assets/images/spikes.png'),
    'fuel': require('../../assets/images/fuel.png'),

    'playerSheet': require('../../assets/images/player_sheet.png'),
    'blorpSheet': require('../../assets/images/blorp_sheet.png'),
    'blatSheet': require('../../assets/images/blat_sheet.png'),

    'exitShip': require('../../assets/images/ship.png'),
    'flyingShip': require('../../assets/images/ship_flying.png'),
  },

  tileset: require('../../assets/tiles.tsx'),

  levels: {
    'arena': require('../../assets/levels/arena.tmx'),
    '2': require('../../assets/levels/2.tmx')
  }
};
