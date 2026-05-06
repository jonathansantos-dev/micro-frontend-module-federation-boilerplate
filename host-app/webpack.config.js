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
      port: 3000,
      historyApiFallback: true,
      hot: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
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
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },

    plugins: [
      /**
       * ModuleFederationPlugin — Host Configuration
       *
       * The host app acts as the "shell" that orchestrates remote micro-frontends.
       * It declares which remotes it consumes and enforces singleton React instances
       * to avoid duplicate React context issues across boundaries.
       *
       * Architecture decision: We do NOT expose anything from the host — it is a
       * pure consumer. Shared singletons prevent version conflicts at runtime.
       */
      new ModuleFederationPlugin({
        name: 'host',
        remotes: {
          remoteApp1: `remoteApp1@${
            isDev
              ? 'http://localhost:3001/remoteEntry.js'
              : 'https://your-cdn.com/remote-app-1/remoteEntry.js'
          }`,
          remoteApp2: `remoteApp2@${
            isDev
              ? 'http://localhost:3002/remoteEntry.js'
              : 'https://your-cdn.com/remote-app-2/remoteEntry.js'
          }`,
        },
        shared: {
          react: {
            singleton: true,
            requiredVersion: deps.react,
            eager: false,
          },
          'react-dom': {
            singleton: true,
            requiredVersion: deps['react-dom'],
            eager: false,
          },
          'react-router-dom': {
            singleton: true,
            requiredVersion: deps['react-router-dom'],
          },
        },
      }),

      new HtmlWebpackPlugin({
        template: './public/index.html',
        title: 'MFE Shell — Host App',
      }),
    ],

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash].js',
      publicPath: isDev ? 'http://localhost:3000/' : 'auto',
      clean: true,
    },
  };
};
