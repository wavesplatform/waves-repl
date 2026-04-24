const autoprefixer = require('autoprefixer');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 1. Импортируем установленный плагин
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const htmlWebpackPlugin = new HtmlWebpackPlugin({
    template: path.join(__dirname, 'examples/src/index.html'),
    filename: './index.html',
});

module.exports = {
    entry: path.join(__dirname, 'examples/src/index.tsx'),
    module: {
        rules: [
            // ... (ваши правила для ts и css остаются без изменений)
            {
                test: /\.(ts|tsx)$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [
                    require.resolve('style-loader'),
                    {
                        loader: require.resolve('css-loader'),
                        options: {
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: require.resolve('postcss-loader'),
                        options: {
                            postcssOptions: {
                                plugins: [
                                    require('postcss-flexbugs-fixes'),
                                    require('postcss-inline-svg'),
                                    autoprefixer({
                                        overrideBrowserslist: [
                                            '>1%',
                                            'last 4 versions',
                                            'Firefox ESR',
                                            'not ie < 9',
                                        ],
                                        flexbox: 'no-2009',
                                    }),
                                ],
                            },
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        htmlWebpackPlugin,
        new NodePolyfillPlugin(),
    ],
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    devServer: {
        port: 3001,
    },
};
