var webpack = require('webpack');

module.exports = {
  entry: {
    app: './src/main.js',
    vendor: ['coquette', 'q', 'lodash', 'javascript-state-machine', 'screenfull']
  },

  output: {
    path: 'build/',
    filename: "bundle.js"
  },

  resolve: {
    // always resolve modules that are in node_modules/ before looking into subdirectories
    // this prevents duplicate bundled copies of modules in the case that a module exists in both
    // `node_modules/foo` and `node_modules/bar/node_modules/foo`
    root: require('path').resolve('./node_modules')
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js')
  ],

  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'jsx-loader',
        query: {
          stripTypes: true,
          harmony: true
        }
      },

      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },

      {
        test: /(?:\.woff$|\.ttf$|\.svg$|\.eot$)/,
        loader: 'file-loader',
        query: {
          name: 'assets/[hash].[ext]'
        }
      },

      {
        test: /(?:\.wav$|\.png$)/,
        loader: 'file-loader',
        query: {
          name: 'assets/[hash].[ext]'
        }
      },

      {
        test: /(?:\.tmx$)/,
        loader: 'raw-loader'
      }
    ]
  }
};
