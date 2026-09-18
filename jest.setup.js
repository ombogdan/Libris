/* global jest */
global.WebSocket = class WebSocket {};

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

jest.mock('@dr.pogodin/react-native-fs', () => ({
  readFile: jest.fn(),
}));
