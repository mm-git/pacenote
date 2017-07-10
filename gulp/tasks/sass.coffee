#
# User: code house
# Date: 2016/05/11
#
gulp = require('gulp')
sass = require('gulp-sass')
autoprefixer = require('gulp-autoprefixer')
cssmin = require('gulp-cssmin')
rename = require('gulp-rename')
plumber = require('gulp-plumber')
flat = require('gulp-flatten')
config = require('../config')

gulp.task 'sass', ->
  gulp.src(config.src + '/css/*.scss')
    .pipe(plumber({
      errorHandler: (err) ->
        console.log(err.messageFormatted);
        @emit('end')
    }))
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(cssmin())
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(flat())
    .pipe(gulp.dest(config.dest + '/css'))
