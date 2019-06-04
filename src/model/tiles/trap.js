import Tile from './tile';

export default class Trap extends Tile {
	get cost() {
		return 100;
	}
}
