/**
 * Created by code house on 2017/06/27.
 */
let Graph = require('backbone-graph');
let GraphData = require('../model/graphData');

class ProfileView {
  constructor(options) {
    this._graphData = options.graphData;
    this._graph = new Graph.GraphView({
      collection: this._graphData.graphData,
      width: parseInt(296 / 0.265),
      height: parseInt(102.5 / 0.265),
      xAxis: {max:100, interval:50, subInterval:10, axisColor: GraphData.AXIS_COLOR},
      yAxis: {max:1000, interval:500, subInterval:100, axisColor: GraphData.AXIS_COLOR},
      range: {
        color: GraphData.AXIS_COLOR,
        opacity: 1
      }
    });
    this._graph.$el.appendTo("#map_profile");
    this._graphData.graphData.change();
  }
}

module.exports = ProfileView;