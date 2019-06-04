import Tile from './tile';

export default class Wall extends Tile {
	get cost() {
		return Infinity;
	}
}
