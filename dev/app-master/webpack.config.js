import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { DefinePlugin } from 'webpack';
import portMap from '../config.json';
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const appName = 'dev/main';
const port = portMap[appName].port;
const publicPath = portMap[appName].publicPath;

const isInWebIDE = () => {
  return Boolean(process.env.IDE_PLATFORM);
};
const getProxyHost = (port) => {
  return `${port}-${process.env.WEBIDE_PODID || ''}.webide-boe.byted.org`;
};

const webpackConfig = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
  entry: {
    main: './src/index.tsx',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    publicPath:
      process.env.NODE_ENV === 'production'
        ? publicPath
        : isInWebIDE()
        ? `//${getProxyHost(port)}/`
        : `http://localhost:${port}/`,
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-typescript',
            '@babel/preset-react',
            '@babel/preset-env',
          ],
        },
      },
      {
        test: /\.css$|\.less$/,
        use: [
          {
            loader: 'style-loader', // creates style nodes from JS strings
          },
          {
            loader: 'css-loader', // translates CSS into CommonJS
          },
          {
            loader: 'less-loader',
            options: { javascriptEnabled: true },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]',
        },
      },
      {
        test: /\.woff|woff2|eot|ttf$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 100000,
            },
          },
        ],
      },
    ],
  },
  devServer: {
    hot: true,
    // open: true,
    historyApiFallback: true,
    port: 8090,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    allowedHosts: 'all',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new DefinePlugin({
      'process.env.inIDE': isInWebIDE(),
      'process.env.WEBIDE_PODID': JSON.stringify(process.env.WEBIDE_PODID),
    }),
  ],
};

export default webpackConfig;
