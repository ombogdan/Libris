import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from 'types/navigation';

export type WelcomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Welcome'
>;
