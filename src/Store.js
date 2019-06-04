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
      const playerHexes = currentValue.hexes.filter(hex => hex.tile instanceof Player);
      const visiblePlayers = playerHexes.filter(playerHex => {
        const coordinatesBetweenPlayerAndMonster = monsterHex.coordinate.coordinatesInLineBetween(playerHex.coordinate);
        const hexesBetweenPlayerAndMonster = this.filterHexesWithCoordinates(currentValue.hexes, coordinatesBetweenPlayerAndMonster);
        return typeof hexesBetweenPlayerAndMonster.find(hex => hex.tile instanceof Wall) === 'undefined';
      });
      const distanceToPlayers = visiblePlayers.map((playerHex) => ({ hex: playerHex, distance: monsterHex.coordinate.distance(playerHex.coordinate) })).sort((a, b) => a.distance - b.distance);

      return { ...currentValue, focused: distanceToPlayers.length > 0 ? distanceToPlayers[0].hex.id : undefined };
    }

    return { ...currentValue, focused: undefined };
  }

  processMonsterPath = (currentValue) => {
    const hexes = currentValue.hexes.map(hex => { hex.isPath = false; return hex; });
    if (currentValue.selected && currentValue.focused) {
      const monsterId = currentValue.selected;
      const focusedId = currentValue.focused;
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
              frontier.set(neighbour.id, newCost + hexes[focusedId].coordinate.distance(neighbour.coordinate));
              cameFrom.set(neighbour.id, currentId);
            }
          });
      }


      if (cameFrom.has(focusedId)) {
        let currentId = cameFrom.get(focusedId);
        while (currentId !== monsterId) {
          hexes[currentId].isPath = true;
          currentId = cameFrom.get(currentId);
        }
      }
    }

    return { ...currentValue, hexes };
  }

  filterHexesWithCoordinates = (hexes, coordinates) => hexes.filter(hex => coordinates.find(coordinate => coordinate.q === hex.coordinate.q && coordinate.r === hex.coordinate.r))
}

export default new Store();
