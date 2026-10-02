const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withAndroidGradlePlugin(config) {
  return withProjectBuildGradle(config, (config) => {
    config.modResults.contents = config.modResults.contents.replace(
      /classpath\(['"]com\.android\.tools\.build:gradle:[\d.]+['"]\)/,
      `classpath('com.android.tools.build:gradle:8.9.1')`
    );
    return config;
  });
};
