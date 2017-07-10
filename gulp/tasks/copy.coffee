#
# User: code house
# Date: 2016/05/18
#
gulp = require('gulp')
plumber = require('gulp-plumber')
config = require('../config')

gulp.task 'copy', ->
  config.copyList.forEach((copy) ->
    console.log copy
    gulp.src(copy[0])
      .pipe(gulp.dest(config.dest + copy[1]))
  )
