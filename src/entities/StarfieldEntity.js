/* @flow */

var Entity = require('./Entity');
var _ = require('lodash');
var math = require('../lib/math');

var palette = {
  lighter: '#CEE682',
  light: '#9FBB32',
  dark: '#426E2B',
  darker: '#193725'
};

type Star = {
  x: number;
  y: number;
  ty: number;
};

var gridSize = 80;

class StarfieldEntity extends Entity {
  starfield: Array<Star>;  // </>

  initStarfield() {
    var numStars = (this.game.height / gridSize) * (this.game.width / gridSize);

    this.starfield = _.range(0, numStars).map((n) => {
      var tx = (n % (this.game.width / gridSize)) * gridSize;
      var ty = (Math.floor(n / (this.game.width / gridSize))) * gridSize;

      var x = math.randInt(tx, tx + gridSize);
      var y = math.randInt(ty, ty + gridSize);
      return {x, y, ty};
    });
  }

  updateStarfield(dt: number) {
    // Move stars
    var starSpeed = dt/100 * 6;

    for (var i = this.starfield.length - 1; i >= 0; i--) {
      var star = this.starfield[i];
      star.x -= starSpeed;

      if (star.x < -5) {
        // Move star to other end of field
        star.x = math.randInt(this.game.width, this.game.width + gridSize);
        star.y = math.randInt(star.ty, star.ty + gridSize);
      }
    }

  }

  drawStarfield(ctx: any) {
    // draw background
    ctx.fillStyle = palette.darker;
    ctx.fillRect(0, 0, this.game.width, this.game.height);

    // draw starfield
    ctx.fillStyle = palette.lighter;
    this.starfield.forEach((star) => {
      ctx.fillRect(star.x, star.y, 5, 5);
    });

  }
}

module.exports = StarfieldEntity;
