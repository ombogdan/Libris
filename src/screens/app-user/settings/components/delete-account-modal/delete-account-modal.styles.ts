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
        paddingTop: scale(24),
        paddingHorizontal: scale(18),
        paddingBottom: scale(24) + bottomInset,
        borderTopLeftRadius: scale(28),
        borderTopRightRadius: scale(28),
        gap: scale(10),
        backgroundColor: theme.palette.background,
      },
      title: {
        color: theme.palette.text,
        fontSize: scale(22),
        fontWeight: '800',
      },
      text: {
        color: theme.palette.neutral700,
        fontSize: scale(14),
        lineHeight: scale(21),
      },
      error: {
        color: theme.palette.error,
        fontSize: scale(13),
        lineHeight: scale(18),
      },
      actions: {
        gap: scale(10),
        marginTop: scale(6),
      },
    }),
);
