/* @flow */

var Sprite = require('./Sprite');

var blankSprite = new Sprite(new Image(), 0, 0, 0, 0);

class Animation {
  _currentFrameIdx: number;
  _frameLengthMs: ?number;

  constructor(cfg) {
    this._sheet = cfg.sheet;
    this._frames = cfg.frames;
    this._frameLengthMs = cfg.frameLengthMs;

    this._currentFrameIdx = 0;
    this._elapsed = 0;
  }

  update(dt: number) {
    this._elapsed += dt;

    if (this._frameLengthMs === null || this._frameLengthMs === undefined) {
      return;
    }

    if (this._elapsed > this._frameLengthMs) {
      this._currentFrameIdx += 1;

      if (this._currentFrameIdx >= this._frames.length) {
        this._currentFrameIdx = 0;
      }

      this._elapsed = 0;
    }
  }

  getSprite() {
    var frame = this._frames[this._currentFrameIdx];

    if (frame === null) {
      return blankSprite;
    } else {
      return this._sheet.get(frame);
    }
  }

}

class AnimationManager {
  _animations: any;
  _currentState: string;
  _current: Animation;

  constructor(initialState: string, animations: any) {
    this._animations = animations;
    this.set(initialState);
  }

  set(state: string) {
    if (state === this._currentState) {
      return;
    }

    this._currentState = state;
    var cfg = this._animations[state];
    this._current = new Animation(cfg);
  }

  getSprite(): Sprite {
    return this._current.getSprite();
  }

  update(dt: number) {
    this._current.update(dt);
  }
}

module.exports = AnimationManager;
