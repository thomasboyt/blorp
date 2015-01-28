/* @flow */

var Timer = require('./Timer');

class Timeouts {
  _timers: Array<Timer>;
  _timerCbMap: WeakMap<Timer, () => void>;

  constructor() {
    this._timers = [];
    this._timerCbMap = new WeakMap();
  }

  addCb(cb: () => void, ms: number): Timer {
    var timer = new Timer(ms);
    this._timers.push(timer);
    this._timerCbMap.set(timer, cb);
    return timer;
  }

  update(dt: number) {
    this._timers.forEach((timer, idx) => {
      timer.update(dt);

      if (timer.expired()) {
        var cb = this._timerCbMap.get(timer);
        cb();

        this._timers.splice(idx, 1);
        this._timerCbMap.delete(timer);
      }
    });
  }
}

module.exports = Timeouts;
