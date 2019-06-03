import React, { Component } from 'react';
import store from './Store';

class Hex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      x: 0,
      y: 0,
      points: []
    };
    
  }

  componentDidMount() {
    this.convertHexToPix(this.props.q, this.props.r, this.props.size);
  }

  componentWillReceiveProps(nextProps) {
    this.convertHexToPix(nextProps.q, nextProps.r, nextProps.size);
  }

  convertHexToPix(q, r, size) {
    const x = (Math.sqrt(3.0) * q + Math.sqrt(3.0)/2.0 * r) * size;
    const y = (3/2 * r) * size;
    const points = [];
    for(let i = 0; i < 6; i++) {
      const deg = 60 * i + 30;
      const rad = Math.PI / 180 * deg;
      points.push((x + size * Math.cos(rad)) + ',' + (y + size * Math.sin(rad)));
    }
    this.setState({ x, y, points });
  }

  onClick() {
    store.select(this.props.q, this.props.r);
  }

  render() {
    return (
      <g className={ `hex ${this.props.selected ? 'selected': ''} ${this.props.focused ? 'focused': ''} ${this.props.path ? 'path': ''} ${this.props.type}`} x={ this.state.x } y={ this.state.y } onClick={ () => this.onClick() }>
        <polygon points={ this.state.points.join(' ') }/>
      </g>    
    );
  }
}

Hex.defaultProps = {
  q: 0,
  r: 0,
  size: 2,
  selected: false,
  path: false,
  focused: false,
  type: 'NONE'
};

export default Hex;
