import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(
  ({ theme, scale, bottomInset = 0 }: any) =>
    StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: theme.palette.background,
      },
      page: {
        paddingHorizontal: scale(18),
        paddingTop: scale(16),
        paddingBottom: scale(128) + bottomInset,
        gap: scale(16),
      },
      top: {
        alignItems: 'center',
        gap: scale(6),
        paddingVertical: scale(6),
      },
      avatar: {
        width: scale(72),
        height: scale(72),
        borderRadius: scale(999),
        backgroundColor: theme.palette.accent,
        alignItems: 'center',
        justifyContent: 'center',
      },
      initial: {
        fontSize: scale(28),
        fontWeight: '800',
        color: theme.palette.background,
      },
      title: {
        fontSize: scale(23),
        fontWeight: '800',
        color: theme.palette.text,
      },
      meta: {
        maxWidth: '90%',
        fontSize: scale(12.5),
        lineHeight: scale(18),
        textAlign: 'center',
        color: theme.palette.neutral600,
      },
      metrics: {
        flexDirection: 'row',
        gap: scale(8),
      },
      rows: {
        backgroundColor: theme.palette.white,
        borderRadius: scale(20),
        paddingHorizontal: scale(14),
        overflow: 'hidden',
      },
      error: {
        fontSize: scale(13),
        lineHeight: scale(18),
        color: theme.palette.error,
      },
      badge: {
        minWidth: scale(22),
        height: scale(22),
        borderRadius: scale(99),
        paddingHorizontal: scale(6),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.error,
      },
      badgeText: {
        color: theme.palette.white,
        fontSize: scale(11),
        fontWeight: '800',
      },
    }),
);
