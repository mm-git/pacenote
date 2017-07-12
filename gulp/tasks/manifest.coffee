#
# User: code house
# Date: 2017/07/12
#
gulp = require('gulp')
plumber = require('gulp-plumber')
insert = require('gulp-insert')
crypto = require('crypto')
config = require('../config')

gulp.task 'manifest', ->
  hash = '# ' + crypto.randomBytes(16).toString('hex');

  gulp.src(config.src + '/appcache.manifest')
    .pipe(plumber({
      errorHandler: (err) ->
        console.log(err.messageFormatted);
        @emit('end')
    }))
    .pipe(insert.append(''))
    .pipe(insert.append(hash))
    .pipe(gulp.dest(config.dest))

