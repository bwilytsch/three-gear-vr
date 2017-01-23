var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var environment = process.env.NODE_ENV || 'development';

module.exports = {
    context: path.resolve(__dirname),
    devtool: 'eval',
    entry: {
        // 'js/vendor.bundle': ['./src/js/utils/oimo.min.js'],
        'js/bundle': './src/js/index.js',
    },
    output: {
        path: path.resolve(__dirname + '/dist/'),
        filename: '[name].js',
        pathinfo: true,
    },
    module: {
        loaders: [
            {
                test: /\.html$/,
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loaders: ['babel-loader'],
            },
            {
                test: /\.json$/,
                loader: 'json-loader',
            },
            {
                test: /\.scss$/,
                loader: 'style!css!sass',
            },
            {
                test: /\.(mp4|ogg|svg|eot|ttf|woff|woff2|jpg|png)$/,
                loader: 'file-loader'
            }
            // {
            //     test: /\.scss$/,
            //     loader: ExtractTextPlugin.extract('css!sass'),
            // }          
        ]
    },
    devServer: {
        historyApiFallback: true,
        watchOptions: { aggregateTimeout: 300, poll: 1000 },
        host: '0.0.0.0',
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
        }
    },
    plugins: [
        // new webpack.optimize.CommonsChunkPlugin('js/vendor.bundle', 'vendor.bundle.js'),
        new HtmlWebpackPlugin({
            template: './src/index.ejs',
        }),
        new CopyWebpackPlugin([
            {from: './src/assets', to: './assets'}
        ]),
        // new ExtractTextPlugin('./css/style.css', {
        //     allChunks: true
        // }),
    ],
    node: {
        fs: 'empty'
    }
}