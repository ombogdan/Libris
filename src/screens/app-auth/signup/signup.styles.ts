import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(({ theme, scale }: any) => ({
  ...StyleSheet.create({
    page: {
      flex: 1,
      paddingHorizontal: scale(24),
      paddingTop: scale(12),
      paddingBottom: scale(28),
      backgroundColor: theme.palette.background,
    },
    back: {
      color: theme.palette.accent700,
      fontSize: scale(15),
      fontWeight: '700',
      paddingVertical: scale(8),
    },
    content: { flex: 1, justifyContent: 'center', gap: scale(16) },
    logo: {
      width: scale(64),
      height: scale(64),
      borderRadius: scale(32),
      backgroundColor: theme.palette.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      fontSize: scale(28),
      fontWeight: '800',
      color: theme.palette.background,
    },
    title: {
      fontSize: scale(31),
      fontWeight: '800',
      color: theme.palette.text,
    },
    subtitle: {
      fontSize: scale(15),
      lineHeight: scale(23),
      color: theme.palette.subtitle,
    },
    googleButton: {
      height: scale(54),
      borderRadius: scale(999),
      borderWidth: scale(1),
      borderColor: theme.palette.divider,
      backgroundColor: theme.palette.white,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: scale(12),
    },
    pressed: { opacity: 0.55 },
    googleText: {
      fontSize: scale(15),
      fontWeight: '700',
      color: theme.palette.text,
    },
    help: {
      fontSize: scale(12.5),
      lineHeight: scale(19),
      color: theme.palette.neutral600,
    },
    error: {
      fontSize: scale(13),
      lineHeight: scale(19),
      color: theme.palette.error,
    },
  }),
  iconSize: scale(21),
}));
