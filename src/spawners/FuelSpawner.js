/* @flow */

var Game = require('../Game');
var _ = require('lodash');
var FuelPickup = require('../entities/FuelPickup');
var math = require('../lib/math');

type Coordinates = {x: number; y: number};

// TODO: this might be set dynamically depending on time elapsed?
var timeToLive = 10000;

class FuelSpawner {
  game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  spawnNext(spawnDelay: number) {
    this.game.setTimeout(() => {
      var choices = this.game.session.currentWorld.pickupSafeTileLocations;

      choices = this._filterTilesNearPlayer(choices);

      var coordinates = _.sample(choices);

      if (!coordinates) {
        throw new Error('Failed to find safe place to spawn fuel :(');
      }

      this.game.createEntity(FuelPickup, {
        center: {
          x: coordinates.x * this.game.tileWidth + this.game.tileWidth / 2,
          y: coordinates.y * this.game.tileHeight + this.game.tileHeight / 2
        },
        timeToLive: timeToLive
      });
    }, spawnDelay);
  }

  _filterTilesNearPlayer(choices: Array<Coordinates>): Array<Coordinates> {
    var player = this.game.session.currentWorld.getPlayer();

    // Get tile player is in
    var ptx = Math.floor(player.center.x / this.game.tileWidth);
    var pty = Math.floor(player.center.y / this.game.tileHeight);

    // Filter out tiles within 3 spaces of player
    return choices.filter((coordinates) => {
      return Math.abs(coordinates.x - ptx) > 3 ||
             Math.abs(coordinates.y - pty) > 3;
    });
  }
}

module.exports = FuelSpawner;
