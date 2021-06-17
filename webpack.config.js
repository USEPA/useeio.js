const path = require('path');
const buildDir = path.resolve(__dirname, 'dist');

const config = {
    entry: {
        'useeio': './src/useeio.ts',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: '[name].js',
        path: buildDir,
        libraryTarget: 'var',
        library: '[name]',
    },
};

module.exports = (_env, argv) => {
    if (argv.mode === 'development') {
        config.devtool = 'source-map';
    }
    return config;
};
