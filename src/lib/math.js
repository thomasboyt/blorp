/* @flow */ 
var Entity = require('../entities/Entity');

type Coordinates = { x: number; y: number; };

type SidePositions = {
  left: number; right: number; top: number; bottom: number;
}

type Intersection = {
  sides: SidePositions;
  w: number;
  h: number;
  fromAbove: boolean;
  fromLeft: boolean;
}

type BoundingBox = {
  size: Coordinates;
  center: Coordinates;
}

function sidesForBoundingBox(boundingBox: BoundingBox): SidePositions {
  return {
    left: boundingBox.center.x - boundingBox.size.x / 2,
    right: boundingBox.center.x + boundingBox.size.x / 2,
    top: boundingBox.center.y - boundingBox.size.y / 2,
    bottom: boundingBox.center.y + boundingBox.size.y / 2
  };
}

function max(x: number, y: number): number {
  return x > y ? x : y;
}

function min(x: number, y: number): number {
  return x < y ? x : y;
}

function rectangleIntersection(self: BoundingBox, other: BoundingBox): Intersection {
  // returns the size of the intersection between two rectangles as {w, h}
  var r1 = sidesForBoundingBox(self);
  var r2 = sidesForBoundingBox(other);
  var sides = {
    left: max(r1.left, r2.left),
    right: min(r1.right, r2.right),
    bottom: min(r1.bottom, r2.bottom),
    top: max(r1.top, r2.top)
  };

  return {
    sides: sides,
    w: sides.right - sides.left,
    h: sides.bottom - sides.top,
    fromAbove: sides.top === r2.top,
    fromLeft: sides.left === r2.left
  };
}

function calcVector(magnitude: number, rad: number): Coordinates {
  var x = magnitude * Math.cos(rad);
  var y = magnitude * Math.sin(rad);
  return { x: x, y: y };
}

/*
 * Return a number between min and max inclusive
 */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  rectangleIntersection,
  calcVector,
  randInt,
  max,
  min
};
