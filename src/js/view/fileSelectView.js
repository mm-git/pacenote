/**
 * Created by code house on 2017/06/29.
 */
class fileSelectView {
  constructor() {
    if(!fileSelectView.instance) {
      fileSelectView.instance = this;

      this.fileSelect = new Vue({
        el: "#file_select",
        methods: {
          changeFile: (e) => {
            e.preventDefault();
            this.reject = null;
            this.resolve(e.target.files);
          }
        }
      });
      this.resolve = null;
      this.reject = null;
    }
    return fileSelectView.instance;

  }

  show() {
    // file select dialogでは、cancelが押された場合イベントが発生しない。
    // 前回表示時のPromiseがpendingのまま場合、
    // 次にダイアログを開いたタイミングでreject()を実行する。
    if(this.reject !== null){
      this.reject();
    }

    let fileSelectElement = document.getElementById("file_select_input");
    fileSelectElement.value = "";
    fileSelectElement.click();

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    })
  }
}

module.exports = fileSelectView;