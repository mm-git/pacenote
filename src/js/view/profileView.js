/**
 * Created by code house on 2017/06/27.
 */
let Graph = require('backbone-graph');
let GraphData = require('../model/graphData');

class ProfileView {
  constructor(options) {
    let profile = document.getElementById("cue_sheet");

    this._graphData = options.graphData;
    this._graph = new Graph.GraphView({
      collection: this._graphData.graphData,
      width: profile.clientWidth > profile.clientHeight ? profile.clientWidth : profile.clientHeight,
      height: profile.clientWidth > profile.clientHeight ? profile.clientHeight/2 : profile.clientWidth/2,
      xAxis: {max:100, interval:50, subInterval:10, axisColor: GraphData.AXIS_COLOR},
      yAxis: {max:1000, interval:500, subInterval:500, axisColor: GraphData.AXIS_COLOR},
      range: {
        color: GraphData.AXIS_COLOR,
        opacity: 1
      }
    });
    this._graph.$el.appendTo("#map_profile_graph");
    this._graphData.graphData.change();
  }
}

module.exports = ProfileView;