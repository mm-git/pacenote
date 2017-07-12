/**
 * Created with PhpStorm.
 * Date: 202017/06/19
 */
let LocalStorage = require('./localStorageModel');
let MarkerIcon = require('./markerIcon');
let WayPointData = require('./wayPointData');
let LineData = require('./lineData');

class RouteData {
  constructor(){
    this.data = {
      title: "",
      wayPointList: [],
      lineList: [],
      selectedIndex: 0,
      distanceList: [],
      userLocation: [],
      closest: {
        distance: -1,
        lineIndex: -1,
        pointIndex: -1
      }
    };
    this.restore();
  }

  get title() { return this.data.title }
  set title(val) { this.data.title = val; }
  get wayPointList() { return this.data.wayPointList }
  get lineList() { return this.data.lineList }
  get firstWayPoint() {
    if(this.data.wayPointList.length === 0) {
      return null;
    }
    return this.data.wayPointList[0]
  }
  get lastWayPoint() {
    if(this.data.wayPointList.length === 0) {
      return null;
    }
    return this.data.wayPointList[this.data.wayPointList.length - 1]
  }
  get selectedIndex() { return this.data.selectedIndex }
  set selectedIndex(val) { this.data.selectedIndex = val }
  get closestDistance() { return this.data.closest.distance }
  set closestDistance(val) { this.data.closest.distance = val }
  get closestLineIndex() { return this.data.closest.lineIndex }
  set closestLineIndex(val) { this.data.closest.lineIndex = val }
  get closestPointIndex() { return this.data.closest.pointIndex }
  set closestPointIndex(val) { this.data.closest.pointIndex = val }
  get distanceList() { return this.data.distanceList }
  set distanceList(val) { this.data.distanceList = val }
  get userLocation() { return this.data.userLocation }
  set userLocation(val) { this.data.userLocation = val }

  deleteData() {
    this.title = "";
    this.wayPointList.splice(0, this.wayPointList.length);
    this.lineList.splice(0, this.lineList.length);
    this.selectedIndex = 0;
    this.distanceList.splice(0, this.distanceList.length);
  }

  previousCP() {
    while(true){
      this.selectedIndex--;

      if(this.selectedIndex<0){
        this.selectedIndex = 0;
        break;
      }
      if(this.wayPointList[this.selectedIndex].icon >= MarkerIcon.CHECKPOINT){
        break;
      }
    }
  }

  previousCUE() {
    while(true){
      this.selectedIndex--;

      if(this.selectedIndex<0){
        this.selectedIndex = 0;
        break;
      }
      if(this.wayPointList[this.selectedIndex].icon > MarkerIcon.POINT){
        break;
      }
    }
  }

  nextCUE() {
    while(true){
      this.selectedIndex++;

      if(this.selectedIndex >= this.wayPointList.length){
        this.selectedIndex = this.wayPointList.length - 1;
        break;
      }
      if(this.wayPointList[this.selectedIndex].icon > MarkerIcon.POINT){
        break;
      }
    }
  }

  nextCP() {
    while(true){
      this.selectedIndex++;

      if(this.selectedIndex >= this.wayPointList.length){
        this.selectedIndex = this.wayPointList.length - 1;
        break;
      }
      if(this.wayPointList[this.selectedIndex].icon >= MarkerIcon.CHECKPOINT){
        break;
      }
    }
  }

  setUserLocation(lngLat) {
    this.userLocation.splice(0, this.userLocation.length);
    this.userLocation.push(lngLat[0]);
    this.userLocation.push(lngLat[1]);

    this._createDistanceList(lngLat);
    this._calculateClosestIndex(lngLat);
  }

  _createDistanceList(lngLat) {
    this.distanceList.splice(0, this.distanceList.length);
    this.wayPointList.forEach((wayPoint, index) => {
      let distance = LineData.distance(wayPoint.lngLat, lngLat);
      this.distanceList.push({
        distance: distance,
        direction: LineData.getDirectionValue(wayPoint.lngLat, lngLat)
      });
    });
  }

  _calculateClosestIndex(lngLat) {
    let minDistance = 20000000;
    let minLineIndex = -1;
    let minPointIndex = -1;
    this.lineList.forEach((line, lineIndex) => {
      line.line.forEach((point, pointIndex) => {
        let distance = LineData.distance(point, lngLat);
        if(distance < minDistance){
          minDistance = distance;
          minLineIndex = lineIndex;
          minPointIndex = pointIndex;
        }
      })
    });

    if(minLineIndex !== -1){
      this.closestDistance = minDistance;
      this.closestLineIndex = minLineIndex;
      this.closestPointIndex = minPointIndex;
      this.selectedIndex = minLineIndex;

      while(this.wayPointList[this.selectedIndex].icon===MarkerIcon.POINT && this.selectedIndex>0){
        this.selectedIndex--;
      }
    }
  }

  toJSON() {
    return {
      title: this.data.title,
      wayPoint: this.data.wayPointList.map((wayPoint) => { return wayPoint.toJSON() }),
      route: this.data.lineList.map((line) => { return line.toJSON() }),
      statistics: {
        distance: this.data.wayPointList.length === 0 ? 0 : this.lastWayPoint.distance,
        altitude: {
          max: 0,
          min: 0,
          totalGain: 0,
          totalDrop: 0
        }
      }
    }
  }

  readJSON(json) {
    if (json.title){
      this.title = json.title;
    }

    if (json.wayPoint){
      if(json.wayPoint.every((wayPointJson) => {
        let wayPoint = new WayPointData();
        if(wayPoint.readJSON(wayPointJson) === false){
          console.log("read waypoint failed");
          return false;
        }
        this.wayPointList.push(wayPoint);
        return true;
      }) === false){
        return false;
      }
    }

    if (json.route){
      if(json.route.every((routeJson) => {
          let line = new LineData();
          if(line.readJSON(routeJson) === false){
            console.log("read route failed");
            return false;
          }
          this.lineList.push(line);
          return true;
        }) === false){
        return false;
      }
    }

    this._fixWayPoint();
    return true
  }

  _fixWayPoint() {
    this._fixWayPointDistance();
    this._fixWayPointStaticMap();
  }

  _fixWayPointDistance() {
    if (this.lineList.length === 0) {
      return;
    }

    this.firstWayPoint.distance = 0;
    this.firstWayPoint.interval = 0;
    this.firstWayPoint.intervalCP = 0;

    let distance = 0;
    let interval = 0;
    let intervalCP = 0;
    this.lineList.forEach((line, index) => {
      distance += line.distance;
      interval += line.distance;
      intervalCP += line.distance;
      this.wayPointList[index + 1].distance = distance;
      this.wayPointList[index + 1].interval = interval;
      this.wayPointList[index + 1].intervalCP = intervalCP;

      if (this.wayPointList[index + 1].icon >= MarkerIcon.CUE_POINT) {
        interval = 0;
      }

      if (this.wayPointList[index + 1].icon >= MarkerIcon.CHECKPOINT) {
        intervalCP = 0;
      }
    });
  }

  _fixWayPointStaticMap() {
    this.wayPointList.forEach((wayPoint, index) => {
      wayPoint.staticMapLine = this._staticMapLine(index);
    })
  }

  _staticMapLine(wayPointIndex) {
    let center = this.wayPointList[wayPointIndex].lngLat;
    let staticLine = [];

    let outsidePoint = null;
    for(let lineIndex=wayPointIndex-1; lineIndex>=0; lineIndex--){
      let outside = this.lineList[lineIndex].line.slice().reverse().some((linePoint) => {
        if(LineData.distance(center, linePoint) > RouteData.STATIC_LINE_RADIUS) {
          outsidePoint = linePoint;
          return true;
        }
        staticLine.unshift(linePoint);
        return false
      });
      if (outside) {
        break;
      }
    }
    if(outsidePoint !== null){
      let radiusPoint = this._getRadiusPoint(staticLine[0], outsidePoint, center);
      staticLine.splice(0, 0, radiusPoint);
    }

    outsidePoint = null;
    for(let lineIndex=wayPointIndex; lineIndex<this.lineList.length; lineIndex++){
      let outside = this.lineList[lineIndex].line.some((linePoint) => {
        if(LineData.distance(center, linePoint) > RouteData.STATIC_LINE_RADIUS) {
          outsidePoint = linePoint;
          return true;
        }
        staticLine.push(linePoint);
        return false
      });
      if (outside) {
        break;
      }
    }
    if(outsidePoint !== null){
      let radiusPoint = this._getRadiusPoint(staticLine[staticLine.length - 1], outsidePoint, center);
      staticLine.push(radiusPoint);
    }

    return staticLine;
  }

  // insidePointとoutsidePointを結んだ直線と、
  // centerを中心とする半径STATIC_LINE_RADIUSの円の交点を求める。
  _getRadiusPoint(insidePoint, outsidePoint, center) {
    let insideDistance = LineData.distance(insidePoint, center);
    let outsideDistance = LineData.distance(outsidePoint, center);

    let a = RouteData.STATIC_LINE_RADIUS - insideDistance;
    let b = outsideDistance - RouteData.STATIC_LINE_RADIUS;

    return [
      (a * outsidePoint[0] + b * insidePoint[0]) / (a + b),
      (a * outsidePoint[1] + b * insidePoint[1]) / (a + b)
    ];
  }

  store() {
    let storeData = this.toJSON();
    let storage = new LocalStorage();
    storage.write('route_data', storeData);
  }

  restore() {
    let storage = new LocalStorage();
    let data = storage.read('route_data');
    if(data === null){
      return;
    }

    if(this.readJSON(data) === false){
        this.deleteData();
    }
    console.log("RouteData.restore() : wayPoint=" + this.wayPointList.length + " line=" + this.lineList.length);
  }

}

RouteData.STATIC_LINE_RADIUS = 100;
RouteData.ITEM_PER_PAGE = 10;

module.exports = RouteData;