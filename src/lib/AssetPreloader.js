/*
 * @flow
 * Loads assets into the game. For usage, see `Game.js`.
 */

var q = require('q');
var _ = require('lodash');
var Level = require('../Level');

type AssetMap = {
  images: {
    [key:string]: Image
  };
  audio: {
    [key:string]: ArrayBuffer
  };
}

type AssetCfg = {
  images: ?{
    [key:string]: string
  };
  audio: ?{
    [key:string]: string
  };
}

class AssetPreloader {
  assets: AssetMap;
  numTotal: number;
  numLoaded: number;
  audioCtx: any;

  _images: ?{
    [key:string]: string
  };
  _audio: ?{
    [key:string]: string
  };

  constructor (assetCfg : AssetCfg, audioCtx: any) {
    /* jshint loopfunc: true */

    this.assets = {
      'images': {},
      'audio': {},
      'levels': {}
    };

    this.audioCtx = audioCtx;

    this._images = assetCfg.images;
    this._audio = assetCfg.audio;
    this._levels = assetCfg.levels;

    this.numTotal = _.keys(this._images).length + _.keys(this._audio).length + _.keys(this._levels).length;
    this.numLoaded = 0;
  }

  load() : Promise {
    var dfd = q.defer();

    var onAssetLoaded = () => {
      this.numLoaded += 1;

      if ( this.numTotal === this.numLoaded ) {
        dfd.resolve(this.assets);
      }
    };

    if (this.numTotal === 0) {
      // no assets, resolve immediately
      dfd.resolve(this.assets);
    }

    _.each(this._images, (src, name) => {
      var img = new Image();
      img.onload = onAssetLoaded;
      img.src = src;

      this.assets.images[name] = img;
    });

    _.each(this._audio, (src, name) => {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', src, true);
      xhr.responseType = 'arraybuffer';

      xhr.onload = () => {
        this.audioCtx.decodeAudioData(xhr.response, (buf) => {
          this.assets.audio[name] = buf;
          onAssetLoaded();
        });
      };

      xhr.send();
    });

    _.each(this._levels, (content, name) => {
      this.assets.levels[name] = new Level(content);
      onAssetLoaded();
    });

    return dfd.promise;
  }

}

module.exports = AssetPreloader;
