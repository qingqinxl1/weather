const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
// const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  entry: {
    weather: ['./index.js']
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  // 引用外部 jQuery
  externals: {
    'jquery': 'window.jQuery'
  },
  module: {
    rules: [{
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [{
            loader: 'css-loader',
            query: {
              sourceMap: true,
              minimize: true,
              name: '[name].[ext]'
            }
          }]
        }),
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        use: [{
          loader: 'file-loader',
          query: {
            publicPath: './',
            name: '[name].[ext]'
          }
        }],
        exclude: /node_modules/,
      }
    ]
  },
  plugins: [
    // new CleanWebpackPlugin('./dist'),
    new ExtractTextPlugin({
      filename: '[name].css',
      allChunks: true,
    }),
    new UglifyJSPlugin({
      uglifyOptions: {
        ie8: true,
        compress: {
          drop_console: true,
        },
        output: {
          ascii_only: true,
        },
      },
      sourceMap: true,
    }),
    new webpack.BannerPlugin({
      banner: 'date:' + new Date() + ', hash:[hash], chunkhash:[chunkhash], name:[name], filebase:[filebase], query:[query], file:[file]',
    }),
  ]
};
