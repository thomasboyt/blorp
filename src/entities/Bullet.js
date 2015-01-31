/* @flow */

var Coquette = require('coquette');
var Game = require('../Game');
var Entity = require('./Entity');
var Block = require('./tiles/Block');

type Coordinates = {
  x: number;
  y: number;
};

type Options = {
  creator: Entity;
  direction: string;
  speed: number;
};

class Bullet extends Entity {

  c: Coquette;
  game: Game;
  creator: Entity;
  speed: number;
  velocity: Coordinates;
  maxDistance: number;
  distanceTraveled: number;

  init(settings: Options) {
    this.size = { x:2, y:2 };
    this.zindex = this.game.config.zIndexes.bullet;

    this.speed = settings.speed;
    var creator = this.creator = settings.creator;

    this.maxDistance = this.game.tileHeight * 5;
    this.distanceTraveled = 0;

    // this.game.audioManager.play('shoot');

    // TODO: ew.
    if (settings.direction === 'left') {
      this.center = {
        x: creator.center.x - creator.size.x / 2 - Math.ceil(this.size.x / 2),
        y: creator.center.y
      };
      this.velocity = { x: -this.speed, y: 0 };

    } else if (settings.direction === 'right') {
      this.center = {
        x: creator.center.x + creator.size.x / 2 + Math.ceil(this.size.x / 2),
        y: creator.center.y
      };
      this.velocity = { x: this.speed, y: 0 };

    } else if (settings.direction === 'up') {
      this.center = {
        x: creator.center.x,
        y: creator.center.y - creator.size.y / 2 - Math.ceil(this.size.y / 2)
      };
      this.velocity = { x: 0, y: -this.speed };

    } else if (settings.direction === 'down') {
      this.center = {
        x: creator.center.x,
        y: creator.center.y + creator.size.y / 2 + Math.ceil(this.size.y / 2)
      };
      this.velocity = { x: 0, y: this.speed };
    }
  }

  update(dt: number) {
    var step = dt/100;
    var xSpd = this.velocity.x * step;
    var ySpd = this.velocity.y * step;
    this.center.x += xSpd;
    this.center.y += ySpd;

    var distance = Math.sqrt(Math.abs(xSpd*xSpd) + Math.abs(ySpd*ySpd));
    this.distanceTraveled += distance;

    if (this.distanceTraveled > this.maxDistance) {
      this.game.c.entities.destroy(this);
    }

    // Detect if it goes off-screen
    if (this.center.x - this.size.x / 2 < 0 ||
        this.center.y - this.size.y / 2 < 0 ||
        this.center.x + this.size.x / 2 > this.game.width ||
        this.center.y + this.size.y / 2 > this.game.height) {
      this.c.game.entities.destroy(this);
    }
  }

  draw(ctx: any) {
    ctx.fillStyle = '#193725';

    ctx.fillRect(this.center.x - this.size.x / 2,
                 this.center.y - this.size.y / 2,
                 this.size.x,
                 this.size.y);
  }

  collision(other: Entity) {
    if (other instanceof Block) {
      this.game.c.entities.destroy(this);
    }
  }
}

module.exports = Bullet;
