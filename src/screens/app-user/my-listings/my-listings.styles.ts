import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(
  ({ theme, scale, bottomInset = 0 }: any) =>
    StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: theme.palette.background,
      },
      page: {
        paddingHorizontal: scale(18),
        paddingTop: scale(16),
        paddingBottom: scale(30) + bottomInset,
        gap: scale(13),
        backgroundColor: theme.palette.background,
      },
    }),
);
