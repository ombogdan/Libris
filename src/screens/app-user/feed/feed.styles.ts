import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(
  ({ theme, scale, bottomInset = 0 }: any) => ({
    ...StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: theme.palette.background,
      },
      list: { flex: 1 },
      page: {
        flexGrow: 1,
        paddingHorizontal: scale(18),
        paddingTop: scale(16),
        paddingBottom: scale(128) + bottomInset,
      },
      emptyPage: { flexGrow: 1 },
      header: {
        gap: scale(13),
        marginBottom: scale(13),
      },
      quickFilters: {
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: scale(8),
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
      separator: { height: scale(13) },
      loading: {
        flex: 1,
        minHeight: scale(180),
        alignItems: 'center',
        justifyContent: 'center',
      },
      loadingMore: { paddingVertical: scale(20) },
    }),
    colors: { placeholder: theme.palette.neutral500 },
  }),
);
