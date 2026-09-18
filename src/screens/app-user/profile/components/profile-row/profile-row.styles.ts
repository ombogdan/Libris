import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

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
    right: {
      flex: 1,
      marginLeft: scale(16),
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: scale(6),
    },
    value: {
      flexShrink: 1,
      fontSize: scale(12.5),
      color: theme.palette.neutral600,
    },
    arrow: {
      fontSize: scale(18),
      color: theme.palette.neutral600,
    },
  }),
);
