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

function getParameterByName(name) {
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

type AssetMap = {
  // TODO: this makes me sad but I don't know how to make it better
  images: any;

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
  currentWorld: World;

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

    // Install custom ticker loop that runs collider hook AFTER update
    this.c.ticker.stop();
    this.c.ticker = new Coquette.Ticker(this.c, (interval) => {
      this.c.runner.update(interval);
      this.update(interval);
      this.c.entities.update(interval);
      this.c.collider.update(interval);
      this.c.renderer.update(interval);
      this.c.inputter.update();
    });

    setupFullscreen(this.c.inputter.F);
    addRegister(this.c);

    this.fsm = StateMachine.create({
      initial: 'loading',
      events: [
        { name: 'loaded', from: ['loading'], to: 'attract' },
        { name: 'start', from: ['attract', 'ended', 'dead'], to: 'playing' },
        { name: 'died', from: 'playing', to: 'dead' },
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

    var level = getParameterByName('level') || '1';

    this.currentWorld = this.createEntity(World, {
      level: this.assets.levels[level]
    });
  }

  died() {
    this.fsm.died();
    this.currentWorld.destroy();
  }

  finishedLevel() {
    this.fsm.end();
    this.currentWorld.destroy();
  }


  // Coquette hooks

  update(dt: number) {
    if (this.c.inputter.isPressed(this.c.inputter.M)) {
      this.audioManager.toggleMute();
    }

    if (this.fsm.is('attract') || this.fsm.is('ended') || this.fsm.is('dead')) {
      if (this.c.inputter.isPressed(this.c.inputter.SPACE)) {
        setTimeout(() => {
          this.start(this.fsm);
        }, 0);
      }
    }
  }
}

module.exports = Game;
