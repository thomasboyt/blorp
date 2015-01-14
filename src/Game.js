/*
 * @flow
 */

var Coquette = require('coquette');

var StateMachine = require('javascript-state-machine');
var addRegister = require('./lib/addRegister');
var AudioManager = require('./lib/AudioManager');
var AssetPreloader = require('./lib/AssetPreloader');
var setupFullscreen = require('./lib/setupFullscreen');

var assets = require('./config/assets');
var config = require('./config/game');

var Entity = require('./entities/Entity');
var UI = require('./entities/UI');
var World = require('./entities/World');
var Player = require('./entities/Player');
var Level = require('./Level');

type AssetMap = {
  images: {
    [key: string]: Image;
  };
  audio: {
    [key:string]: ArrayBuffer;
  };
  levels: {
    [key:string]: string;
  }
}

type LevelMap = {
  [key: string]: Level;
}

class Game {
  c: Coquette;
  assets: AssetMap;
  levels: LevelMap;

  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;

  ui: UI;

  constructor() {
    this.audioManager = new AudioManager();

    this.assets = assets;
    this.config = config;
    this.levels = {};

    this.width = 160;
    this.height = 140;

    this.tileWidth = 20;
    this.tileHeight = 20;

    this.c = window.__coquette__ = new Coquette(this, 'game-canvas', this.width, this.height, '#CEE682');
    this.c.renderer.getCtx().imageSmoothingEnabled = false;

    setupFullscreen(this.c.inputter.F);
    addRegister(this.c);

    this.fsm = StateMachine.create({
      initial: 'loading',
      events: [
        { name: 'loaded', from: ['loading'], to: 'attract' },
        { name: 'start', from: ['attract', 'ended'], to: 'playing' },
        { name: 'end', from: 'playing', to: 'ended' }
      ]
    });

    this.preloader = new AssetPreloader(assets, this.audioManager.ctx);
    this.ui = this.createEntity(UI, {});

    this.preloader.load().done((assets) => {
      setTimeout(() => {
        this.loaded(assets);
        this.start();
      }, 0);
    });
  }

  // TODO: debustify type checking on the argument here :I
  createEntity(type, settings: Object): any {
    var entity = new type(this, settings);
    this.c.entities.register(entity);
    return entity;
  }


  // State changes

  loaded(assets: AssetMap) {
    this.fsm.loaded();

    this.assets = assets;
    this.audioManager.setAudioMap(assets.audio);
  }

  start() {
    this.fsm.start();

    this.createEntity(World, {
      level: this.assets.levels['1-1']
    });
  }

  end() {
  }


  // Coquette hooks

  update(dt: number) {
    if (this.c.inputter.isPressed(this.c.inputter.M)) {
      this.audioManager.toggleMute();
    }

    if (this.fsm.is('attract') || this.fsm.is('ended')) {
      if (this.c.inputter.isPressed(this.c.inputter.SPACE)) {
        setTimeout(() => {
          this.start(this.fsm);
        }, 0);
      }
    }
  }
}

module.exports = Game;
