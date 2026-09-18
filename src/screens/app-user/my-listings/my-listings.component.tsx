import React from 'react';
import { ScrollView, View } from 'react-native';

import { Button, ScreenHeader } from 'shared/components/ui';
import { useAppStore } from 'store/AppStore';
import { ListingItem } from './components/listing-item';
import { useStyles } from './my-listings.styles';
import type { MyListingsScreenProps } from './my-listings.types';

export function MyListingsScreen({ navigation }: MyListingsScreenProps) {
  const { ads } = useAppStore();
  const styles = useStyles();

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Мої оголошення" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.page}>
        {ads.map(ad => (
          <ListingItem key={ad.id} ad={ad} />
        ))}
        <Button
          secondary
          label="Додати ще книгу"
          onPress={() => navigation.navigate('Tabs', { screen: 'Add' })}
        />
      </ScrollView>
    </View>
  );
}
