/**
 * Created with PhpStorm.
 * Date: 202017/06/19
 */
class LineData {
  constructor(options){
    this.data = {
      line: options ? options.line : [],
      lineMode: options ? options.lineMode : 1,
      altitude: [],
      ref: options ?  options.ref : "",
      name: options ? options.name : "",
      zero: false,
      type: LineData.TYPE.NORMAL,
      direction: {
        start: 0,
        end: 0,
        name: ""
      },
      distance: 0,
      uniqueIndex: LineData._uniqueIndex++
    };

    this.initialized = Promise.resolve();
  }

  get line() { return this.data.line }
  set line(val) { this.data.line = val }
  get firstPoint() { return this.data.line[0] }
  get lastPoint() { return this.data.line[this.data.line.length - 1] }
  get lineMode() { return this.data.lineMode }
  set lineMode(val) { this.data.lineMode = val }
  get altitude() { return this.data.altitude }
  set altitude(val) { this.data.altitude = val }
  get ref() { return this.data.ref }
  set ref(val) { this.data.ref = val }
  get name () { return this.data.name }
  set name (val) { this.data.name = val }
  get zero() { return this.data.zero }
  set zero(val) { this.data.zero = val }
  get type() { return this.data.type }
  set type(val) { this.data.type = val }
  get directionStart() { return this.data.direction.start }
  set directionStart(val) { this.data.direction.start = val }
  get directionEnd() { return this.data.direction.end }
  set directionEnd(val) { this.data.direction.end = val }
  get directionName() { return this.data.direction.name }
  set directionName(val) { this.data.direction.name = val }
  get distance() { return this.data.distance }
  set distance(val) { this.data.distance = val }
  get uniqueIndex() { return this.data.uniqueIndex }
  set setLine(json) {
    if(json.every((element) => {
      if (!("point" in element) || !("altitude" in element)){
        return false;
      }
      if (!("lng" in element.point) || !("lat" in element.point)){
        return false;
      }
      return !(typeof(element.point.lng) !== "number" ||
               typeof(element.point.lat) !== "number" ||
               typeof(element.altitude) !== "number");
    }) === false){
      throw("json data is invalid");
    }

    this.data.line = json.map((element) => {
      return [element.point.lng, element.point.lat];
    });
    this.data.altitude = json.map((element) => { return element.altitude });

    this._getDirection();
    this.data.uniqueIndex = LineData._uniqueIndex++;
  }

  isInitialized(){
    return this.initialized.then(
      () => { return this }
    )
  }

  toJSON() {
    return {
      lineMode: this.lineMode,
      ref: this.ref,
      name: this.name,
      zero: this.zero,
      type: this.type,
      direction: this.data.direction,
      distance: this.distance,
      line: this.line.map((point, index) => {
        return {
          point: {
            lng: point[0],
            lat: point[1]
          },
          altitude: this.altitude[index]
        };
      })
    }
  }

  readJSON(json) {
    let readOptions = [
      {numeric: true,  key: 'lineMode', set: 'lineMode'},
      {numeric: false, key: 'ref',      set: 'ref'},
      {numeric: false, key: 'name',     set: 'name'},
      {numeric: false, key: 'zero',     set: 'zero'},
      {numeric: true,  key: 'type',     set: 'type'},
      {numeric: true,  key: 'distance', set: 'distance'},
      {numeric: false, key: 'line',     set: 'setLine'}
    ];

    return readOptions.every((option) => {
      if(!(option.key in json)){
        console.error("LineData.readJSON() failed - " + option.key + " is not found.");
        return false;
      }
      if(option.numeric && typeof(json[option.key]) !== "number"){
        console.error("LineData.readJSON() failed - " + option.key + "is not number");
        return false;
      }
      try{
        this[option.set] = json[option.key];
      }
      catch(e){
        console.error("LineData.readJSON() failed - " + option.key + " exception occurred");
        console.error(e);
        return false
      }
      return true;
    });
  }

  _getDirection() {
    let lineLength = this.data.line.length;
    if (lineLength < 2) {
      return;
    }

    this.data.direction.start = LineData.getDirectionValue(this.data.line[0], this.data.line[1]);
    this.data.direction.end = LineData.getDirectionValue(this.data.line[lineLength-2], this.data.line[lineLength-1]);
    this.data.direction.name = LineData.getDirectionString(this.data.direction.start);
  }

  static getDirectionValue(from, to) {
    let x = to[0] - from[0];
    let y = to[1] - from[1];
    let dir = Math.acos(x / Math.sqrt(x * x + y * y)) / Math.PI * 180;

    if (y < 0) {
      dir = 360 - dir;
    }
    return dir
  }

  static getDirectionString(direction) {
    switch (true){
      case direction < 22.5:
        return "E";
      case direction < 67.5:
        return "NE";
      case direction < 112.5:
        return "N";
      case direction < 157.5:
        return "NW";
      case direction < 202.5:
        return "W";
      case direction < 247.5:
        return "SW";
      case direction < 292.5:
        return "S";
      case direction < 337.5:
        return "SE";
      default:
        return "E";
    }
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

LineData.TYPE = {
  NORMAL: 1,
  TUNNEL: 2,
  BRIDGE: 3,
  FERRY:4
};

LineData._uniqueIndex = 1;

module.exports = LineData;
