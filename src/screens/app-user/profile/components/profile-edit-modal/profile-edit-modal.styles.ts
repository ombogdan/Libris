import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(
  ({ theme, scale, bottomInset = 0 }: any) =>
    StyleSheet.create({
      overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: theme.palette.overlay,
      },
      card: {
        backgroundColor: theme.palette.background,
        borderTopLeftRadius: scale(28),
        borderTopRightRadius: scale(28),
        paddingTop: scale(24),
        paddingHorizontal: scale(18),
        paddingBottom: scale(24) + bottomInset,
        gap: scale(12),
      },
      title: {
        fontSize: scale(22),
        fontWeight: '800',
        color: theme.palette.text,
      },
      error: {
        fontSize: scale(13),
        lineHeight: scale(18),
        color: theme.palette.error,
      },
    }),
);
