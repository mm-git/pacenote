/**
 * Created by code house on 2017/05/17.
 */
let LZString = require('lz-string');

class LocalStorageModel {
  constructor(){
    if(!LocalStorageModel.instance){
      LocalStorageModel.instance = this;
    }
    return LocalStorageModel.instance;
  }

  isExistKey(key) {
    return Object.keys(localStorage).some((storageKey) => {
      return storageKey == key;
    })
  }

  read(key) {
    if(this.isExistKey(key)){
      let jsonString = LZString.decompress(localStorage.getItem(key));
      return JSON.parse(jsonString);
    }
    return null;
  }

  write(key, data) {
    localStorage.setItem(key, LZString.compress(JSON.stringify(data)));
  }
}

module.exports = LocalStorageModel;