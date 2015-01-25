/* @flow */

var _ = require('lodash');
var Spawner = require('./Spawner');
var FuelPickup = require('../entities/FuelPickup');
var math = require('../lib/math');

// TODO: this might be set dynamically depending on time elapsed?
var timeToLive = 10000;

class FuelSpawner extends Spawner {
  spawnNext() {
    var choices = this.game.session.currentWorld.pickupSafeTileLocations;

    var coordinates = _.sample(choices);

    this.game.createEntity(FuelPickup, {
      center: {
        x: coordinates.x * this.game.tileWidth + this.game.tileWidth / 2,
        y: coordinates.y * this.game.tileHeight + this.game.tileHeight / 2
      },
      timeToLive: timeToLive
    });
  }

  getSpawnDelay(): number {
    return timeToLive;
  }
}

module.exports = FuelSpawner;
