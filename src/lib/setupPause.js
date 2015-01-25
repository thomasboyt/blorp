/*
 * Allows the game to be paused(or un-paused) by pressing the keyCode specified.
 *
 * The keypress is detected in a special listener, instead of in the Coquette update loop, because
 * pausing the game currently *disables* the Coquette runloop.
 */

var isPaused = false;

function drawOverlay(c) {
  var ctx = c.renderer.getCtx();

  ctx.save();

  ctx.fillStyle = 'rgba(0, 0, 0, .6)';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.fillStyle = 'white';
  ctx.font = '24px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Paused', 200, 200);
  ctx.font = '16px "Press Start 2P"';
  ctx.fillText('press p to unpause', 200, 225);

  ctx.restore();
}

function setupPause(c, keyCode) {
  window.addEventListener('keydown', function(e) {
    if (e.keyCode === keyCode) {
      // document.querySelector('.pause-overlay').classList.toggle('show');
      if (isPaused) {
        c.ticker.start();
      } else {
        c.ticker.stop();

        window.requestAnimationFrame(() => {
          drawOverlay(c);
        });
      }

      isPaused = !isPaused;
    }
  });
}

module.exports = setupPause;
