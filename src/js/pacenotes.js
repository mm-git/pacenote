/**
 * Created by code house on 2017/07/05.
 */
let RouteData = require('./model/routeData');
let GraphData = require('./model/graphData');

let CueSheetView = require('./view/cueSheetView');
let ProfileView = require('./view/profileView');

// initialize model
let routeData = new RouteData();
let graphData = new GraphData({
  routeData: routeData
});

// initialize view
let cueSheetView = new CueSheetView({
  routeData: routeData,
  graphData: graphData
});
let profileView = new ProfileView({
  graphData: graphData
});
