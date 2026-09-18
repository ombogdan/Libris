import { StyleSheet } from 'react-native';

import { createStyles } from '../theme';

export const useStyles = createStyles(
  ({ theme, scale, bottomInset = 0 }: any) => ({
    ...StyleSheet.create({
      tabBar: {
        height: scale(64) + bottomInset,
        borderTopWidth: scale(0),
        borderRadius: scale(28),
        position: 'absolute',
        left: scale(10),
        right: scale(10),
        bottom: scale(0),
        paddingBottom: bottomInset,
        backgroundColor: theme.palette.white,
      },
      tabItem: {
        height: scale(64),
        borderRadius: scale(18),
        paddingTop: scale(7),
        paddingBottom: scale(6),
      },
      tabLabel: { fontSize: scale(10.5) },
      loader: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.background,
      },
      content: { backgroundColor: theme.palette.background },
    }),
    iconSizes: {
      add: scale(28),
      default: scale(23),
    },
  }),
);
