
const path = require('path');
// const ClosurePlugin = require('closure-webpack-plugin')

module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    // optimization: {
    //     minimizer: [
    //         new ClosurePlugin({mode: 'STANDARD'}, {
    //             debug: true
    //         })
    //     ]
    // },
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist')
    }
};