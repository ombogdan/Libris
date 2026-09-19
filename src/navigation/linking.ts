import type { LinkingOptions } from '@react-navigation/native';

import { publicWebUrl } from 'configs/publicLinks';
import type { RootStackParamList } from 'types/navigation';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [publicWebUrl, 'libris://'],
  config: {
    screens: {
      Book: 'book/:bookId',
      UserProfile: 'profile/:userId',
    },
  },
};
