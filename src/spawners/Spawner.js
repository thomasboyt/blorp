/* @flow */

var Game = require('../Game');
var Timer = require('../lib/Timer');

class Spawner {
  game: Game;
  totalTimer: Timer;
  nextSpawnTimer: Timer;

  constructor(game: Game) {
    this.game = game;

    this.totalTimer = new Timer();
    this.spawnNext();
    this.nextSpawnTimer = new Timer(this.getSpawnDelay());
  }

  update(dt: number) {
    this.totalTimer.update(dt);
    this.nextSpawnTimer.update(dt);

    if (this.nextSpawnTimer.expired()) {
      this.spawnNext();
      this.nextSpawnTimer = new Timer(this.getSpawnDelay());
    }
  }

  // TODO: is there a better way to do this that makes flow happy
  spawnNext() { throw new Error('Failed to implement spawnNext()'); }
  getSpawnDelay(): number {throw new Error('Failed to implement getSpawnDelay()'); return 0; }
}

module.exports = Spawner;
