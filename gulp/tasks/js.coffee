#
# User: code house
# Date: 2016/05/16
#
gulp = require('gulp')
gulp_webpack = require('gulp-webpack')
webpack = require('webpack')
uglify = require('gulp-uglify')
rename = require('gulp-rename')
plumber = require('gulp-plumber')
config = require('../config')

webpackConfig =
  entry:
    pacenotes: config.src + '/js/pacenotes.js'
  output:
    filename: '[name].js'
  module:
    loaders: [
      {test: /\.json$/, loader: "json-loader"}
      {
        test: /\.js$/
        exclude:/node_modeules/
        loader: "babel-loader",
        query: {
          presets: ['es2015']
          compact: false
        }
      }
    ]
  resolve:
    alias:
      extensions: ['', 'js', 'json']
      vue$: 'vue/dist/vue.common.js'
  plugins:[
    new webpack.ProvidePlugin({
      jQuery: "jquery"
      $: "jquery"
      jquery: "jquery"
      Vue: "vue"
    })
  ]
  stats:
    colors: true,

gulp.task 'js', ->
  production = new webpack.DefinePlugin(
    'process.env':
      NODE_ENV: '"production"'
  )
  webpackConfig.plugins.push(production)
  
  gulp.src(config.src)
  .pipe(plumber({
    errorHandler: (err) ->
      console.log(err.messageFormatted);
      @emit('end')
  }))
  .pipe(gulp_webpack(webpackConfig))
#  .pipe(uglify())
  .pipe(rename({
    extname: '.min.js'
  }))
  .pipe(gulp.dest(config.dest + '/js'))
