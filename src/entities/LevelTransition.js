/* @flow */

var StarfieldEntity = require('./StarfieldEntity');
var Timer = require('../lib/Timer');

var palette = {
  lighter: '#CEE682',
  light: '#9FBB32',
  dark: '#426E2B',
  darker: '#193725'
};

type Coordinates = {x: number; y: number};

class LevelTransition extends StarfieldEntity {
  shipImg: Image;
  landed: boolean;
  beginLevelTimer: Timer;

  shipPos: Coordinates;
  originPlanetCenter: Coordinates;
  destPlanetCenter: Coordinates;
  shipVecX: number;

  init(settings: any) {
    this.shipImg = this.game.assets.images.flyingShip;

    this.initStarfield();

    if (settings.starfield) {
      this.starfield = settings.starfield;
    }

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
    this.updateStarfield(dt);

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
    this.drawStarfield(ctx);

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
