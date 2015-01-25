/* @flow */

type TileIdEntityNameMap = {
  [key:string]: string
};

class Tileset {
  tileIdEntityNameMap: TileIdEntityNameMap;

  constructor(source: string) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(source, 'application/xml');

    var tiles = doc.querySelectorAll('tileset tile');

    this.tileIdEntityNameMap = {};
    for (var i = 0; i < tiles.length; i++) {
      var id = tiles[i].getAttribute('id');
      var prop = tiles[i].querySelector('property[name="Entity"]');
      if (prop) {
        this.tileIdEntityNameMap[id] = prop.getAttribute('value');
      }
    }
  }

  getEntityNameForId(id: number): string {
    var entityName = this.tileIdEntityNameMap[id + ''];

    if (!entityName) {
      throw new Error('No entity name found for tile with id ' + id);
    }

    return entityName;
  }
}

module.exports = Tileset;
