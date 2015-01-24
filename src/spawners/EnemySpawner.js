/* @flow */

var Spawner = require('./Spawner');
var SpawnPoint = require('../entities/SpawnPoint');
var math = require('../lib/math');

class EnemySpawner extends Spawner {
  spawnNext() {
    var spawners = this.game.c.entities.all(SpawnPoint);

    if (spawners.length > 0) {
      var spawner = spawners[math.randInt(0, spawners.length - 1)];
      spawner.spawnBlorp();
    }
  }

  getSpawnDelay(): number {
    // The difficulty curve is defined by a few points:
    // 1. The starting spawn delay
    // 2. The final spawn delay
    // 3. The time it takes to drop from the starting delay to the final delay

    var elapsed = this.totalTimer.elapsed();
    var amntToDrop = this.game.config.initialSpawnDelay - this.game.config.minSpawnDelay;
    var amntDropped = elapsed * (amntToDrop / this.game.config.timeToFinalSpawnDelayMs);
    var delay = this.game.config.initialSpawnDelay - amntDropped;

    delay = math.max(delay, this.game.config.minSpawnDelay);

    return delay;
  }
}

module.exports = EnemySpawner;
