#
# User: code house
# Date: 2016/04/15
#
module.exports = {
  src: './src'
  dest: './docs'
  copyList: [
    ['./src/fonts/*', '/fonts']
    ['./src/appcache.manifest', '/']
    ['./node_modules/font-awesome/fonts/*', '/fonts']
  ]
}