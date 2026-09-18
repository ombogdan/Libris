import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(({ theme, scale }: any) =>
  StyleSheet.create({
    bubble: {
      maxWidth: '76%',
      paddingVertical: scale(9),
      paddingHorizontal: scale(14),
      borderRadius: scale(20),
    },
    mine: {
      alignSelf: 'flex-end',
      backgroundColor: theme.palette.accent,
      borderBottomRightRadius: scale(6),
    },
    theirs: {
      alignSelf: 'flex-start',
      backgroundColor: theme.palette.white,
      borderBottomLeftRadius: scale(6),
    },
    message: {
      fontSize: scale(14),
      lineHeight: scale(20),
      color: theme.palette.text,
    },
    mineMessage: { color: theme.palette.background },
  }),
);
