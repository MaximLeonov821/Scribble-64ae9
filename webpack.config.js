const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: './main/auth.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'main/dist'),
    publicPath: '/'
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, '.'),
      serveIndex: true,
    },
    hot: true,
    liveReload: true,
    port: 5500,
    client: {
      overlay: {
        errors: true,
        warnings: false
      },
      progress: true,
    },
    compress: true,
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.(woff2|woff|ttf|otf|eot)$/,
        type: "asset/resource",
        generator: {
          filename: "fonts/[name][ext]", // Кладем шрифты в dist/fonts/
        },
      },
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'styles.css'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "main/fonts", to: "fonts" }
      ]
    })
  ],
  resolve: {
    extensions: ['.js', '.json'],
    modules: [path.resolve(__dirname, 'node_modules'), __dirname],
    alias: {
      'firebase/app': 'firebase/app',
      'firebase/auth': 'firebase/auth',
      'firebase/database': 'firebase/database',
      'firebase/firestore': 'firebase/firestore',
    }
  },
  mode: 'production',
  devtool: 'inline-source-map',
};