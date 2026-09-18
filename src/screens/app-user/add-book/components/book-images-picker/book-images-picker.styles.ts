import { StyleSheet } from 'react-native';
import { createStyles } from '../../../../theme';

export const useStyles = createStyles(({ theme, scale }: any) => ({
  ...StyleSheet.create({
    heading: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    label: {
      fontSize: scale(12),
      fontWeight: '700',
      color: theme.palette.neutral700,
    },
    photos: { gap: scale(10) },
    addButton: {
      width: scale(96),
      height: scale(132),
      borderRadius: scale(16),
      borderWidth: scale(1.5),
      borderStyle: 'dashed',
      borderColor: theme.palette.neutral400,
      alignItems: 'center',
      justifyContent: 'center',
      padding: scale(8),
    },
    preview: {
      width: scale(96),
      height: scale(132),
      borderRadius: scale(16),
      overflow: 'hidden',
      backgroundColor: theme.palette.neutral200,
    },
    image: { width: '100%', height: '100%' },
    removeButton: {
      position: 'absolute',
      top: scale(6),
      right: scale(6),
      width: scale(26),
      height: scale(26),
      borderRadius: scale(13),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.palette.overlay,
    },
    removeText: {
      color: theme.palette.white,
      fontSize: scale(20),
      lineHeight: scale(22),
    },
    coverBadge: {
      position: 'absolute',
      left: scale(6),
      bottom: scale(6),
      borderRadius: scale(999),
      paddingHorizontal: scale(7),
      paddingVertical: scale(4),
      backgroundColor: theme.palette.overlay,
    },
    coverBadgeText: {
      color: theme.palette.white,
      fontSize: scale(9),
      fontWeight: '700',
    },
    plus: { fontSize: scale(28), color: theme.palette.accent },
    addText: {
      fontSize: scale(10),
      textAlign: 'center',
      color: theme.palette.neutral600,
    },
  }),
  hitSlop: scale(8),
}));
