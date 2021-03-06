/**
 * Created by code house on 2017/06/27.
 */
let Graph = require('backbone-graph');
let MarkerIcon = require('./markerIcon');

class GraphData {
  constructor(options) {
    this._routeData = options.routeData;

    this._graphData = new Graph.Collection([
      new Graph.LineData({
        lineColor: GraphData.LINE_COLOR,
        peakColor: GraphData.PEAK_COLOR
      }),
      new Graph.PointData(),
      new Graph.PointData()
    ]);

    this.refresh();
  }

  get graphData() { return this._graphData }

  refresh() {
    this._createProfileData();
    this._createCPData();
    this._createUserData();
    this._graphData.change();

    this.statistics = {
      line: this._graphData.at(0).smoothStatistics,
    };
  }

  _createProfileData() {
    let profileData = this._graphData.at(0);
    profileData.clear();

    let lineList = this._routeData.lineList;
    if(lineList.length === 0){
      return;
    }

    if(this._routeData.lastWayPoint.distance < GraphData.SMOOTHING_INTERVAL * GraphData.METER_PER_KILO){
      return;
    }

    let distance = 0;
    profileData.addPoint(new Graph.Point(distance, lineList[0].altitude[0]));
    lineList.forEach((line) => {
      line.line.reduce((previous, current, index) => {
        distance += GraphData.distance(previous, current) / GraphData.METER_PER_KILO;
        profileData.addPoint(new Graph.Point(distance, line.altitude[index]));
        return current;
      })
    });
    profileData.smooth(
      GraphData.SMOOTHING_INTERVAL,
      GraphData.SMOOTHING_RANGE,
      GraphData.METER_PER_KILO,
      GraphData.LOCAL_MIN_MAX_THRESHOLD
    )
  }

  _createCPData() {
    let cpData = this._graphData.at(1);
    cpData.clear();

    if(this._routeData.lineList.length === 0){
      return;
    }

    let wayPointList = this._routeData.wayPointList;
    wayPointList.forEach((point, index) => {
      if(index === 0 || index === wayPointList.length - 1 || point.icon === MarkerIcon.CHECKPOINT){
        cpData.addPoint(
          new Graph.Point(point.distance / GraphData.METER_PER_KILO, point.altitude),
          GraphData.CP_COLOR,
          Graph.PointData.SHAPE.SQUARE
        );
      }
    })
  }

  _createUserData() {
    let userData = this._graphData.at(2);
    userData.clear();

    if(this._routeData.closestDistance < 0){
      return;
    }

    let lineIndex = this._routeData.closestLineIndex;
    let pointIndex = this._routeData.closestPointIndex;
    let distance = this._routeData.wayPointList[lineIndex].distance;
    let altitude = this._routeData.lineList[lineIndex].altitude[pointIndex];
    if(pointIndex>0){
      this._routeData.lineList[lineIndex].line.slice(0, pointIndex+1).reduce((startPoint, endPoint) => {
        distance += GraphData.distance(startPoint, endPoint);
        return endPoint;
      })
    }

    userData.addPoint(
      new Graph.Point(distance / GraphData.METER_PER_KILO, altitude),
      GraphData.USER_COLOR,
      Graph.PointData.SHAPE.CIRCLE
    );
  }

  static distance(from, to) {
    let deg2rad = (deg) => {
      return deg * (Math.PI/180)
    };

    let lng1 = from[0];
    let lat1 = from[1];
    let lng2 = to[0];
    let lat2 = to[1];

    let R = 6371000;
    let dLat = deg2rad(lat2-lat1);
    let dLon = deg2rad(lng2-lng1);
    let a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

GraphData.AXIS_COLOR = "#7bbcd8";
GraphData.LINE_COLOR = "#ffcc00";
GraphData.PEAK_COLOR = "#ffffff00";
GraphData.CP_COLOR = "#ff0000";
GraphData.USER_COLOR = "#3c4ee6";

GraphData.SMOOTHING_INTERVAL = 0.1;
GraphData.SMOOTHING_RANGE = 10;
GraphData.LOCAL_MIN_MAX_THRESHOLD = 0.01;
GraphData.METER_PER_KILO = 1000;

module.exports = GraphData;