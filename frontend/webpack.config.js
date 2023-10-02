const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");


module.exports = {
    entry: "./src/app.ts",
    mode: "development",
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "docs"),
        clean: true
    },
    devServer: {
        static: '.docs',
        compress: true,
        port: 9000,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./index.html"
        }),
        new CopyPlugin({
            patterns: [
                {from: "templates", to: "templates"},
                {from: "styles", to: "styles"},
                {from: "static/images", to: "images"},
                {from: "static/fonts", to: "fonts"},
            ],
        }),
    ],
};