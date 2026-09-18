export type AppTheme = {
  palette: {
    background: string;
    white: string;
    text: string;
    divider: string;
    subtitle: string;
    overlay: string;
    error: string;
    accent100: string;
    accent200: string;
    accent300: string;
    accent: string;
    accent700: string;
    accent800: string;
    violet100: string;
    violet200: string;
    violet300: string;
    violet: string;
    violet800: string;
    neutral100: string;
    neutral200: string;
    neutral300: string;
    neutral400: string;
    neutral500: string;
    neutral600: string;
    neutral700: string;
    neutral800: string;
  };
};

export const defaultTheme: AppTheme = {
  palette: {
    background: '#eef2ec',
    white: '#ffffff',
    text: '#101a14',
    divider: 'rgba(16,26,20,.12)',
    subtitle: 'rgba(16,26,20,.58)',
    overlay: 'rgba(16,26,20,.78)',
    error: '#A53C3C',
    accent100: '#eaf7ef',
    accent200: '#d3f2e0',
    accent300: '#7ef0a3',
    accent: '#0d7f4a',
    accent700: '#0a6039',
    accent800: '#08462a',
    violet100: '#f2edff',
    violet200: '#e6dcff',
    violet300: '#c7b2ff',
    violet: '#6d4bd8',
    violet800: '#3b2578',
    neutral100: '#f7faf7',
    neutral200: '#eaefe9',
    neutral300: '#dae1d8',
    neutral400: '#b6c0b4',
    neutral500: '#93a091',
    neutral600: '#71806f',
    neutral700: '#536052',
    neutral800: '#38423a',
  },
};
