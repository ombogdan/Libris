import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(
  ({ theme, scale, bottomInset = 0 }: any) => ({
    ...StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: theme.palette.background,
      },
      scroll: { flex: 1 },
      page: {
        paddingTop: scale(16),
        paddingBottom: scale(48) + bottomInset,
      },
      label: {
        fontSize: scale(12),
        fontWeight: '700',
        color: theme.palette.neutral700,
      },
      input: {
        minHeight: scale(44),
        borderRadius: scale(999),
        backgroundColor: theme.palette.white,
        borderWidth: scale(1),
        borderColor: theme.palette.divider,
        paddingHorizontal: scale(16),
        fontSize: scale(14),
        color: theme.palette.text,
      },
      grow: { flex: 1 },
      disabledInput: { opacity: 0.45 },
      chips: { flexDirection: 'row', gap: scale(8) },
      cityHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      textarea: {
        height: scale(100),
        borderRadius: scale(16),
        textAlignVertical: 'top',
        paddingTop: scale(13),
      },
      error: {
        fontSize: scale(13),
        lineHeight: scale(18),
        color: theme.palette.error,
      },
      missing: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: scale(24),
        paddingBottom: scale(40) + bottomInset,
      },
    }),
    colors: { placeholder: theme.palette.neutral500 },
    keyboardExtraScrollHeight: scale(96),
  }),
);
