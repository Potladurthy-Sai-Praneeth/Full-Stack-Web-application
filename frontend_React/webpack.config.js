const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: "development",
    devtool: 'eval-source-map',
    entry: path.resolve(__dirname, "src", "index.jsx"),
    output: {
        filename: "bundle.js",
        chunkFilename: "[name].bundle.js?h=[chunkhash]",
        publicPath: "/",
        path: path.resolve(__dirname, "dist"),
    },
    devServer: {
        port: 4400,
        historyApiFallback: true,
        hot: true,
        open: true,
        client: {
            overlay: {
                errors: true,
                warnings: false,
            },
        },
        static: {
            directory: path.join(__dirname, 'public'),
        },
    },
    module: {
        rules: [{
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                options: {
                    presets: ["@babel/preset-env", "@babel/preset-react"],
                    plugins: ["@babel/transform-runtime"],
                },
                loader: "babel-loader",
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.js$/,
                enforce: 'pre',
                use: ['source-map-loader'],
                exclude: [
                    /node_modules/,
                ],
            },
        ],
    },
    ignoreWarnings: [/Failed to parse source map/],
    resolve: {
        extensions: [".js", ".jsx"],
        fallback: {
            assert: require.resolve("assert"),
            crypto: require.resolve("crypto-browserify"),
            http: require.resolve("stream-http"),
            https: require.resolve("https-browserify"),
            os: require.resolve("os-browserify/browser"),
            buffer: require.resolve("buffer"),
            stream: require.resolve("stream-browserify"),
        },
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "public", "index.html"),
            filename: "index.html",
        }),
    ],
};