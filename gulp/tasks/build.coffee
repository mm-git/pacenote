#
# User: code-house
# Date: 2016/05/11
#
gulp = require('gulp')
sequence = require('run-sequence')

gulp.task 'build', (cb) ->
  sequence(
    'clean'
    ['favicons', 'sass', 'js', 'copy']
    'ejs'
    cb
  )
