/* @flow */

class Timer {
  expireIn: ?number;
  _elapsed: number;

  constructor(expireIn?: number) {
    if (expireIn === undefined) {
      this.expireIn = null;
    } else {
      this.expireIn = expireIn;
    }

    this.reset();
  }

  expired(): boolean {
    var expireIn = this.expireIn;

    if (expireIn == null) {
      return true;
    } else {
      return this.elapsed() > expireIn;
    }
  }

  elapsed(): number {
    return this._elapsed;
  }

  update(dt: number) {
    this._elapsed += dt;
  }

  reset() {
    this._elapsed = 0;
  }
}

module.exports = Timer;
