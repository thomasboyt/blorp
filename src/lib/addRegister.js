/*
 * @flow
 * Monkey-patch the Coquette class to add an `entities.register` method that allows directly
 * passing a constructed entity object so that flow can typecheck it
 */

var Coquette = require('coquette');
var Entity = require('../entities/Entity');

function addRegister(c: Coquette) {
  c.entities.register = function(entity: Entity) {
    this.c.collider.createEntity(entity);
    this._entities.push(entity);
    return entity;
  }.bind(c.entities);
}

module.exports = addRegister;
