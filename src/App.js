import React, { Component } from 'react';
import './App.css';
import Map from './Map';
import store from './Store';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hexes: [],
      mode: 'TOGGLE_PLAYER',
      selected: undefined,
      focused: undefined
    };
  }

  componentDidMount() {
    store.initialize(5);
    store.getDataSubject().subscribe((data) => {
      this.setState(data);
    });
  }

  render() {
    return (
      <div className="App">
        <Map hexes={ this.state.hexes } selected={ this.state.selected } focused={ this.state.focused } />
        <div>
          <button className={ this.state.mode === 'SELECT' ? 'active' : undefined } onClick={ () => store.setMode('SELECT') }>Select</button>
          <button className={ this.state.mode === 'TOGGLE_PLAYER' ? 'active' : undefined } onClick={ () => store.setMode('TOGGLE_PLAYER') }>Toggle player</button>
          <button className={ this.state.mode === 'TOGGLE_MONSTER' ? 'active' : undefined } onClick={ () => store.setMode('TOGGLE_MONSTER') }>Toggle monster</button>
          <button className={ this.state.mode === 'TOGGLE_WALL' ? 'active' : undefined } onClick={ () => store.setMode('TOGGLE_WALL') }>Toggle wall</button>
          <button className={ this.state.mode === 'TOGGLE_TRAP' ? 'active' : undefined } onClick={ () => store.setMode('TOGGLE_TRAP') }>Toggle trap/hazardous</button>
          <button className={ this.state.mode === 'TOGGLE_OBSTACLE' ? 'active' : undefined } onClick={ () => store.setMode('TOGGLE_OBSTACLE') }>Toggle obstacle</button>
          <button className={ this.state.mode === 'TOGGLE_DIFFICULT' ? 'active' : undefined } onClick={ () => store.setMode('TOGGLE_DIFFICULT') }>Toggle difficult terrain</button>
        </div>
      </div>
    );
  }
}

export default App;
