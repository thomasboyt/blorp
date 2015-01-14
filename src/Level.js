/* @flow */

var Entity = require('./entities/Entity');

var ENTITY_TYPES = {
  'Block': require('./entities/Block'),
  'Player': require('./entities/Player'),
  'Blorp': require('./entities/Blorp')
};

class Level {
  tileNames: {
    [key:number]: Entity
  };

  tileMap: Array<Array<number>>;  // </>

  constructor(level: string) {
    var tileNames = {};
    var tileMap;

    var parser = new DOMParser();
    var doc = parser.parseFromString(level, 'application/xml');

    var tiles = doc.querySelectorAll('tileset tile');
    for (var i = 0; i < tiles.length; i++) {
      var id = tiles[i].getAttribute('id');
      var prop = tiles[i].querySelector('property[name="Entity"]');
      tileNames[id] = prop.getAttribute('value');
    }

    var csv = doc.querySelector('data').textContent;

    // Parse CSV into a 2D array (row -> col)
    tileMap = csv.trim()
                 .split(',\n')
                 .map((row) => row.split(',')
                                  .map((tile) => parseInt(tile, 10)));

    this.tileNames = tileNames;
    this.tileMap = tileMap;
  }

  getEntityTypeForTile(tileNum: number): Entity {
    var entityName = this.tileNames[tileNum - 1];
    var Type = ENTITY_TYPES[entityName];

    if (!Type) {
      throw new Error('Did not recognize entity name ' + entityName);
    }
    return Type;
  }
}

module.exports = Level;
