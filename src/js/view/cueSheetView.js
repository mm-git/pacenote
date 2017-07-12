/**
 * Created by code house on 2017/06/08.
 */
let FileSelectView = require('./fileSelectView');
let GeoLocationModel = require('../model/geoLocationModel');

class CueSheetView {
  constructor(options){
    this.routeData = options.routeData;
    this.frame = {
      name: this.routeData.wayPointList.length>0 ? "cue" : "import"
    };
    this.mouseDownTime = 0;
    this.CueSheetView = new Vue({
      el: "#cue_sheet",
      data: {
        routeData: options.routeData.data,
        frame: this.frame
      },
      methods: {
        importData: () => {
          new FileSelectView()
          .show()
          .then(
            (fileList) => {
              let fileReader = new FileReader();
              fileReader.onload = (e) => {
                this.routeData.deleteData();
                this.routeData.readJSON(JSON.parse(e.target.result));
                this.routeData.store();
                this.frame.name = "cue";
              };
              fileReader.readAsText(fileList[0]);
            },
            () => {}
          )
        },
        clearData: () => {
          let applicationCache = window.applicationCache;
          applicationCache.addEventListener('updateready', () => {
            applicationCache.swapCache();
            location.reload();
          }, false);
          try{
            applicationCache.update();
          }
          catch(e){
            alert(e.message);
          }
        },
        toCue: () => {
          setTimeout(() => {
            this.frame.name = "cue";
          }, 0);
        },
        toImport: () => {
          setTimeout(() => {
            this.frame.name = "import";
          }, 0);
        },
        toProfile: () => {
          setTimeout(() => {
            this.frame.name = "profile";
          }, 0);
        },
        currentCUE: () => {
          GeoLocationModel.getUserLocation()
          .then(
            (lngLat) => {
              this.routeData.setUserLocation(lngLat);
            },
            (error) => {
              alert(error.message);
            }
          )
        },
        mouseDown: (event) => {
          event.preventDefault();

          this.mouseDownTime = setTimeout(() => {
            this.mouseDownTime = 0;
          }, 500);
        },
        mouseUp: (event) => {
          event.preventDefault();

          let right = ($(event.target).width()/2 > event.changedTouches[0].clientX);
          if(this.mouseDownTime!==0){
            clearTimeout(this.mouseDownTime);
            if(right){
              this.routeData.previousCUE();
            }
            else{
              this.routeData.nextCUE();
            }
          }
          else {
            if(right){
              this.routeData.previousCP();
            }
            else{
              this.routeData.nextCP();
            }
          }
          this.mouseDownTime = 0;
        },
        previousCP: () => {
          this.routeData.previousCP();
        },
        previousCUE: () => {
          this.routeData.previousCUE();
        },
        nextCUE: () => {
          this.routeData.nextCUE();
        },
        nextCP: () => {
          this.routeData.nextCP();
        },
        staticMapCircleX: (index) => {
          let center = this.routeData.wayPointList[index].lngLat;
          let centerX = this.lngToTile(center[0]);
          let staticLine = this.routeData.wayPointList[index].staticMapLine;
          if (staticLine.length === 0){
            return CueSheetView.MAP_SIZE/2;
          }
          return this.lngToDrawOffset(staticLine[0][0], centerX);
        },
        staticMapCircleY: (index) => {
          let center = this.routeData.wayPointList[index].lngLat;
          let centerY = this.latToTile(center[1]);
          let staticLine = this.routeData.wayPointList[index].staticMapLine;
          if (staticLine.length === 0){
            return CueSheetView.MAP_SIZE/2;
          }
          return this.latToDrawOffset(staticLine[0][1], centerY);
        },
        staticMapLine: (index) => {
          let center = this.routeData.wayPointList[index].lngLat;
          let centerX = this.lngToTile(center[0]);
          let centerY = this.latToTile(center[1]);
          let staticLine = this.routeData.wayPointList[index].staticMapLine;

          return staticLine
          .map((linePoint, lineIndex) => {
            let x = this.lngToDrawOffset(linePoint[0], centerX);
            let y = this.latToDrawOffset(linePoint[1], centerY);

            if(lineIndex === 0){
              return "M " + x + " " + y;
            }
            else{
              return "L " + x + " " + y;
            }
          })
          .join(" ");
        },
        staticMapArrow: (index) => {
          let staticLine = this.routeData.wayPointList[index].staticMapLine;
          if(staticLine.length < 2){
            return "";
          }

          let center = this.routeData.wayPointList[index].lngLat;
          let centerX = this.lngToTile(center[0]);
          let centerY = this.latToTile(center[1]);
          let radian = -this.getDirectionValue(staticLine[staticLine.length-2], staticLine[staticLine.length-1]) * Math.PI / 180.0;
          let x = this.lngToDrawOffset(staticLine[staticLine.length-1][0], centerX);
          let y = this.latToDrawOffset(staticLine[staticLine.length-1][1], centerY);

          let x1 = CueSheetView.ARROW_SIZE / Math.sqrt(2);
          let y1 = 0;
          let x2 = -5;
          let y2 = CueSheetView.ARROW_SIZE / 2;
          let x3 = -5;
          let y3 = -CueSheetView.ARROW_SIZE / 2;

          return [
            ["M", this.rotateX(x1, y1, radian) + x, this.rotateY(x1, y1, radian) + y].join(" "),
            ["L", this.rotateX(x2, y2, radian) + x, this.rotateY(x2, y2, radian) + y].join(" "),
            ["L", this.rotateX(x3, y3, radian) + x, this.rotateY(x3, y3, radian) + y].join(" ")
          ]
          .join(" ");
        },
        userLocationCircleX: (index) => {
          let center = this.routeData.wayPointList[index].lngLat;
          let centerX = this.lngToTile(center[0]);
          if (this.routeData.userLocation.length === 0){
            return CueSheetView.MAP_SIZE/2;
          }
          return this.lngToDrawOffset(this.routeData.userLocation[0], centerX);
        },
        userLocationCircleY: (index) => {
          let center = this.routeData.wayPointList[index].lngLat;
          let centerY = this.latToTile(center[1]);
          if (this.routeData.userLocation.length === 0){
            return CueSheetView.MAP_SIZE/2;
          }
          return this.latToDrawOffset(this.routeData.userLocation[1], centerY);

        },
        userLocationDirection: (index) => {
          if(this.routeData.distanceList.length <= index){
            return "";
          }

          let radian = -this.routeData.distanceList[index].direction * Math.PI / 180.0;
          let x = this.rotateX(CueSheetView.MAP_SIZE/2-50, 0, radian) + CueSheetView.MAP_SIZE/2;
          let y = this.rotateY(CueSheetView.MAP_SIZE/2-50, 0, radian) + CueSheetView.MAP_SIZE/2;

          let x1 = CueSheetView.DIRECTION_SIZE / Math.sqrt(2);
          let y1 = 0;
          let x2 = 0;
          let y2 = CueSheetView.DIRECTION_SIZE / 2;
          let x3 = 0;
          let y3 = -CueSheetView.DIRECTION_SIZE / 2;

          return [
            ["M", this.rotateX(x1, y1, radian) + x, this.rotateY(x1, y1, radian) + y].join(" "),
            ["L", this.rotateX(x2, y2, radian) + x, this.rotateY(x2, y2, radian) + y].join(" "),
            ["L", this.rotateX(x3, y3, radian) + x, this.rotateY(x3, y3, radian) + y].join(" ")
          ]
          .join(" ");
        },
        userLocationDirectionTextX: (index) => {
          if(this.routeData.distanceList.length <= index){
            return 0;
          }

          let radian = -this.routeData.distanceList[index].direction * Math.PI / 180.0;
          return this.rotateX(CueSheetView.MAP_SIZE/2-50, 0, radian) + CueSheetView.MAP_SIZE/2 - 20;
        },
        userLocationDirectionTextY: (index) => {
          if(this.routeData.distanceList.length <= index){
            return 0;
          }

          let radian = -this.routeData.distanceList[index].direction * Math.PI / 180.0;
          return this.rotateY(CueSheetView.MAP_SIZE/2-50, 0, radian) + CueSheetView.MAP_SIZE/2 + 25;
        },
      }
    })
  }

  lngToTile(lng) {
    return ((lng + 180.0) / 360.0) * Math.pow(2, CueSheetView.ZOOM + 1);
  }

  latToTile(lat) {
    return (1.0 - Math.log(Math.tan(lat * Math.PI/180.0) + 1.0 / Math.cos(lat * Math.PI/180.0)) / Math.PI) / 2 * Math.pow(2, CueSheetView.ZOOM + 1)
  }

  lngToDrawOffset(lng, centerX) {
    return Math.floor(CueSheetView.MAP_SIZE/2 - CueSheetView.TILE_SIZE * (centerX - this.lngToTile(lng)))
  }

  latToDrawOffset(lat, centerY) {
    return Math.floor(CueSheetView.MAP_SIZE/2 - CueSheetView.TILE_SIZE * (centerY - this.latToTile(lat)))
  }

  rotateX(x, y, radian) {
    return x * Math.cos(radian) + y * Math.sin(radian)
  }

  rotateY(x, y, radian) {
    return x * Math.sin(radian) - y * Math.cos(radian)
  }

  getDirectionValue(from, to) {
    let x = to[0] - from[0];
    let y = to[1] - from[1];
    let dir = Math.acos(x / Math.sqrt(x * x + y * y)) / Math.PI * 180;

    if (y < 0) {
      dir = 360 - dir;
    }

    return dir
  }
}

CueSheetView.MAP_SIZE = 300;
CueSheetView.TILE_SIZE = 256;
CueSheetView.ZOOM = 16;
CueSheetView.ARROW_SIZE = 30;
CueSheetView.DIRECTION_SIZE = 20;

module.exports = CueSheetView;