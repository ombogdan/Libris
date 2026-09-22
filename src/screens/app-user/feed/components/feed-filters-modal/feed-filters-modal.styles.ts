import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(
  ({ theme, scale, bottomInset = 0, keyboardHeight = 0 }: any) => ({
    ...StyleSheet.create({
      overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: theme.palette.overlay,
      },
      card: {
        maxHeight: '86%',
        // Pushes the sheet (and its Apply/Reset row) clear of the keyboard —
        // it opens with no resize treatment of its own on either platform.
        marginBottom: keyboardHeight,
        backgroundColor: theme.palette.background,
        borderTopLeftRadius: scale(28),
        borderTopRightRadius: scale(28),
        paddingTop: scale(22),
        paddingHorizontal: scale(18),
        paddingBottom: scale(20) + bottomInset,
        gap: scale(4),
      },
      title: {
        fontSize: scale(22),
        lineHeight: scale(27),
        fontWeight: '800',
        color: theme.palette.text,
        marginBottom: scale(6),
      },
      scroll: { flexShrink: 1 },
      scrollContent: {
        paddingBottom: scale(8),
      },
      label: {
        fontSize: scale(13),
        fontWeight: '700',
        color: theme.palette.neutral600,
        marginTop: scale(14),
        marginBottom: scale(8),
      },
      chips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: scale(8),
      },
      priceRow: {
        flexDirection: 'row',
        gap: scale(10),
      },
      priceField: { flex: 1 },
      priceFieldOff: { opacity: 0.45 },
      hint: {
        fontSize: scale(12),
        color: theme.palette.neutral600,
        marginTop: scale(6),
      },
      actions: {
        flexDirection: 'row',
        gap: scale(10),
        marginTop: scale(20),
      },
      actionGrow: { flex: 1 },
    }),
    colors: { placeholder: theme.palette.neutral500 },
  }),
);
