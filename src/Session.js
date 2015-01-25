/* @flow */

var Game = require('./Game');
var World = require('./entities/World');
var Ship = require('./entities/Ship');
var EnemySpawner = require('./spawners/EnemySpawner');
var FuelSpawner = require('./spawners/FuelSpawner');

class Session {
  game: Game;
  currentWorld: World;
  enemySpawner: EnemySpawner;
  fuelSpawner: FuelSpawner;

  currentLevelNumber: number;
  currentPoints: number;

  currentFuel: number;
  fuelNeeded: number;
  exitEnabled: boolean;
  levelEnded: boolean;
  escaped: boolean;

  constructor(game: Game) {
    this.game = game;

    this.currentPoints = 0;
    this.currentLevelNumber = 0;
  }

  startLevel(level: string) {
    this.currentFuel = 0;
    this.fuelNeeded = this._getFuelNeeded();

    this.exitEnabled = false;
    this.levelEnded = false;
    this.escaped = false;

    this.currentWorld = this.game.createEntity(World, {
      level: this.game.assets.levels[level]
    });

    this.enemySpawner = new EnemySpawner(this.game);
    this.fuelSpawner = new FuelSpawner(this.game);
  }

  addPoints(points: number) {
    this.currentPoints += points;
  }

  addFuel(fuel: number) {
    this.currentFuel += 1;

    if (this.currentFuel >= this.fuelNeeded) {
      this.exitEnabled = true;
    }
  }

  escape() {
    this.escaped = true;

    var ship = this.game.c.entities.all(Ship)[0];
    ship.fly();

    setTimeout(() => {
      this.levelEnded = true;
      this.game.ended();
    }, 3000);
  }

  _getFuelNeeded(): number {
    // TODO: scale this based on currentLevelNumber?
    return 5;
  }

  _nextLevel() {
    this.currentLevelNumber += 1;
    var level = this.game.config.levelOrder[this.currentLevelNumber];
    this.startLevel(level);
  }

  update(dt: number) {
    if (this.levelEnded) {
      if (this.game.c.inputter.isDown(this.game.c.inputter.SPACE)) {
        this._nextLevel();
      }

    } else if (!this.escaped) {
      if (!this.game.disableSpawner) {
        this.enemySpawner.update(dt);

        if (!this.exitEnabled) {
          this.fuelSpawner.update(dt);
        }
      }
    }
  }
}

module.exports = Session;
