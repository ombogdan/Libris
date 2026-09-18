import { StyleSheet } from 'react-native';

import { createStyles } from '../../../../theme';

export const useStyles = createStyles(({ theme, scale }: any) =>
  StyleSheet.create({
    row: {
      minHeight: scale(52),
      borderBottomWidth: scale(1),
      borderBottomColor: theme.palette.divider,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    label: {
      fontSize: scale(14.5),
      fontWeight: '600',
      color: theme.palette.text,
    },
    value: { fontSize: scale(12.5), color: theme.palette.neutral600 },
  }),
);
