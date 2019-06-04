import React, { Component } from 'react';
import store from './Store';

class Hex extends Component {
  onClick() {
    store.select(this.props.hex.id);
  }

  render() {
    return (
      <g 
        className={ `hex ${this.props.selected ? 'selected': ''} ${this.props.focused ? 'focused': ''} ${this.props.hex.isPath ? 'path': ''} ${this.props.hex.tile.constructor.name.toLowerCase() }`}
        x={ this.props.hex.x } y={ this.props.hex.y } onClick={ () => this.onClick() }
      >
        <polygon points={ this.props.hex.points.join(' ') }/>
      </g>    
    );
  }
}

Hex.defaultProps = {
  hex: undefined,
  selected: false,
  focused: false
};

export default Hex;
