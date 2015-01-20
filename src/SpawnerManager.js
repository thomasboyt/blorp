/* @flow */

var Game = require('./Game');
var Spawner = require('./entities/Spawner');
var Timer = require('./lib/Timer');
var math = require('./lib/math');

class SpawnerManager {
  _curTimeoutId: number;
  timer: Timer;

  constructor(game: Game) {
    this.game = game;
  }

  start() {
    this.timer = new Timer();
    this._spawnLoop();
  }

  stop() {
    clearTimeout(this._curTimeoutId);
  }

  _spawnLoop() {
    var ms = this.getSpawnDelay();

    this._curTimeoutId = setTimeout(() => {
      this._spawnNext();
      this._spawnLoop();
    }, ms);
  }

  getSpawnDelay(): number {
    // The difficulty curve is defined by a few points:
    // 1. The starting spawn delay
    // 2. The final spawn delay
    // 3. The time it takes to drop from the starting delay to the final delay

    var elapsed = this.timer.elapsed();
    var amntToDrop = this.game.config.initialSpawnDelay - this.game.config.minSpawnDelay;
    var amntDropped = elapsed * (amntToDrop / this.game.config.timeToFinalSpawnDelayMs);
    var delay = this.game.config.initialSpawnDelay - amntDropped;

    delay = math.max(delay, this.game.config.minSpawnDelay);

    return delay;
  }

  _spawnNext() {
    var spawners = this.game.c.entities.all(Spawner);

    var spawner = spawners[math.randInt(0, spawners.length - 1)];

    spawner.spawnBlorp();
  }
}

module.exports = SpawnerManager;
