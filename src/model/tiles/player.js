import Tile from './tile';

export default class Player extends Tile {
	constructor(initiative) {
    super();
    this._initiative = initiative;
  }

  get initiative() {
    return this._initiative;
  }
}
