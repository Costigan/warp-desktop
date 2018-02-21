import React from 'react';
import Draggable from 'react-draggable';

class PacketSubset extends React.Component {
  render() {
    return (
      <Draggable handle="strong">
        <div className="filtered-packet box no-cursor">
          <strong className="cursor">{this.props.name}</strong>
          <FilteredPointList filter={this.props.filter} packet={packet}/>
        </div>
      </Draggable>
    );
  }
}

const packet = { point1: 1, point2: 2, point3: 3 };
//const = '10px sans-serif';

//var canvasCtx = document.createElement('canvas').getContext('2d');

class FilteredPointList extends React.PureComponent {
  render() {
    var rows = [];
    var filter = this.props.filter;
    for (var key in this.props.packet) {
      if (filter === undefined || key.includes(filter)) {
        rows.push(
            <PointAndValue key={key} name={key} value="1" />
        );
      }
    }
    return <div style={{width: '300px', margin: 'auto'}}>{rows}</div>;
  }
}

const PointAndValueNameStyle = { float: 'left', width: '200px', height: '20px'};
const PointAndValueValueStyle = {float: 'right', width: '90px', height: '20px', background: '#EEE'};

class PointAndValue extends React.PureComponent {
  render() {
    return(<div> <div style={PointAndValueNameStyle}>{this.props.name}</div><div style={PointAndValueValueStyle}>{this.props.value}</div></div>)
  }
}

export default PacketSubset;
