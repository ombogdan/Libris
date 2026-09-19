import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(({ theme, scale }: any) => ({
  ...StyleSheet.create({
    row: {
      minHeight: scale(54),
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(12),
    },
    divider: {
      borderBottomWidth: scale(1),
      borderBottomColor: theme.palette.divider,
    },
    pressed: { opacity: 0.6 },
    disabled: { opacity: 0.45 },
    label: {
      flexShrink: 0,
      maxWidth: '60%',
      fontSize: scale(15),
      fontWeight: '600',
      color: theme.palette.text,
    },
    danger: { color: theme.palette.error },
    // The value takes the remaining width and sits flush against the chevron,
    // so numbers and text line up on the same right edge in every row.
    trailing: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: scale(4),
    },
    value: {
      flexShrink: 1,
      fontSize: scale(15),
      color: theme.palette.neutral600,
      textAlign: 'right',
    },
  }),
  chevronSize: scale(18),
  colors: { chevron: theme.palette.neutral500 },
}));
