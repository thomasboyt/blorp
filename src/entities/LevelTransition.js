/* @flow */

var Entity = require('./Entity');
var _ = require('lodash');
var math = require('../lib/math');
var Timer = require('../lib/Timer');

var palette = {
  lighter: '#CEE682',
  light: '#9FBB32',
  dark: '#426E2B',
  darker: '#193725'
};

var gridSize = 80;

type Coordinates = {x: number; y: number};

type Star = {
  x: number;
  y: number;
  ty: number;
};

class LevelTransition extends Entity {
  shipImg: Image;
  landed: boolean;
  beginLevelTimer: Timer;

  starfield: Array<Star>;  // </>

  shipPos: Coordinates;
  originPlanetCenter: Coordinates;
  destPlanetCenter: Coordinates;
  shipVecX: number;

  init(settings: any) {
    this.shipImg = this.game.assets.images.flyingShip;

    var numStars = (this.game.height / gridSize) * (this.game.width / gridSize);

    this.starfield = _.range(0, numStars).map((n) => {
      var tx = (n % (this.game.width / gridSize)) * gridSize;
      var ty = (Math.floor(n / (this.game.width / gridSize))) * gridSize;

      var x = math.randInt(tx, tx + gridSize);
      var y = math.randInt(ty, ty + gridSize);
      return {x, y, ty};
    });

    this.shipPos = {
      x: 150,
      y: 190
    };

    this.originPlanetCenter = {
      x: 70,
      y: 200
    };

    this.destPlanetCenter = {
      x: 820,
      y: 200
    };

    this.shipVecX = 0;

    this.beginLevelTimer = new Timer(3000);
  }

  update(dt: number) {
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

    // If landed, don't scroll planets + tick begin level timer
    if (this.destPlanetCenter.x - 50 < this.shipPos.x) {
      this.landed = true;
      this.beginLevelTimer.update(dt);

      if (this.beginLevelTimer.expired()) {
        this.game.session.enterLevel();
      }

      return;
    }

    // Move planets
    // TODO: A better acceleration curve including deacceleration
    var acc = dt/100 * 1;
    this.shipVecX += acc;

    var maxSpeed = dt/100 * 15;
    if (this.shipVecX > maxSpeed) {
      this.shipVecX = maxSpeed;
    }

    this.originPlanetCenter.x -= this.shipVecX;
    this.destPlanetCenter.x -= this.shipVecX;
  }

  draw(ctx: any) {
    // draw background
    ctx.fillStyle = palette.darker;
    ctx.fillRect(0, 0, this.game.width, this.game.height);

    // draw starfield
    ctx.fillStyle = palette.lighter;
    this.starfield.forEach((star) => {
      ctx.fillRect(star.x, star.y, 5, 5);
    });

    // draw ship
    var distFromOrigin = this.shipPos.x - this.originPlanetCenter.x - 75;
    var distFromDest = this.destPlanetCenter.x - this.shipPos.x - 75;

    var w;
    if (distFromOrigin > distFromDest) {
      // get smaller as destPlanet nears
      w = distFromDest / 2;
    } else {
      // get bigger as originPlanet gets further away
      w = distFromOrigin / 2;
    }

    w = (w > this.shipImg.width) ? this.shipImg.width : w;

    var h = w / 2;
    var y = (this.shipPos.y - h / 2) + this.shipImg.height / 2;

    ctx.drawImage(this.shipImg, this.shipPos.x, y, w, h);

    // draw planets
    // TODO: canvas makes these planets round, which sucks!! let's get a sprite for a proper chunky
    // circle in here asap
    ctx.fillStyle = palette.light;
    ctx.beginPath();
    ctx.arc(this.originPlanetCenter.x, this.originPlanetCenter.y, 75, 0, 360);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(this.destPlanetCenter.x, this.destPlanetCenter.y, 75, 0, 360);
    ctx.fill();
    ctx.closePath();

    if (this.landed) {
      var stageNum = this.game.session.currentLevelNumber;
      ctx.font = '16px "Press Start 2P"';
      ctx.fillStyle = palette.light;
      ctx.textAlign = 'center';
      ctx.fillText('Stage ' + stageNum, 200, 325);
    }
  }
}

module.exports = LevelTransition;
