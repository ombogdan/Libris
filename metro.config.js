const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const fromRoot = directory => path.resolve(__dirname, directory);

const config = {
  resolver: {
    extraNodeModules: {
      types: fromRoot('src/types'),
      shared: fromRoot('src/shared'),
      screens: fromRoot('src/screens'),
      core: fromRoot('src/shared/core'),
      configs: fromRoot('src/shared/core/configs'),
      services: fromRoot('src/shared/core/services'),
      providers: fromRoot('src/shared/core/providers'),
      theme: fromRoot('src/shared/theme'),
      enums: fromRoot('src/shared/enums'),
      hooks: fromRoot('src/shared/hooks'),
      api: fromRoot('src/shared/hooks/api'),
      store: fromRoot('src/shared/store'),
      'ui-kit': fromRoot('src/shared/ui-kit'),
      utils: fromRoot('src/shared/utils'),
      assets: fromRoot('src/shared/assets'),
      constants: fromRoot('src/shared/constants'),
      components: fromRoot('src/shared/components'),
      icons: fromRoot('src/shared/assets/icons'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
