/* @flow */

var Entity = require('./entities/Entity');

var ENTITY_TYPES = {
  'Block': require('./entities/tiles/Block'),
  'Platform': require('./entities/tiles/Platform'),
  'Ladder': require('./entities/tiles/Ladder'),
  'Player': require('./entities/Player'),
  'Blorp': require('./entities/Blorp')
};

type TileIndexEntityMap = {
  [key:number]: Entity
};

type TileMap = Array<Array<number>>;  // </>

class Level {
  tileNames: TileIndexEntityMap;
  tileLayers: Array<TileMap>;  // </>
  objects: Array<Object>; // </>

  constructor(level: string) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(level, 'application/xml');

    this.tileNames = this._parseTileset(doc);
    this.tileLayers = this._parseTileLayers(doc);
    this.objects = this._parseObjects(doc);
  }

  getWidth(): number {
    return this.tileLayers[0][0].length;
  }

  getHeight(): number {
    return this.tileLayers[0].length;
  }

  getEntityTypeForTile(tileNum: number): any {
    var entityName = this.tileNames[tileNum - 1];
    return this._getEntityForName(entityName);
  }

  getEntityTypeForTileCoordinates(layer: number, x: number, y: number): any {
    var tile = this.tileLayers[layer][y][x];
    if (tile === 0) { return null; }
    return this.getEntityTypeForTile(tile);
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

  _parseTileLayers(doc: Document): Array<TileMap> {  // </>
    var layers = doc.querySelectorAll('layer data');

    return Array.prototype.map.call(layers, (layer) => {
      var csv = layer.textContent;

      // Parse CSV into a 2D array (row -> col)
      return csv.trim()
                .split(',\n')
                .map((row) => row.split(',')
                                 .map((tile) => parseInt(tile, 10)));
    });
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
