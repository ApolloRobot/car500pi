// require('babel-core/register')()
// require('@babel-polyfill')
// import "@babel/polyfill"
require ('@babel/register')()
require ('@babel/polyfill')
// import "core-js/shim"; // included < Stage 4 proposals
// import "regenerator-runtime/runtime";
// import "core-js/features/array/flat-map";
// require('core-js/shim')
// require('regenerator-runtime/runtime')
// require('core-js/features/array/flat-map')

require('./server/index.js')

console.log('env: ', process.env.NODE_ENV)
