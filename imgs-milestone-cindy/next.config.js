const withPlugins = require("next-compose-plugins");
const sass = require("@zeit/next-sass");
const css = require("@zeit/next-css");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const nextConfig = {
  webpack(config, { buildId, dev, isServer, defaultLoaders, webpack }) {
    if (!dev) {
      config.optimization.minimizer.push(new OptimizeCSSAssetsPlugin({}));
    }

    return config;
  }
};

module.exports = withPlugins([[css], [sass]], nextConfig);
