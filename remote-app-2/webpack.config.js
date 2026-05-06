const { ModuleFederationPlugin } = require('webpack').container;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const deps = require('./package.json').dependencies;

module.exports = (env, argv) => {
  const isDev = argv.mode !== 'production';

  return {
    entry: './src/index',
    mode: isDev ? 'development' : 'production',

    devServer: {
      port: 3002,
      historyApiFallback: true,
      hot: true,
      headers: { 'Access-Control-Allow-Origin': '*' },
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    },

    module: {
      rules: [
        {
          test: /\.(tsx|ts|jsx|js)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                ['@babel/preset-react', { runtime: 'automatic' }],
                '@babel/preset-typescript',
              ],
            },
          },
        },
        { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      ],
    },

    plugins: [
      new ModuleFederationPlugin({
        name: 'remoteApp2',
        filename: 'remoteEntry.js',
        exposes: {
          './DashboardModule': './src/components/DashboardModule',
        },
        shared: {
          react: { singleton: true, requiredVersion: deps.react, eager: false },
          'react-dom': { singleton: true, requiredVersion: deps['react-dom'], eager: false },
        },
      }),

      new HtmlWebpackPlugin({
        template: './public/index.html',
        title: 'Remote App 2 — Dashboard Module',
      }),
    ],

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash].js',
      publicPath: isDev ? 'http://localhost:3002/' : 'auto',
      clean: true,
    },
  };
};
