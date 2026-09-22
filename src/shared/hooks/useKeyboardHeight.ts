import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

// For content that needs to lift itself clear of the keyboard by hand —
// typically a bottom-sheet Modal, which doesn't get a screen's own
// resize/adjustResize treatment on either platform. `did` events (rather
// than iOS-only `will`) so this works the same on Android and iOS.
export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', event =>
      setHeight(event.endCoordinates.height),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () => setHeight(0));

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return height;
}
