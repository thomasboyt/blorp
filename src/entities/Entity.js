/*
 * @flow
 * A base Entity class defining the interface for Coquette entities to implement.
 */

var Game = require('../Game');
var Coquette = require('coquette');

type Coordinates = {
  x: number;
  y: number;
};

class Entity {
  game: Game;
  center: Coordinates;
  size: Coordinates;
  angle: number;
  zindex: number;

  // TODO: Should be some kinda enum w/ Coquette.Collider.RECTANGLE | Coquette.Collider.CIRCLE
  // (at worst, this could be a number once an interface is declared for Coquette, since those
  // two constants are just 0 and 1)
  boundingBox: any;

  /*
   * Public interface
   */
  init(settings: Object): void {}
  draw(ctx: any): void {}
  update(dt: number): void {}
  collision(other: Entity): void {}

  constructor(game: Game, settings: Object): void {
    this.game = game;
    this.init(settings);
  }
}

module.exports = Entity;
