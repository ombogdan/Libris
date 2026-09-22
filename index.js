import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import { AppRegistry } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';
import {
  savePendingConversationId,
  setBackgroundPushHandler,
} from 'services/push';

// Both must be registered here, at the top level, before the app mounts —
// they need to run even when the app has no React tree alive (backgrounded
// or fully killed).
setBackgroundPushHandler();

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type !== EventType.PRESS) {
    return;
  }
  const conversationId = detail.notification?.data?.conversationId;
  if (typeof conversationId === 'string') {
    savePendingConversationId(conversationId);
  }
});

AppRegistry.registerComponent(appName, () => App);
