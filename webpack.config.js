const path = require('path');

const baseConfig = {
  entry: {
    'useeio-api': './src/webapi.ts',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ]
  },
};

const umpConfig = {
  ...baseConfig,
  output: {
    path: path.resolve(__dirname, 'dist/umd'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'useeio',
    umdNamedDefine: true,
    //globalObject: 'this',
  },
}

const cjsConfig = {
  ...baseConfig,
  output: {
    path: path.resolve(__dirname, 'dist/cjs'),
    filename: '[name].js',
    libraryTarget: 'commonjs',
    //globalObject: 'this',
  },
}

module.exports = [ umpConfig, cjsConfig ];
