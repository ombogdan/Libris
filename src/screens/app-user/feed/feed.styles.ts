import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(
  ({ theme, scale, bottomInset = 0 }: any) => ({
    ...StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: theme.palette.background,
      },
      page: {
        paddingTop: scale(16),
        paddingBottom: scale(128) + bottomInset,
      },
      search: {
        height: scale(48),
        borderRadius: scale(999),
        backgroundColor: theme.palette.white,
        paddingHorizontal: scale(17),
        fontSize: scale(14.5),
        color: theme.palette.text,
        borderWidth: scale(1),
        borderColor: theme.palette.divider,
      },
      chips: { gap: scale(8) },
      loading: { paddingVertical: scale(48) },
    }),
    colors: { placeholder: theme.palette.neutral500 },
  }),
);
