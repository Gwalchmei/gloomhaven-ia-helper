import Tile from './tile';

export default class Obstacle extends Tile {
	get cost() {
		return Infinity;
	}
}
