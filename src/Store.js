import { BehaviorSubject } from 'rxjs';
import Hex from './model/hex';
import Axial from './model/coordinates/axial';
import Tile from './model/tiles/tile';
import Difficult from './model/tiles/difficult';
import Monster from './model/tiles/monster';
import Obstacle from './model/tiles/obstacle';
import Player from './model/tiles/player';
import Trap from './model/tiles/trap';
import Wall from './model/tiles/wall';

class Store {
  constructor() {
    this.data = new BehaviorSubject({
      hexes: [],
      mode: 'TOGGLE_PLAYER',
      selected: null,
      focused: null
    });
  }

  getDataSubject = () => {
    return this.data
      .map(this.processMonsterFocus)
      .map(this.processMonsterPath);
  }

  initialize = (radius) => {
    const hexes = [];
    let id = 0;
    for (let q = -radius; q <= radius; q++) {
      const r1 = Math.max(-radius, -q - radius);
      const r2 = Math.min(radius, -q + radius);
      for (let r = r1; r <= r2; r++) {
        hexes.push(new Hex(id, new Axial(q, r), new Tile()));
        id++;
      }
    }
    this.data.next({
      ...this.data.value,
      hexes
    });
  }

  select = (id) => {
    const currentValue = this.data.value;
    let selected = currentValue.selected;
    const hexes = currentValue.hexes;
    const hex = hexes[id];
    switch(currentValue.mode) {
      case 'TOGGLE_PLAYER':
        hex.tile = hex.tile instanceof Player ? new Tile() : new Player();
        break;
      case 'TOGGLE_MONSTER':
        hex.tile = hex.tile instanceof Monster ? new Tile() : new Monster();
        break;
      case 'TOGGLE_WALL':
        hex.tile = hex.tile instanceof Wall ? new Tile() : new Wall();
        break;
      case 'TOGGLE_TRAP':
        hex.tile = hex.tile instanceof Trap ? new Tile() : new Trap();
        break;
      case 'TOGGLE_OBSTACLE':
        hex.tile = hex.tile instanceof Obstacle ? new Tile() : new Obstacle();
        break;
      case 'TOGGLE_DIFFICULT':
        hex.tile = hex.tile instanceof Difficult ? new Tile() : new Difficult();
        break;
      default:
        selected = hex.id;
    }
    this.data.next({ ...currentValue, hexes, selected });
  }

  setMode = (mode) => {
    this.data.next({
      ...this.data.value,
      mode
    });
  }

  processMonsterFocus = (currentValue) => {
    if (currentValue.selected && currentValue.hexes[currentValue.selected].tile instanceof Monster) {
      const monsterHex = currentValue.hexes[currentValue.selected];
      const pathToPlayerHexes = currentValue.hexes
        .filter(hex => hex.tile instanceof Player)
        .map((playerHex) => ({
          hex: playerHex,
          path: this.getShortestPath(monsterHex, playerHex, currentValue.hexes)
        }));

      if (pathToPlayerHexes.length === 0 
        || (monsterHex.tile.range === 0 && pathToPlayerHexes.filter((pathToPlayerHex) => pathToPlayerHex.path.cost !== Infinity).length === 0)
      ) {
        return { ...currentValue, focused: undefined };
      }

      let availableMovementPoints = 0;
      let exploredCompletePathSet = new Set();

      while (exploredCompletePathSet.size < pathToPlayerHexes.length) {
        const visibleInRangePlayers = pathToPlayerHexes.filter(pathToPlayerHex => {
          const path = [...pathToPlayerHex.path.hexIds];
          let monsterMoveToHex = monsterHex;
          let usedMovementPoints = 0;
          while (path.length > 0 && (usedMovementPoints + currentValue.hexes[path[0]].tile.cost) < availableMovementPoints) {
            monsterMoveToHex = currentValue.hexes[path[0]];
            usedMovementPoints += monsterMoveToHex.tile.cost;
            path.shift();
          }

          if (path.length === 0) {
            exploredCompletePathSet.add(pathToPlayerHex.hex.id);
          }

          return this.hexIsVisibleAndInRange(monsterMoveToHex, pathToPlayerHex.hex, currentValue.hexes, monsterHex.tile.range);
        }).sort((pathToA, pathToB) => {
          return pathToA.path.cost === pathToB.path.cost
            ? (pathToA.hex.tile.initiative - pathToB.hex.tile.initiative)
            : (pathToA.path.cost - pathToB.path.cost);
        });

        if (visibleInRangePlayers.length > 0) {
          return { ...currentValue, focused: visibleInRangePlayers[0].hex.id };
        }

        availableMovementPoints++;
      }
    }

    return { ...currentValue, focused: undefined };
  }

  hexIsVisibleAndInRange = (fromHex, toHex, hexes, range) => {
    const hexesBetween = this.filterHexesWithCoordinates(hexes, fromHex.coordinate.coordinatesInLineBetween(toHex.coordinate));
    return typeof hexesBetween.find(hex => hex.tile instanceof Wall) === 'undefined' && fromHex.coordinate.distance(toHex.coordinate) <= range;
  }

  getShortestPath = (monsterHex, playerHex, hexes) => {
    const monsterId = monsterHex.id;
    const playerId = playerHex.id;
    const frontier = new Map();
    frontier.set(monsterId, 0);
    const cameFrom = new Map();
    const costTo = new Map();
    cameFrom.set(monsterId, null);
    costTo.set(monsterId, 0);

    while (frontier.length !== 0) {
      let currentId = null;
      frontier.forEach((value, id) => {
        if (currentId === null || frontier.get(id) < frontier.get(currentId)) {
          currentId = id;
        }
      });
      frontier.delete(currentId);
      const currentHex = hexes[currentId];

      if (typeof currentHex === 'undefined') {
        break;
      }

      this.filterHexesWithCoordinates(hexes, currentHex.coordinate.neighbours)
        .filter(hex => !(hex.tile instanceof Wall) && !(hex.tile instanceof Obstacle))
        .forEach((neighbour) => {
          const newCost = costTo.get(currentId) + neighbour.tile.cost;
          if (!costTo.has(neighbour.id) || newCost < costTo.get(neighbour.id)) {
            costTo.set(neighbour.id, newCost);
            frontier.set(neighbour.id, newCost + playerHex.coordinate.distance(neighbour.coordinate));
            cameFrom.set(neighbour.id, currentId);
          }
        });
    }

    const path = [];
    if (cameFrom.has(playerId)) {
      let currentId = cameFrom.get(playerId);
      while (currentId !== monsterId) {
        path.push(currentId);
        currentId = cameFrom.get(currentId);
      }
    }

    return { hexIds: path.reverse(), cost : costTo.has(playerId) ? costTo.get(playerId) : Infinity };
  }

  processMonsterPath = (currentValue) => {
    const hexes = currentValue.hexes.map(hex => { hex.isPath = false; return hex; });
    if (currentValue.selected && currentValue.focused) {
      const monsterHex = hexes[currentValue.selected];
      const playerHex = hexes[currentValue.focused];
      const path = this.getShortestPath(monsterHex, playerHex, hexes).hexIds;
      let usedMovementPoints = 0;
      let currentHex = monsterHex;
      while (!this.hexIsVisibleAndInRange(currentHex, playerHex, hexes, monsterHex.tile.range) && path.length > 0 && (usedMovementPoints + hexes[path[0]].tile.cost ) <= monsterHex.tile.movement) {
        hexes[path[0]].isPath = true;
        currentHex = hexes[path[0]];
        usedMovementPoints += currentHex.tile.cost;
        path.shift();
      }
    }
    
    return { ...currentValue, hexes };
  }

  filterHexesWithCoordinates = (hexes, coordinates) => hexes.filter(hex => coordinates.find(coordinate => coordinate.q === hex.coordinate.q && coordinate.r === hex.coordinate.r))
}

export default new Store();
