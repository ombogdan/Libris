import { StyleSheet } from 'react-native';

import { createStyles } from 'shared/theme/createStyles';

export const useStyles = createStyles(
  ({ theme, scale, bottomInset = 0 }: any) =>
    StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: theme.palette.background,
      },
      moderationActions: {
        marginTop: scale(14),
        gap: scale(2),
      },
      page: {
        flexGrow: 1,
        paddingHorizontal: scale(18),
        paddingTop: scale(16),
        paddingBottom: scale(40) + bottomInset,
      },
      centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(14),
        paddingHorizontal: scale(22),
      },
      stateText: {
        color: theme.palette.neutral600,
        fontSize: scale(14),
        lineHeight: scale(21),
        textAlign: 'center',
      },
      profileCard: {
        alignItems: 'center',
        padding: scale(20),
        gap: scale(8),
        borderRadius: scale(28),
        backgroundColor: theme.palette.white,
      },
      avatar: {
        width: scale(88),
        height: scale(88),
        borderRadius: scale(999),
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: theme.palette.violet300,
      },
      avatarImage: { width: '100%', height: '100%' },
      avatarText: {
        color: theme.palette.violet800,
        fontSize: scale(30),
        fontWeight: '800',
      },
      name: {
        marginTop: scale(4),
        color: theme.palette.text,
        fontSize: scale(23),
        lineHeight: scale(28),
        fontWeight: '800',
        textAlign: 'center',
      },
      details: {
        color: theme.palette.neutral600,
        fontSize: scale(13),
        lineHeight: scale(19),
        textAlign: 'center',
      },
      stats: {
        alignSelf: 'stretch',
        flexDirection: 'row',
        marginTop: scale(10),
        paddingTop: scale(16),
        borderTopWidth: scale(1),
        borderTopColor: theme.palette.divider,
      },
      stat: {
        flex: 1,
        alignItems: 'center',
        gap: scale(3),
      },
      statBorder: {
        borderLeftWidth: scale(1),
        borderLeftColor: theme.palette.divider,
      },
      statValue: {
        color: theme.palette.text,
        fontSize: scale(18),
        fontWeight: '800',
      },
      statLabel: {
        color: theme.palette.neutral600,
        fontSize: scale(11),
      },
      section: {
        marginTop: scale(22),
        marginBottom: scale(12),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: scale(12),
      },
      sectionTitle: {
        flex: 1,
        color: theme.palette.text,
        fontSize: scale(20),
        lineHeight: scale(24),
        fontWeight: '800',
      },
      sectionAction: {
        color: theme.palette.accent700,
        fontSize: scale(12.5),
        fontWeight: '800',
      },
      reviews: { gap: scale(10) },
      separator: { height: scale(13) },
      emptyListings: {
        paddingVertical: scale(28),
        paddingHorizontal: scale(18),
        borderRadius: scale(24),
        backgroundColor: theme.palette.white,
      },
      emptyText: {
        color: theme.palette.neutral600,
        fontSize: scale(13.5),
        lineHeight: scale(20),
        textAlign: 'center',
      },
    }),
);
