/*
 * Allows the game to be paused(or un-paused) by pressing the keyCode specified.
 *
 * The keypress is detected in a special listener, instead of in the Coquette update loop, because
 * pausing the game currently *disables* the Coquette runloop.
 */

var isPaused = false;

function setupPause(coquette, keyCode) {
  window.addEventListener('keydown', function(e) {
    if (e.keyCode === keyCode) {
      if (isPaused) {
        coquette.ticker.start();
      } else {
        coquette.ticker.stop();
      }

      isPaused = !isPaused;
    }
  });
}

module.exports = setupPause;
