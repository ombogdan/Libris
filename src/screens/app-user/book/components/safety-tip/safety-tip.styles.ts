import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(({ theme, scale }: any) => ({
  ...StyleSheet.create({
    tip: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: scale(12),
      padding: scale(14),
      borderRadius: scale(20),
      borderWidth: scale(1),
      borderColor: theme.palette.accent200,
      backgroundColor: theme.palette.accent100,
    },
    content: { flex: 1, gap: scale(3) },
    title: {
      color: theme.palette.accent800,
      fontSize: scale(13.5),
      fontWeight: '800',
    },
    text: {
      color: theme.palette.neutral700,
      fontSize: scale(13),
      lineHeight: scale(19),
    },
  }),
  iconSize: scale(22),
  colors: { icon: theme.palette.accent },
}));
