const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Fix duplicate react-native issue & resolve from demo app
config.resolver = {
  ...config.resolver
};

module.exports = config;


// const { getDefaultConfig } = require("expo/metro-config");
// const path = require("path");

// const config = getDefaultConfig(__dirname);

// // Path to your local SDK
// const sdkPath = path.resolve(__dirname, "../checkout-react-native-sdk");

// config.watchFolders = [
//   sdkPath
// ];

// config.resolver = {
//   ...config.resolver,
//   // Make Metro resolve the SDK import correctly
//   extraNodeModules: {
//     ...config.resolver.extraNodeModules,
//     "boxpay-checkout-reactnative-sdk": sdkPath,
//   },

//   nodeModulesPaths: [
//     path.resolve(__dirname, "node_modules"),
//     path.resolve(sdkPath, "node_modules")
//   ]
// };

// module.exports = config;