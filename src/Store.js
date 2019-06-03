import { BehaviorSubject } from 'rxjs';

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
        hexes.push({ q, r, id, type: 'NONE' });
        id++;
      }
    }
    this.data.next({
      ...this.data.value,
      hexes
    });
  }

  select = (q, r) => {
    const currentValue = this.data.value;
    let selected = currentValue.selected;
    const hexes = currentValue.hexes.map((hex) => {
        if (hex.q === q && hex.r === r) {
          switch(currentValue.mode) {
            case 'TOGGLE_PLAYER':
              hex.type = hex.type === 'player' ? 'NONE' : 'player';
              break;
            case 'TOGGLE_MONSTER':
              hex.type = hex.type === 'monster' ? 'NONE' : 'monster';
              break;
            case 'TOGGLE_WALL':
              hex.type = hex.type === 'wall' ? 'NONE' : 'wall';
              break;
            case 'TOGGLE_TRAP':
              hex.type = hex.type === 'trap' ? 'NONE' : 'trap';
              break;
            case 'TOGGLE_OBSTACLE':
              hex.type = hex.type === 'obstacle' ? 'NONE' : 'obstacle';
              break;
            default:
              selected = hex === selected ? undefined : hex;
          }
        } 
        return hex;
    });
    this.data.next({ ...currentValue, hexes, selected });
  }

  setMode = (mode) => {
    this.data.next({
      ...this.data.value,
      mode
    });
  }

  processMonsterFocus = (currentValue) => {
    if (currentValue.selected && currentValue.selected.type === 'monster') {
      const monster = currentValue.selected;
      const players = currentValue.hexes.filter(hex => hex.type === 'player');
      const visiblePlayers = players.filter(player => {
        const coordinatesBetweenPlayerAndMonster = this.getLineBetweenTwoHexes(monster, player);
        const hexesBetweenPlayerAndMonster = this.filterHexesWithCoordinates(currentValue.hexes, coordinatesBetweenPlayerAndMonster);
        return typeof hexesBetweenPlayerAndMonster.find(hex => hex.type === 'wall') === 'undefined';
      });
      const distanceToPlayers = visiblePlayers.map((player) => ({ ...player, distance: this.getDistanceFromAxialCoordinates(monster, player) })).sort((a, b) => a.distance - b.distance);
      
      return { ...currentValue, focused: distanceToPlayers.length > 0 ? distanceToPlayers[0] : undefined };
    }

    return { ...currentValue, focused: undefined };
  }

  processMonsterPath = (currentValue) => {
    const hexes = currentValue.hexes.map(hex => { hex.isPath = false; return hex; });
    if (currentValue.selected && currentValue.focused) {
      const monsterId = currentValue.selected.id;
      const focusedId = currentValue.focused.id;
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

        this.filterHexesWithCoordinates(hexes, this.getNeighborsCoordinates(currentHex))
          .filter(hex => hex.type !== 'wall' && hex.type !== 'obstacle')
          .forEach((neighbour) => {
            const newCost = costTo.get(currentId) + (neighbour.type === 'trap' ? 200 : 0);
            if (!costTo.has(neighbour.id) || newCost < costTo.get(neighbour.id)) {
              costTo.set(neighbour.id, newCost);
              frontier.set(neighbour.id, newCost + this.getDistanceFromAxialCoordinates(currentValue.focused, neighbour));
              cameFrom.set(neighbour.id, currentId);
            }
          });
      }

      let currentId = cameFrom.get(focusedId);
      while (currentId !== monsterId) {
        hexes[currentId].isPath = true;
        currentId = cameFrom.get(currentId);
      }
    }

    return { ...currentValue, hexes };
  }

  filterHexesWithCoordinates = (hexes, coordinates) => hexes.filter(hex => coordinates.find(coordinate => coordinate.q === hex.q && coordinate.r === hex.r))

  // Hexagonal utilities

  /*
    axial coordinates : (q, r)
    cube coordinates: (x, y, z) with x=q, z=r, y=-x-z 
  */

  getCubeCoordinates = (hex) => ({x: hex.q, y: -hex.q-hex.r, z: hex.r })

  getAxialCoordinates = (cube) => ({q: cube.x, r: cube.z })

  getDistanceFromCubeCoordinates = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.z, b.z))

  getDistanceFromAxialCoordinates = (a, b) => this.getDistanceFromCubeCoordinates(this.getCubeCoordinates(a), this.getCubeCoordinates(b))

  /**
   @param hex : axial coordinates of an hex
   @return array of axial coordinates of the hex neighbours
  */
  getNeighborsCoordinates = (hex) => [
    {q: hex.q + 1, r: hex.r},
    {q: hex.q + 1, r: hex.r - 1},
    {q: hex.q, r: hex.r - 1},
    {q: hex.q - 1, r: hex.r},
    {q: hex.q - 1, r: hex.r + 1},
    {q: hex.q, r: hex.r + 1},
  ]

  /**
    @param a : axial coordinates of an hex
    @param b : axial coordinates of an hex
    @return array of axial coordinates of the hexes on the line between A and B
  */
  getLineBetweenTwoHexes = (a, b) => {
    const cubeA = this.getCubeCoordinates(a);
    const cubeB = this.getCubeCoordinates(b);
    const N = this.getDistanceFromCubeCoordinates(cubeA, cubeB);
    const results = [];
    for (let i = 0; i < N; i++) {
      results.push(
        this.getAxialCoordinates(
          this.cubeRound(this.cubeLerp(cubeA, cubeB, 1.0/N*i))
        )
      );
    }

    return results;
  }

  /**
    @param a : cubic coordinates for the point A
    @param b : cubic coordinates for the point B
    @param t : a distance
    @return cubic coordinates of a point between A and B
  */
  cubeLerp = (a, b, t) => ({
    x: this.lerp(a.x, b.x, t),
    y: this.lerp(a.y, b.y, t),
    z: this.lerp(a.z, b.z, t)
  })

  /**
    @param a : coordinate of the point A in a given dimension
    @param b : coordinate of the point B in the same dimension
    @param t : a distance
    @return a coordinate between A and B in the given dimension
  */
  lerp = (a, b, t) => a + (b - a) * t

  /**
   @param cubic coordinates of a floating point
   @return cubic coordinates of an Hex
  */
  cubeRound = (cube) => {
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

    return { x: rx, y: ry, z: rz};
  }
}

export default new Store();