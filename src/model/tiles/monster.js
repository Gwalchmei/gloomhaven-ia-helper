import Tile from './tile';

export default class Monster extends Tile {
  constructor(movement, range, flying) {
    super();
    this._movement = movement;
    this._range = range;
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
