const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow requiring the bundled RPBoard HTML file as a static asset so it can
// be loaded locally (fully offline) inside the WebView.
config.resolver.assetExts.push('html');

module.exports = config;
