import { StyleSheet } from 'react-native';
import { createStyles } from '../../../../theme';

export const useStyles = createStyles(({ theme, scale }: any) => ({
  ...StyleSheet.create({
    fallback: { alignItems: 'center' },
    gallery: { gap: scale(10) },
    image: {
      width: scale(260),
      height: scale(350),
      borderRadius: scale(22),
      backgroundColor: theme.palette.neutral200,
    },
  }),
  snapInterval: scale(270),
}));
