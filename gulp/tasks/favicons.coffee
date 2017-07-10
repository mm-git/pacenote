#
# User: code house
# Date: 2016/05/11
#
gulp = require('gulp')
rename = require('gulp-rename')
favicons = require('gulp-favicons')
config = require('../config')

# ./client/base/images/favicon.png をベースに必要なfaviconを作成しappフォルダに出力する。
gulp.task 'favicons', ->
  gulp.src(config.src + '/images/favicon.png')
  .pipe(favicons({
    appName: "route",
    appDescription: "Offline pacenotes viewer.",
    developerName: "code house",
    developerURL: "http://code-house.jp/",
    background: "#ffffff",
    path: "/",
    url: "http://ekarte/",
    display: "standalone",
    orientation: "portrait",
    version: 1.0,
    logging: false,
    online: false,
    # html: "favicons.html",
    # pipeHTML: true,
    # replace: true
    icons: {
      android: true,
      appleIcon: false,
      appleStartup: false,
      coast: false,
      favicons: true,
      firefox: false,
      windows: false,
      yandex: false
    }
  }))
  .pipe(gulp.dest(config.dest))
