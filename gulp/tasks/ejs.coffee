#
# User: code house
# Date: 2016/05/11
#
gulp = require('gulp')
ejs = require('gulp-ejs')
plumber = require('gulp-plumber')
config = require('../config')
flat = require('gulp-flatten')

gulp.task 'ejs', ->
  gulp.src(config.src + '/*.html')
    .pipe(plumber({
    errorHandler: (err) ->
      console.log(err.messageFormatted);
      @emit('end')
    }))
    .pipe(ejs({minimize:true}))
    .pipe(flat())
    .pipe(gulp.dest(config.dest))
