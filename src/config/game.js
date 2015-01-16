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

  playerSpeed: 5,
  climbSpeed: 5,
  jumpSpeed: 14,

  blorpSpeed: 3,

  playerWalkAnimMs: 200,
  blorpWalkAnimMs: 200,
};


// Feed ms to timer on each update() tick
// Timer cycles to next index after hitting threshold
// Get sprite from timer on each draw()
