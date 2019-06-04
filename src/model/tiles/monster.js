import Tile from './tile';

export default class Monster extends Tile {
  constructor(movement, range, flying) {
    super();
    this._movement = 3;
    this._range = 2;
    this._flying = flying;
  }

  get movement() {
    return this._movement;
  }

  get range() {
    return this._range;
  }

  get traits() {
    return this.flying;
  }
}
