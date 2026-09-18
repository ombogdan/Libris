module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['react-native-gesture-handler/jestSetup', '<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native-google-signin|@react-navigation|react-native-vector-icons|react-native-gesture-handler|react-native-keyboard-aware-scroll-view|react-native-iphone-x-helper|react-native-safe-area-context|react-native-screens|react-native-url-polyfill)/)',
  ],
};
