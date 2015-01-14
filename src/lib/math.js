function sidesForEntity(entity) {
  return {
    left: entity.center.x - entity.size.x / 2,
    right: entity.center.x + entity.size.x / 2,
    top: entity.center.y - entity.size.y / 2,
    bottom: entity.center.y + entity.size.y / 2
  };
}

function max(x, y) {
  return x > y ? x : y;
}

function min(x, y) {
  return x < y ? x : y;
}

function rectangleIntersection(self, other) {
  // returns the size of the intersection between two rectangles as {w, h}
  var r1 = sidesForEntity(self);
  var r2 = sidesForEntity(other);
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

module.exports = {
  sidesForEntity,
  rectangleIntersection
};
