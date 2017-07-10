/**
 * Created by code house on 2017/07/08.
 */
class GeoLocationModel {
  static getUserLocation() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(
          (location) => {
            let lngLat = [location.coords.longitude, location.coords.latitude];
            resolve(lngLat)
          },
          (error) => {
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
          }
        )
     }
      else{
        reject();
      }
    })
  }
}

module.exports = GeoLocationModel;