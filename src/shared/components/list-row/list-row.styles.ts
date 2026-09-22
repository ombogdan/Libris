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
      flex: 1,
      fontSize: scale(15),
      fontWeight: '600',
      color: theme.palette.text,
    },
    danger: { color: theme.palette.error },
    // Sized to its own content (not flex: 1) so a label with no value or
    // accessory — a plain menu item, a legal link — gets the full row width
    // instead of losing 40% of it to an empty trailing area. The label
    // shrinks and truncates first when both need more room than the row has,
    // keeping the value/chevron flush against the right edge in every row.
    trailing: {
      flexShrink: 0,
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
