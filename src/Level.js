/* @flow */

var Entity = require('./entities/Entity');

var ENTITY_TYPES = {
  'Block': require('./entities/Block'),
  'Player': require('./entities/Player'),
  'Blorp': require('./entities/Blorp')
};

type TileIndexEntityMap = {
  [key:number]: Entity
};

type TileMap = Array<Array<number>>;  // </>

class Level {
  tileNames: TileIndexEntityMap;
  tileMap: TileMap;
  objects: Array<Object>; // </>

  constructor(level: string) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(level, 'application/xml');

    this.tileNames = this._parseTileset(doc);
    this.tileMap = this._parseTileMap(doc);
    this.objects = this._parseObjects(doc);
  }

  getEntityTypeForTile(tileNum: number): Entity {
    var entityName = this.tileNames[tileNum - 1];
    return this._getEntityForName(entityName);
  }

  _parseTileset(doc: Document): TileIndexEntityMap {
    var tiles = doc.querySelectorAll('tileset tile');

    var tileNames = {};
    for (var i = 0; i < tiles.length; i++) {
      var id = tiles[i].getAttribute('id');
      var prop = tiles[i].querySelector('property[name="Entity"]');
      tileNames[id] = prop.getAttribute('value');
    }

    return tileNames;
  }

  _parseTileMap(doc: Document): TileMap {
    // TODO: handle >1 tile layer?

    var csv = doc.querySelector('layer data').textContent;

    // Parse CSV into a 2D array (row -> col)
    return csv.trim()
              .split(',\n')
              .map((row) => row.split(',')
                               .map((tile) => parseInt(tile, 10)));
  }

  _parseObjects(doc: Document): Array<Object> {  // </>
    var objects = doc.querySelectorAll('objectgroup object');

    return Array.prototype.map.call(objects, (object) => {
      return {
        Type: this._getEntityForName(object.getAttribute('type')),
        x: parseInt(object.getAttribute('x'), 10),
        y: parseInt(object.getAttribute('y'), 10)
      };
    });
  }

  _getEntityForName(name: string) {
    var Type = ENTITY_TYPES[name];

    if (!Type) {
      throw new Error('Did not recognize entity name ' + name);
    }

    return Type;
  }
}

module.exports = Level;
