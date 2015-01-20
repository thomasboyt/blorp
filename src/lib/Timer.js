/* @flow */

class Timer {
  expireIn: ?number;
  _startTime: number;

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
    return Date.now() - this._startTime;
  }

  reset(): void {
    this._startTime = Date.now();
  }
}

module.exports = Timer;
