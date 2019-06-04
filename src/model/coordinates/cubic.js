import Coordinate from './coordinate';
import Axial from './axial';

export default class Cubic extends Coordinate {
	constructor(x, y, z) {
    super();
    this._x = x;
    this._y = y;
    this._z = z;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get z() {
    return this._z;
  }

  get axial() {
    return new Axial(this._x, this._z);
  }

  distance(b) {
    return Math.max(Math.abs(this.x - b.x), Math.abs(this.y - b.y), Math.abs(this.z - b.z));
  }

  coordinatesInLineBetween(b) {
    const N = this.distance(b);
    const results = [];
    for (let i = 0; i < N; i++) {
      results.push(
          Cubic.round(Cubic.cubeLerp(this, b, 1.0/N*i))
      );
    }

    return results;
  }

  static cubeLerp(a, b, t) {
    return new Cubic(
      Cubic.lerp(a.x, b.x, t),
      Cubic.lerp(a.y, b.y, t),
      Cubic.lerp(a.z, b.z, t),
    );
  }

  static lerp(a, b, t) {
    return a + (b - a) * t;
  }

  static round(cube) {
    let rx = Math.round(cube.x);
    let ry = Math.round(cube.y);
    let rz = Math.round(cube.z);

    const xDiff = Math.abs(rx - cube.x);
    const yDiff = Math.abs(ry - cube.y);
    const zDiff = Math.abs(rz - cube.z);

    if (xDiff > yDiff && xDiff > zDiff) {
      rx = -ry-rz;
    } else if (yDiff > zDiff) {
      ry = -rx-rz;
    } else {
      rz = -rx-ry;
    }

    return new Cubic(rx, ry, rz);
  }
}
