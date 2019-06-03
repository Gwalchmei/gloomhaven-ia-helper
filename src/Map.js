import React, { Component } from 'react';
import Hex from './Hex';

class Map extends Component {
  render() {
    return (
      <svg viewBox="0 0 50 50" className="map">
        <g transform="translate(25, 25)">
          { this.props.hexes.map(hex => <Hex 
            q={ hex.q } 
            r={ hex.r } 
            selected={ this.props.selected && hex.q === this.props.selected.q && hex.r === this.props.selected.r } 
            focused={ this.props.focused && hex.q === this.props.focused.q && hex.r === this.props.focused.r } 
            type={ hex.type }
            path={ hex.isPath } 
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
