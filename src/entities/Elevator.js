/* @flow */

var Entity = require('./Entity');
var ElevatorSegment = require('./tiles/ElevatorSegment');

class Elevator extends Entity {
  img: Image;
  flyingImg: Image;
  flying: boolean;
  direction: number;

  init(settings: any) {
    this.center = settings.center;
    this.size = {x: 20, y: 1};

    this.img = this.game.assets.images.platform;

    this.zindex = this.game.config.zIndexes.elevator;

    this.direction = settings.properties.direction === 'up' ? -1 : 1;
  }

  getSpeed(): number {
    return this.direction * this.game.config.elevatorSpeed;
  }

  update(dt: number) {
    var vel = this.getSpeed() * dt/100;

    this.center.y += vel;

    if (!this._checkOnElevatorSegment()) {
      this.direction *= -1;
    }
  }

  _checkOnElevatorSegment(): boolean {
    // Check that elevator's bottom edge is on segment
    var y = this.center.y + this.size.y / 2;
    var bottomEdgeTile = this.game.session.currentWorld.getTileAt(ElevatorSegment.layerNum, this.center.x, y);

    // Check that the elevator's top edge is on a segment
    y = this.center.y - this.size.y / 2;
    var topEdgeTile = this.game.session.currentWorld.getTileAt(ElevatorSegment.layerNum, this.center.x, y);

    return (bottomEdgeTile instanceof ElevatorSegment && topEdgeTile instanceof ElevatorSegment);
  }

  draw(ctx: any) {
    var img = this.img;

    var x = this.center.x - img.width / 2;
    var y = this.center.y;

    ctx.drawImage(img, x, y);
  }
}

module.exports = Elevator;
