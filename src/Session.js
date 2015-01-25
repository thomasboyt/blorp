/* @flow */

var Game = require('./Game');
var World = require('./entities/World');
var Ship = require('./entities/Ship');
var LevelTransition = require('./entities/LevelTransition');
var EnemySpawner = require('./spawners/EnemySpawner');
var FuelSpawner = require('./spawners/FuelSpawner');

var IN_LEVEL_STATE = 'inLevel';
var BETWEEN_LEVELS_STATE = 'betweenLevels';

class Session {
  game: Game;
  currentWorld: World;
  levelTransition: LevelTransition;
  enemySpawner: EnemySpawner;
  fuelSpawner: FuelSpawner;

  state: string;
  currentLevelNumber: number;
  currentPoints: number;

  // Level state
  currentFuel: number;
  fuelNeeded: number;
  exitEnabled: boolean;
  escaped: boolean;

  constructor(game: Game, currentLevelNumber: number) {
    this.game = game;

    this.state = BETWEEN_LEVELS_STATE;
    this.currentPoints = 0;
    this.currentLevelNumber = currentLevelNumber;
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

  isInLevel(): boolean {
    return this.state === IN_LEVEL_STATE;
  }

  escape() {
    this.escaped = true;

    var ship = this.game.c.entities.all(Ship)[0];
    ship.fly();

    setTimeout(() => {
      this.game.ended();
    }, 3000);
  }

  start() {
    // Enter transition state
    this._enterBetweenLevels();
  }

  _getFuelNeeded(): number {
    // TODO: scale this based on currentLevelNumber?
    return 5;
  }

  _enterBetweenLevels() {
    this.state = BETWEEN_LEVELS_STATE;

    this.levelTransition = this.game.createEntity(LevelTransition, {
    });
  }

  enterLevel() {
    this.game.c.entities.destroy(this.levelTransition);
    this.state = IN_LEVEL_STATE;

    this.currentFuel = 0;
    this.fuelNeeded = this._getFuelNeeded();

    this.exitEnabled = false;
    this.escaped = false;

    var levelName = this.game.config.levelOrder[this.currentLevelNumber];

    this.currentWorld = this.game.createEntity(World, {
      level: this.game.assets.levels[levelName]
    });

    this.enemySpawner = new EnemySpawner(this.game);
    this.fuelSpawner = new FuelSpawner(this.game);
  }

  // _nextLevel() {
  //   this.currentLevelNumber += 1;
  //   var level = this.game.config.levelOrder[this.currentLevelNumber];
  //   this._startLevel(level);
  // }

  update(dt: number) {
    if (this.state === IN_LEVEL_STATE) {
      if (!this.escaped) {
        if (!this.game.disableSpawner) {
          this.enemySpawner.update(dt);

          if (!this.exitEnabled) {
            this.fuelSpawner.update(dt);
          }
        }
      }
    }
  }
}

module.exports = Session;
