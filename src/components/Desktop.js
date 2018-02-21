import React from 'react';
import PacketSubset from './PacketSubset.js';
import Client from './Client.js';
import Draggable from 'react-draggable';

class WarpDesktop extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dictionary: null,
      packetNames: [],
      currentValueTable: {}
    };
  }
  componentDidMount() {
    var self = this;
    Client.get_dictionary('/root', function(dict) {
      var names = dict.packets.map(p => p.id);
      names = names.filter(n => !n.includes("TABLE") && !n.includes("TBL"));
      names.sort();
      self.setState((prevState, props) => {
        return { dictionary: dict, packetNames: names };
      });
    });
  }
  render() {
    return (
      <div className="warpDesktop">
        <PacketDock>
          {this.state.packetNames.map(n => <PacketGenerator key={n} name={n} />)}
        </PacketDock>
        <WarpField />
      </div>
    );
  }
}

class PacketDock extends React.Component {
  render() {
    return (
      <div className="packetDock">
        <div className="packetDockTitle">Packet Dock</div>
        <div className="packetDockBody">{this.props.children}</div>
      </div>
    );
  }
}

class PacketGenerator extends React.Component {
  render() {
    return (
      <Draggable>
      <div className="packetGenerator cursor">{this.props.name}</div>
      </Draggable>
    );
  }
}

class WarpField extends React.Component {
  render() {
    return (
      <div className="App">
        <PacketSubset name="packet1" filter="point" />
        <PacketSubset name="packet2" />
      </div>
    );
  }
}

export default WarpDesktop;
