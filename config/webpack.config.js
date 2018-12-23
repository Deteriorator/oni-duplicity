"use strict";
const path = require("path");

const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");

// Chokes on template strings at runtime (???)
// Maybe related: https://github.com/Igorbek/typescript-plugin-styled-components/issues/13
// const createStyledComponentsTransformer = require("typescript-plugin-styled-components")
//   .default;
// const styledComponentsTransformer = createStyledComponentsTransformer();

const isDev = process.env["NODE_ENV"] === "development";

const paths = require("./paths");

console.log("Webpack build", isDev ? "[development]" : "[production]");

module.exports = {
  mode: isDev ? "development" : "production",

  devtool: "source-map",

  devServer: {
    contentBase: paths.appDist,
    hot: isDev
  },

  entry: {
    client: [path.join(paths.appSrc, "./index.tsx")].filter(x => x)
  },

  output: {
    filename: "[name].[hash].bundle.js",
    path: paths.appBuild,
    publicPath: isDev ? "/" : paths.publicPath,

    // Fix hot-reload interfering with worker-loader
    globalObject: "this"
  },

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".json"],
    alias: {
      "@": paths.appSrc
    }
  },

  module: {
    rules: [
      // Process source maps in input sources
      //  All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: "pre",
        test: /\.(jsx?|tsx?)$/,
        loader: "source-map-loader",
        include: [/src\/.+\.tsx?/]
      },

      //  Run typescript through react-hot-loader to rewrite react components for hot loading.
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              babelrc: false,
              plugins: ["react-hot-loader/babel"]
            }
          },
          {
            loader: "ts-loader",
            options: {
              // getCustomTransformers: () => ({
              //   before: [styledComponentsTransformer]
              // })
            }
          }
        ],
        exclude: [/\.worker\.ts$/]
      },

      {
        test: /\.worker\.ts$/,
        use: "ts-loader"
      },

      // Doesn't seem to take with typescript.  Probably an ordering issue.
      //  Using prefix form for now, as it plays better with typescript.
      // {
      //     test: /\.worker.\.(t|j)s$/,
      //     use: [
      //         {
      //             loader: "worker-loader"
      //         }
      //     ]
      // },

      {
        test: /\.css$/,
        loader: ["style-loader", "css-loader"]
      },

      {
        test: /\.(woff|woff2)$/,
        use: {
          loader: "url-loader",
          options: {
            name: "fonts/[hash].[ext]",
            limit: 5000,
            mimetype: "application/font-woff"
          }
        }
      },
      {
        test: /\.(ttf|eot|svg)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "fonts/[hash].[ext]"
          }
        }
      },

      {
        test: /\.png/,
        loader: "file-loader"
      },

      {
        test: /\.(txt|md)$/,
        loader: "raw-loader"
      }
    ]
  },

  plugins: [
    isDev && new webpack.NamedModulesPlugin(),
    isDev && new webpack.HotModuleReplacementPlugin(),

    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(isDev ? "development" : "production")
      }
    }),

    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(paths.appSrc, "index.ejs")
    })
  ].filter(x => x),

  optimization: {
    splitChunks: {
      chunks: "all"
    },
    runtimeChunk: true,
    minimize: !isDev
  }
};
