import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

const OVERLAY = 'rgba(0,0,0,0.55)';

export const useStyles = createStyles(({ scale, topInset = 0 }: any) => ({
  ...StyleSheet.create({
    root: { flex: 1, backgroundColor: '#000' },
    image: { flex: 1, width: '100%' },
    // A fixed height keeps the close button inside its parent, which Android
    // needs to deliver touches to it.
    topBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: topInset + scale(56),
      paddingTop: topInset,
      alignItems: 'center',
      justifyContent: 'center',
    },
    counter: {
      paddingHorizontal: scale(14),
      paddingVertical: scale(7),
      borderRadius: scale(999),
      backgroundColor: OVERLAY,
    },
    counterText: {
      color: '#fff',
      fontSize: scale(14),
      fontWeight: '700',
    },
    close: {
      position: 'absolute',
      right: scale(16),
      top: topInset + scale(8),
      width: scale(40),
      height: scale(40),
      borderRadius: scale(999),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: OVERLAY,
    },
    closePressed: { opacity: 0.6 },
  }),
  closeIconSize: scale(24),
  hitSlop: scale(8),
}));
