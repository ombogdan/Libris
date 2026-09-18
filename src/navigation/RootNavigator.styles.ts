import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(
  ({ theme, scale, bottomInset = 0 }: any) => ({
    ...StyleSheet.create({
      tabBar: {
        height: scale(72) + bottomInset,
        borderTopWidth: scale(1),
        borderTopColor: theme.palette.divider,
        borderTopLeftRadius: scale(28),
        borderTopRightRadius: scale(28),
        position: 'absolute',
        left: scale(0),
        right: scale(0),
        bottom: scale(0),
        paddingBottom: bottomInset,
        paddingTop: scale(4),
        paddingHorizontal: scale(6),
        backgroundColor: theme.palette.white,
        shadowColor: theme.palette.text,
        shadowOffset: { width: scale(0), height: scale(-3) },
        shadowOpacity: 0.08,
        shadowRadius: scale(8),
        elevation: scale(8),
      },
      tabItem: {
        height: scale(64),
        borderRadius: scale(28),
      },
      tabButton: {
        flex: 1,
        marginHorizontal: scale(2),
        marginVertical: scale(2),
        borderWidth: scale(2),
        borderColor: theme.palette.white,
        borderRadius: scale(28),
        alignItems: 'center',
        justifyContent: 'center',
      },
      tabButtonActive: {
        borderColor: theme.palette.accent,
        backgroundColor: theme.palette.accent100,
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
