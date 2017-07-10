/**
 * Created with PhpStorm.
 * Date: 202017/06/19
 */
let MarkerIcon = require('./markerIcon');

class WayPointData {
  constructor(options) {
    this.data = {
      lngLat: options ? options.lngLat : [0, 0],
      icon: options ? options.icon : 0,
      name: {},
      comment: "",
      turn: 8,
      distance: 0,
      interval: 0,
      intervalCP: 0,
      altitude: 0,
      staticMapImage: "",
      staticMapLine: [],
      uniqueIndex: WayPointData._uniqueIndex++
    };

    this.initialized = Promise.resolve();
  }

  get point() { return this.data.lngLat }
  set point(val) { this.data.lngLat = val }
  get lngLat() { return this.data.lngLat }
  set lngLat(val) { this.data.lngLat = val }
  get icon() { return this.data.icon }
  set icon(val) { this.data.icon = val }
  get name() { return this.data.name }
  set name(val) { this.data.name = val }
  get comment() { return this.data.comment }
  set comment(val) { this.data.comment = val }
  get turn() { return this.data.turn }
  set turn(val) { this.data.turn = val }
  get distance() { return this.data.distance }
  set distance(val) { this.data.distance = val }
  get interval() { return this.data.interval }
  set interval(val) { this.data.interval = val }
  get intervalCP() { return this.data.intervalCP }
  set intervalCP(val) { this.data.intervalCP = val }
  get altitude() { return this.data.altitude }
  set altitude(val) { this.data.altitude = val }
  get staticMapImage() { return this.data.staticMapImage }
  set staticMapImage(val) { this.data.staticMapImage = val }
  get staticMapLine() { return this.data.staticMapLine }
  set staticMapLine(val) { this.data.staticMapLine = val }
  get uniqueIndex() { return this.data.uniqueIndex }
  set setPoint(json) {
    if (!("lng" in json) || !("lat" in json)){
      throw("json do not have lng or lat");
    }

    if (typeof(json.lat) !== "number" || typeof(json.lng) !== "number"){
      throw("lat/lng is not a number");
    }

    this.data.lngLat[0] = json.lng;
    this.data.lngLat[1] = json.lat;
    this.data.uniqueIndex = WayPointData._uniqueIndex++;
  }

  isInitialized(){
    return this.initialized.then(
      () => { return this }
    )
  }

  toJSON() {
    return {
      point: {
        lng: this.lngLat[0],
        lat: this.lngLat[1]
      },
      icon: this.icon,
      name: this.name,
      comment: this.comment,
      turn: this.turn,
      distance: this.distance,
      interval: this.interval,
      intervalCP: this.intervalCP,
      altitude: this.altitude,
      staticMapImage: this.staticMapImage
    }
  }

  readJSON(json) {
    let readOptions = [
      {numeric: false, key: 'point',          set: 'setPoint'},
      {numeric: true,  key: 'icon',           set: 'icon'},
      {numeric: false, key: 'name',           set: 'setName'},
      {numeric: false, key: 'comment',        set: 'comment'},
      {numeric: true,  key: 'turn',           set: 'turn'},
      {numeric: true,  key: 'altitude',       set: 'altitude'},
      {numeric: false, key: 'staticMapImage', set: 'staticMapImage'}
    ];

    return readOptions.every((option) => {
      if(!(option.key in json)){
        console.error("WayPointData.readJSON() failed - " + option.key + " is not found.");
        return false;
      }
      if(option.numeric && typeof(json[option.key]) !== "number"){
        console.error("WayPoint.readJSON() failed - " + option.key + "is not number");
        return false;
      }
      try{
        this[option.set] = json[option.key];
      }
      catch(e){
        console.error("WayPoint.readJSON() failed - " + option.key + " exception occurred");
        console.error(e);
        return false
      }
      return true;
    });
  }
}

WayPointData._uniqueIndex = 1;

module.exports = WayPointData;