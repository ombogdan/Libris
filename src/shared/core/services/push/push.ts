import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh,
  requestPermission,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import type { RemoteMessage } from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  EventType,
  type Event as NotifeeEvent,
} from '@notifee/react-native';
import { PermissionsAndroid, Platform } from 'react-native';

import { navigateToChat } from 'navigation/navigationRef';
import { appStorage } from 'services/storage/mmkv';
import { supabase } from 'services/supabase';
import { t } from 'shared/localization/i18n';

const MESSAGES_CHANNEL_ID = 'messages';
const PENDING_CONVERSATION_KEY = 'push.pendingConversationId';

// getMessaging() itself talks to the native Firebase app the instant it's
// called, which crashes on iOS (no GoogleService-Info.plist / no
// firebase.initializeApp() there yet — Android only for now). Lazy so
// importing this module never touches it on iOS.
let cachedMessaging: ReturnType<typeof getMessaging> | null = null;

function messagingInstance() {
  if (!cachedMessaging) {
    cachedMessaging = getMessaging();
  }
  return cachedMessaging;
}

// Set by ThreadScreen while it's focused, so a push for the conversation
// already on screen doesn't also pop a system notification over it.
let activeConversationId: string | null = null;

export function setActiveConversationId(chatId: string | null) {
  activeConversationId = chatId;
}

function getConversationId(
  data: Record<string, unknown> | undefined,
): string | null {
  const value = data?.conversationId;
  return typeof value === 'string' ? value : null;
}

async function requestNotificationPermission(): Promise<boolean> {
  // react-native-firebase's own requestPermission() is an iOS API and a
  // no-op on Android; the POST_NOTIFICATIONS runtime prompt (Android 13+)
  // has to be requested separately.
  if (Platform.OS !== 'android') {
    return true;
  }
  if (Platform.Version < 33) {
    return true;
  }

  try {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

async function ensureMessagesChannel(): Promise<string> {
  return notifee.createChannel({
    id: MESSAGES_CHANNEL_ID,
    name: t('push.messagesChannel'),
    importance: AndroidImportance.HIGH,
  });
}

export async function displayMessageNotification(
  data: RemoteMessage['data'],
): Promise<void> {
  if (!data) {
    return;
  }

  const title = typeof data.title === 'string' ? data.title : 'Libris';
  const body = typeof data.body === 'string' ? data.body : '';
  const channelId = await ensureMessagesChannel();

  await notifee.displayNotification({
    title,
    body,
    data,
    android: {
      channelId,
      pressAction: { id: 'default' },
    },
  });
}

// Android only for now — iOS push needs an Apple developer account (APNs
// certificates) that isn't set up yet.
export async function registerPushToken(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    const granted = await requestNotificationPermission();
    if (!granted) {
      return;
    }

    const authStatus = await requestPermission(messagingInstance());
    if (
      authStatus !== AuthorizationStatus.AUTHORIZED &&
      authStatus !== AuthorizationStatus.PROVISIONAL
    ) {
      return;
    }

    const token = await getToken(messagingInstance());
    if (!token) {
      return;
    }

    await supabase.rpc('upsert_push_token', {
      p_token: token,
      p_platform: 'android',
    });
  } catch {
    // Best-effort: a missing token just means no push for this session.
  }
}

export async function unregisterPushToken(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    const token = await getToken(messagingInstance());
    if (token) {
      await supabase.rpc('remove_push_token', { p_token: token });
    }
  } catch {
    // Best-effort: worst case a stale token lingers until FCM expires it.
  }
}

// Refreshes the stored token whenever FCM rotates it (reinstall, restore,
// token expiry). Call once; returns an unsubscribe function.
export function attachTokenRefreshListener(): () => void {
  if (Platform.OS !== 'android') {
    return () => undefined;
  }

  return onTokenRefresh(messagingInstance(), token => {
    void (async () => {
      try {
        await supabase.rpc('upsert_push_token', {
          p_token: token,
          p_platform: 'android',
        });
      } catch {
        // Best-effort.
      }
    })();
  });
}

// Messages that arrive while the app is in the foreground don't get an
// automatic system notification — this shows one unless it's for the chat
// already on screen. Call once; returns an unsubscribe function.
export function attachForegroundMessageListener(): () => void {
  if (Platform.OS !== 'android') {
    return () => undefined;
  }

  return onMessage(messagingInstance(), async remoteMessage => {
    const conversationId = getConversationId(remoteMessage.data);
    if (conversationId && conversationId === activeConversationId) {
      return;
    }
    await displayMessageNotification(remoteMessage.data);
  });
}

// Handles a notification tap while the app's JS is already running
// (foreground, or backgrounded but not killed). Call once; returns an
// unsubscribe function.
export function attachNotificationTapListener(): () => void {
  return notifee.onForegroundEvent(({ type, detail }: NotifeeEvent) => {
    if (type !== EventType.PRESS) {
      return;
    }
    const conversationId = getConversationId(detail.notification?.data);
    if (conversationId) {
      navigateToChat(conversationId);
    }
  });
}

// A tap from a killed app relaunches it before any listener above can run,
// so the target conversation is stashed here (by index.js's background
// handler) and picked up once the navigator is ready.
export function savePendingConversationId(chatId: string): void {
  try {
    appStorage.set(PENDING_CONVERSATION_KEY, chatId);
  } catch {
    // Not fatal: the notification still opens the app, just not the chat.
  }
}

export function consumePendingPushConversationId(): string | null {
  try {
    const chatId = appStorage.getString(PENDING_CONVERSATION_KEY) ?? null;
    if (chatId) {
      appStorage.remove(PENDING_CONVERSATION_KEY);
    }
    return chatId;
  } catch {
    return null;
  }
}

// Registered once from index.js, outside the React tree, so a data message
// that arrives while backgrounded or killed still gets displayed.
export function setBackgroundPushHandler(): void {
  if (Platform.OS !== 'android') {
    return;
  }

  setBackgroundMessageHandler(messagingInstance(), async remoteMessage => {
    await displayMessageNotification(remoteMessage.data);
  });
}
