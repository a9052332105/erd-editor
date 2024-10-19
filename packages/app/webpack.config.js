const path = require('path');
const { DefinePlugin } = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { InjectManifest } = require('workbox-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');

const resolvePath = value => path.resolve(__dirname, value);

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isDevelopment = argv.mode !== 'production';
  const mode = isDevelopment ? 'development' : 'production';
  const isAnalyzer = env.target === 'analyzer';

  const config = {
    mode,
    devtool: isDevelopment ? 'eval-source-map' : 'source-map',
    devServer: {
      static: {
        directory: resolvePath('public'),
      },
      compress: true,
      historyApiFallback: true,
      open: true,
      hot: true,
      client: {
        overlay: false,
      },
    },
    entry: './src/main',
    output: {
      path: resolvePath('dist'),
      publicPath: '/',
      filename: isProduction
        ? 'static/js/bundle.[contenthash:8].js'
        : 'static/js/bundle.js',
      chunkFilename: isProduction
        ? 'static/js/[id].[contenthash:8].js'
        : 'static/js/[name].js',
      clean: true,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      plugins: [new TsconfigPathsPlugin()],
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'swc-loader',
            options: {
              env: {
                targets: 'defaults',
                mode: 'entry',
                coreJs: '3',
              },
              jsc: {
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                },
                transform: {
                  react: {
                    runtime: 'automatic',
                    importSource: '@emotion/react',
                    development: isDevelopment,
                    refresh: isDevelopment,
                  },
                },
                experimental: {
                  plugins: [
                    ['@swc-jotai/debug-label', {}],
                    ['@swc-jotai/react-refresh', {}],
                  ],
                },
              },
            },
          },
        },
        {
          test: /\.css$/i,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
          ],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new DefinePlugin({
        'import.meta.env.MODE': JSON.stringify(mode),
        'import.meta.env.WEBSOCKET_URL': JSON.stringify(
          isProduction ? 'https://erd-editor.deno.dev' : 'http://localhost:3000'
        ),
      }),
      isProduction &&
        new InjectManifest({
          swSrc: './src/sw.ts',
          swDest: 'sw.js',
          exclude: [/\.map$/, /LICENSE/],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        }),
      new WebpackPwaManifest({
        filename: 'manifest.json',
        name: 'erd-editor',
        short_name: 'erd-editor',
        description: 'Entity-Relationship Diagram Editor App',
        start_url: '/',
        display: 'standalone',
        scope: '/',
        theme_color: '#000',
        icons: [
          {
            src: resolvePath('public/pwa-64x64.png'),
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: resolvePath('public/pwa-192x192.png'),
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: resolvePath('public/pwa-512x512.png'),
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: resolvePath('public/maskable-icon-512x512.png'),
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      }),
      isProduction &&
        new MiniCssExtractPlugin({
          filename: 'static/css/bundle.[contenthash:8].css',
          chunkFilename: 'static/css/[id].[contenthash:8].css',
        }),
      new CopyPlugin({
        patterns: [
          {
            from: 'public/**',
            to: '[name][ext]',
            globOptions: {
              ignore: ['**/index.html'],
            },
          },
        ],
      }),
      new HtmlWebpackPlugin({
        inject: true,
        template: resolvePath('public/index.html'),
        templateParameters: {
          gtag: isProduction ? toGtag() : '',
        },
      }),
      isDevelopment && new ReactRefreshWebpackPlugin({ overlay: false }),
      isAnalyzer && new BundleAnalyzerPlugin(),
    ].filter(Boolean),
    performance: false,
  };

  return config;
};

function toGtag() {
  return /*html*/ `
<script async src="https://www.googletagmanager.com/gtag/js?id=G-3VBWD4V1JX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', 'G-3VBWD4V1JX');
</script>`;
}
