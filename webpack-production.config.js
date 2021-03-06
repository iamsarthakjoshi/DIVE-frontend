var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

var devFlagPlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || 'false'))
});

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: [
    './src/js/index.js',
    './src/css/app.css'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: 'bundle.js'
  },
  plugins: [
    devFlagPlugin,
    new ExtractTextPlugin('app.css'),
    new webpack.ProvidePlugin({
      Promise: 'imports?this=>global!exports?global.Promise!es6-promise',
      fetch: 'imports?this=>global!exports?global.fetch!whatwg-fetch'
    }),
    new CopyWebpackPlugin([
      { from: './src/index.html', to: './index.html' },
      { from: './src/404.html', to: './404.html' },
      { from: './src/assets', to: './assets'},
      { from: './_redirects' }
    ]),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
			compress: {
				warnings: false
			}
		}),
    new OptimizeCssAssetsPlugin({
      cssProcessorOptions: { discardComments: { removeAll: true } },
      canPrint: false
   })
  ],
  module: {
    loaders: [
      { test: require.resolve("react"), loader: "imports?shim=es6-shim/es6-shim&sham=es6-shim/es6-sham" },
      { test: /\.js$/, loader: 'babel',
        cacheDirectory: true,
        include: [ path.join(__dirname, 'src/js') ],
        exclude: /node_modules/ },
      { test: /\.css$/, exclude: /\.useable\.css$/, loader: ExtractTextPlugin.extract('css-loader?module!cssnext-loader') },
      { test: /\.useable\.css$/, loader: "style/useable!css" },
      { test: /\.sass$/, loader: ExtractTextPlugin.extract('style', 'css?modules&importLoaders=2&localIdentName=[local]___[hash:base64:5]!autoprefixer?browsers=last 2 version!sass?indentedSyntax&outputStyle=compressed&sourceMap') },
      { test: /\.less$/,  loader: ExtractTextPlugin.extract('style', 'css!less') },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url?limit=10000&minetype=application/font-woff" },
      { test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file" },
      { test: /\.svg(\?.*)?$/, loader: 'babel!svg-react' +
        // removes xmlns tag from svg (see https://github.com/jhamlet/svg-react-loader/issues/25)
        '!string-replace?search=%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22&replace=' +
        // removes data-name attributes
        '!string-replace?search=%20data-name%3D%22%5B%5Cw%5Cs_-%5D*%22&replace=&flags=ig' },
      { test: /\.png$/, loader: "url-loader?limit=10000&mimetype=image/png&publicPath=../&name=assets/images/[name].[ext]" },
    ]
  },
  resolve: {
    extensions: ['', '.js', '.json']
  }
};
