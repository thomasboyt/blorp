/* @flow */

var Game = require('./Game');
var Spawner = require('./entities/Spawner');
var Timer = require('./lib/Timer');
var math = require('./lib/math');

class SpawnerManager {
  Game: game;
  _totalTimer: Timer;
  _nextSpawnTimer: Timer;

  constructor(game: Game) {
    this.game = game;

    this._totalTimer = new Timer();
    this._spawnNext();
  }

  update(dt: number) {
    this._totalTimer.update(dt);
    this._nextSpawnTimer.update(dt);

    if (this._nextSpawnTimer.expired()) {
      this._spawnNext();
    }
  }

  _spawnNext() {
    var spawners = this.game.c.entities.all(Spawner);
    var spawner = spawners[math.randInt(0, spawners.length - 1)];
    spawner.spawnBlorp();

    this._nextSpawnTimer = new Timer(this._getSpawnDelay());
  }

  _getSpawnDelay(): number {
    // The difficulty curve is defined by a few points:
    // 1. The starting spawn delay
    // 2. The final spawn delay
    // 3. The time it takes to drop from the starting delay to the final delay

    var elapsed = this._totalTimer.elapsed();
    var amntToDrop = this.game.config.initialSpawnDelay - this.game.config.minSpawnDelay;
    var amntDropped = elapsed * (amntToDrop / this.game.config.timeToFinalSpawnDelayMs);
    var delay = this.game.config.initialSpawnDelay - amntDropped;

    delay = math.max(delay, this.game.config.minSpawnDelay);

    return delay;
  }
}

module.exports = SpawnerManager;
