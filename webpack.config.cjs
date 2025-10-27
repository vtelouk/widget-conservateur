const path = require("path");
const config = {
  mode: "production",
  entry: "./src/widget-store-sample.js",
  output: {
    path: path.resolve(__dirname, "build"), // Dossier à la racine
    filename: "bundle.js",
    publicPath: "/build/" // Chemin public pour le serveur
  },
  module: {
    rules: [
      {
        use: "babel-loader",
        test: /\.js$/
      }
    ]
  }
};
module.exports = config;
