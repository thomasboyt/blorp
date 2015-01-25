/*
 * @flow
 * Loads assets into the game. For usage, see `Game.js`.
 */

var q = require('q');
var _ = require('lodash');
var Level = require('../Level');
var Tileset = require('../Tileset');

type AssetMap = {
  images: {
    [key:string]: Image
  };
  audio: {
    [key:string]: ArrayBuffer
  };
  levels: {
    [key:string]: Level
  };
}

type AssetCfg = {
  images: ?{
    [key:string]: string
  };
  audio: ?{
    [key:string]: string
  };
  levels: ?{
    [key:string]: string
  };
  tileset: string;
}

class AssetPreloader {
  assets: AssetMap;
  numTotal: number;
  numLoaded: number;
  audioCtx: any;

  assetCfg: AssetCfg;

  constructor (assetCfg : AssetCfg, audioCtx: any) {
    /* jshint loopfunc: true */

    this.assets = {
      'images': {},
      'audio': {},
      'levels': {}
    };

    this.audioCtx = audioCtx;

    this.assetCfg = assetCfg;

    this.numTotal = _.reduce(assetCfg, (acc, assets) => acc + _.keys(assets).length, 0);
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

    _.each(this.assetCfg.images, (src, name) => {
      var img = new Image();
      img.onload = onAssetLoaded;
      img.src = src;

      this.assets.images[name] = img;
    });

    _.each(this.assetCfg.audio, (src, name) => {
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

    var tileset = new Tileset(this.assetCfg.tileset);

    _.each(this.assetCfg.levels, (content, name) => {
      this.assets.levels[name] = new Level(content, tileset);
      onAssetLoaded();
    });

    return dfd.promise;
  }

}

module.exports = AssetPreloader;
