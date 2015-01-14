/*
 * This file is purposely not type-checked! Flow does not like non-JS imports.
 */

require('../assets/game.css');

var Game = require('./Game');

window.onload = () => {
  new Game();
};
