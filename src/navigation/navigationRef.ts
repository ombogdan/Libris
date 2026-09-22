import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from 'types/navigation';

// Lets code outside the component tree (a push-notification tap handler)
// navigate without holding a prop-drilled reference to the navigator.
export const navigationRef =
  createNavigationContainerRef<RootStackParamList>();

export function navigateToChat(chatId: string) {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Thread', { chatId });
  }
}
