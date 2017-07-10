#
# User: code house
# Date: 2016/05/11
#
gulp = require('gulp')
del = require('del')
config = require('../config')

# app フォルダごと削除する
gulp.task 'clean', del.bind(null, [config.dest])
