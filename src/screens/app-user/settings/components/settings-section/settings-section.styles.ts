import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(({ theme, scale }: any) =>
  StyleSheet.create({
    title: {
      marginLeft: scale(6),
      marginBottom: scale(8),
      fontSize: scale(12.5),
      fontWeight: '700',
      color: theme.palette.neutral600,
    },
    card: {
      backgroundColor: theme.palette.white,
      borderRadius: scale(20),
      paddingHorizontal: scale(14),
      overflow: 'hidden',
    },
    footnote: {
      marginTop: scale(8),
      marginHorizontal: scale(6),
      fontSize: scale(12),
      lineHeight: scale(17),
      color: theme.palette.neutral600,
    },
  }),
);
