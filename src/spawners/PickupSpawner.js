/* @flow */

var _ = require('lodash');
var Spawner = require('./Spawner');
var TimerExtendPickup = require('../entities/TimerExtendPickup');
var math = require('../lib/math');

// TODO: this might be set dynamically depending on time elapsed?
var timeToLive = 10000;

// TODO: this might depend on time elapsed/distance from player?
var timeAdded = 10000;

class PickupSpawner extends Spawner {
  spawnNext() {
    var choices = this.game.currentWorld.pickupSafeTileLocations;

    var coordinates = _.sample(choices);

    this.game.createEntity(TimerExtendPickup, {
      center: {
        x: coordinates.x * this.game.tileWidth + this.game.tileWidth / 2,
        y: coordinates.y * this.game.tileHeight + this.game.tileHeight / 2
      },
      timeToLive: timeToLive,
      timeAdded: timeAdded
    });
  }

  getSpawnDelay(): number {
    return timeToLive;
  }
}

module.exports = PickupSpawner;
