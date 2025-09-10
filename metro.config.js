const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const config = getDefaultConfig(__dirname);

// Fix duplicate react-native issue & resolve from demo app
config.resolver = {
  ...config.resolver
};

module.exports = config;
