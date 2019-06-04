import React, { Component } from 'react';
import Hex from './Hex';

class Map extends Component {
  render() {
    return (
      <svg viewBox="0 0 50 50" className="map">
        <g transform="translate(25, 25)">
          { this.props.hexes.map(hex => <Hex
            hex={ hex }
            selected={ hex.id === this.props.selected } 
            focused={ hex.id === this.props.focused }
            key={ hex.id }
          />) }
        </g>
      </svg>
    );
  }
}

Map.defaultProps = {
  hexes: [],
  selected: undefined,
  focused: undefined
};

export default Map;
