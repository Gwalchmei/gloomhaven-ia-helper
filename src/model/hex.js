const SIZE = 2;

export default class Hex {
  constructor(id, coordinate, tile) {
    this._id = id;
    this._coordinate = coordinate;
    this._tile = tile;
    this._isPath = false;
  }

  get id() {
    return this._id;
  }

  get coordinate() {
    return this._coordinate;
  }

  get tile() {
    return this._tile;
  }

  get isPath() {
    return this._isPath;
  }

  set tile(tile) {
    this._tile = tile;
  }

  set isPath(isPath) {
    this._isPath = isPath;
  }

  get x() {
    return (Math.sqrt(3.0) * this.coordinate.q + Math.sqrt(3.0)/2.0 * this.coordinate.r) * SIZE;
  }

  get y() {
    return (3/2 * this.coordinate.r) * SIZE;
  }

  get points() {
    const points = [];
    for(let i = 0; i < 6; i++) {
      const deg = 60 * i + 30;
      const rad = Math.PI / 180 * deg;
      points.push((this.x + SIZE * Math.cos(rad)) + ',' + (this.y + SIZE * Math.sin(rad)));
    }

    return points;
  }
}
