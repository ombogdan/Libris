import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(({ theme, scale }: any) => ({
  ...StyleSheet.create({
    button: {
      flex: 1,
      minWidth: 0,
      minHeight: scale(54),
      borderRadius: scale(17),
      borderWidth: scale(1),
      borderColor: theme.palette.divider,
      backgroundColor: theme.palette.white,
      paddingHorizontal: scale(12),
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(9),
    },
    compact: {
      flex: 0,
      width: scale(54),
      paddingHorizontal: scale(0),
      justifyContent: 'center',
    },
    pressed: { opacity: 0.72 },
    content: { flex: 1, minWidth: 0 },
    label: {
      color: theme.palette.neutral600,
      fontSize: scale(10.5),
      lineHeight: scale(13),
      fontWeight: '700',
    },
    value: {
      color: theme.palette.text,
      fontSize: scale(12.5),
      lineHeight: scale(16),
      fontWeight: '800',
      marginTop: scale(1),
    },
    badge: {
      position: 'absolute',
      top: scale(-4),
      right: scale(-4),
      minWidth: scale(20),
      height: scale(20),
      borderRadius: scale(10),
      paddingHorizontal: scale(5),
      backgroundColor: theme.palette.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      color: theme.palette.white,
      fontSize: scale(10),
      fontWeight: '800',
    },
  }),
  iconSize: scale(19),
  chevronSize: scale(15),
  colors: {
    icon: theme.palette.accent700,
    chevron: theme.palette.neutral500,
  },
}));
