// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.useWatchman = false;

// Basic Node.js polyfills for compatibility
config.resolver.alias = {
  ...config.resolver.alias,
  stream: 'react-native-polyfill-globals/src/readable-stream',
  util: 'util',
  buffer: 'buffer',
  process: 'process',
};

module.exports = withNativeWind(config, { input: './global.css' });
