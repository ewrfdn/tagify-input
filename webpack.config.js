const path = require('path')
// eslint-disable-next-line no-unused-vars
const webpack = require('webpack')

module.exports = (env) => {
  return {
    entry: {
      index: './src/index.js'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js'
    },
    optimization: {
    },
    plugins: []
  }
}
