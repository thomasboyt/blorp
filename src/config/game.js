/*
 * @flow
 * A central location for various constants in your game, such as movement speed, the number of
 * lives to start with, or the initial spawn rate of enemies.
 *
 * Placing your constants here, rather than as local variables, allows you to tweak your game while
 * it runs with coquette-inspect (https://github.com/thomasboyt/coquette-inspect)
 */

module.exports = {
  gravityAccel: 0.5,

  playerSpeed: 8,
  climbSpeed: 8,
  jumpSpeed: 14,
  fireThrottleMs: 200,

  blorpSpeed: 3,
  blatSpeed: 3,
  blorbSpeed: 3,

  elevatorSpeed: 5,

  playerWalkAnimMs: 200,
  blorpWalkAnimMs: 200,
  blatFlyAnimMs: 100,

  minSpawnDelay: 2000,
  initialSpawnDelay: 4000,
  timeToFinalSpawnDelayMs: 60 * 1000,

  fuelRequired: 5,
  startingLives: 3,

  zIndexes: {
    elevator: 98,
    exit: 99,
    spawnPoint: 100,
    player: 101,
    blat: 102,
    blorp: 102,
    blorb: 102,
    bullet: 103,
    timeExtend: 104,
    flyingShip: 200
  },

  pointValues: {
    blorp: 100,
    blat: 150,
    blorb: 100
  },

  levelOrder: [
    '2',
    'arena',
    'on_a_ledge',
    '4'
  ]
};
