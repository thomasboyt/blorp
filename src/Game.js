/*
 * @flow
 */

var Coquette = require('coquette');

var StateMachine = require('javascript-state-machine');
var addRegister = require('./lib/addRegister');
var AudioManager = require('./lib/AudioManager');
var AssetPreloader = require('./lib/AssetPreloader');
var setupFullscreen = require('./lib/setupFullscreen');
var setupPause = require('./lib/setupPause');
var Timeouts = require('./lib/Timeouts');
var Timer = require('./lib/Timer');

var assets = require('./config/assets');
var config = require('./config/game');
var Level = require('./Level');

var Entity = require('./entities/Entity');
var UI = require('./entities/UI');
var LoadingUI = require('./entities/LoadingUI');
var Player = require('./entities/Player');
var Blorp = require('./entities/Blorp');
var Blat = require('./entities/Blat');
var FuelPickup = require('./entities/FuelPickup');
var TitleScreen = require('./entities/TitleScreen');

var Session = require('./Session');

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
  _timeouts: Timeouts;

  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;

  // TODO: move this into a cheats hash?
  godMode: boolean;
  disableSpawner: boolean;

  session: Session;

  ui: UI;
  loadingUI: LoadingUI;
  titleScreen: TitleScreen;

  constructor() {
    this.audioManager = new AudioManager();

    this.assets = assets;
    this.config = config;
    this.levels = {};

    this.width = 400;
    this.height = 400;

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
    setupPause(this.c, this.c.inputter.P);
    addRegister(this.c);
    this._timeouts = new Timeouts();

    this.fsm = StateMachine.create({
      initial: 'loading',
      events: [
        { name: 'loaded', from: ['loading'], to: 'attract' },
        { name: 'start', from: ['attract', 'gameOver'], to: 'playing' },
        { name: 'gameOver', from: 'playing', to: 'gameOver' },
      ]
    });

    this.preloader = new AssetPreloader(assets, this.audioManager.ctx);
    this.loadingUI = this.createEntity(LoadingUI, {});

    if (getParameterByName('godmode')) {
      this.godMode = true;
    }
    if (getParameterByName('disablespawner')) {
      this.disableSpawner = true;
    }

    this.preloader.load().done((assets) => {
      setTimeout(() => {
        this.loaded(assets);
        if (getParameterByName('skiptitle')) {
          this.start(true);
        }
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

    this.titleScreen = this.createEntity(TitleScreen, {});
    this.c.entities.destroy(this.loadingUI);
    this.ui = this.createEntity(UI, {});
  }

  start(skipTransition: boolean) {
    this.c.entities.destroy(this.titleScreen);

    this.fsm.start();
    var level = parseInt(getParameterByName('level') || '1', 10);
    this.session = new Session(this, level);
    this.session.start(skipTransition, this.titleScreen.starfield);
  }

  destroyAll(type) {
    this.c.entities.all(type).map((entity) => {
      this.c.entities.destroy(entity);
    });
  }

  gameOver() {
    this.fsm.gameOver();
    this.ended();
  }

  ended() {
    // TODO: Where should this go? Probably not here.
    this.destroyAll(Blorp);
    this.destroyAll(Blat);
    this.destroyAll(FuelPickup);
    this.session.currentWorld.destroy();
  }

  setTimeout(cb: () => void, ms: number): Timer {
    return this._timeouts.addCb(cb, ms);
  }


  // Coquette hooks

  update(dt: number) {
    if (this.c.inputter.isPressed(this.c.inputter.M)) {
      this.audioManager.toggleMute();
    }

    if (this.fsm.is('attract') || this.fsm.is('gameOver')) {
      if (this.c.inputter.isPressed(this.c.inputter.SPACE)) {
        setTimeout(() => {
          this.start(false);
        }, 0);
      }
    }

    if (this.fsm.is('playing')) {
      this.session.update(dt);
    }

    this._timeouts.update(dt);
  }
}

module.exports = Game;
