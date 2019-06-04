import Cubic from './cubic';
import Coordinate from './coordinate';

export default class Axial extends Coordinate {
  constructor(q, r) {
    super();
    this._q = q;
    this._r = r;
  }

  get q() {
    return this._q;
  }

  get r() {
    return this._r;
  }

  get cubic() {
    return new Cubic(this.q, -this.q-this.r, this.r);
  }

  get neighbours() {
    return [
      new Axial(this.q + 1, this.r),
      new Axial(this.q + 1, this.r - 1),
      new Axial(this.q, this.r - 1),
      new Axial(this.q - 1, this.r),
      new Axial(this.q - 1, this.r + 1),
      new Axial(this.q, this.r + 1),
    ];
  }

  distance(b) {
    return this.cubic.distance(b instanceof Axial ? b.cubic : b);
  }

  coordinatesInLineBetween(b) {
    return this.cubic.coordinatesInLineBetween(b instanceof Axial ? b.cubic : b).map(c => c.axial);
  }
}
