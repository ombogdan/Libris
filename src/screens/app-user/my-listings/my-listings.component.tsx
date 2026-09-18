import React from 'react';
import { Pressable, ScrollView, Text } from 'react-native';

import { Button, ScreenTitle } from '../../components/ui';
import { useAppStore } from '../../store/AppStore';
import { ListingItem } from './components/listing-item';
import { useStyles } from './my-listings.styles';
import type { MyListingsScreenProps } from './my-listings.types';

export function MyListingsScreen({ navigation }: MyListingsScreenProps) {
  const { ads } = useAppStore();
  const styles = useStyles();

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Pressable onPress={navigation.goBack}>
        <Text style={styles.back}>← Назад</Text>
      </Pressable>
      <ScreenTitle>Мої оголошення</ScreenTitle>
      {ads.map(ad => (
        <ListingItem key={ad.id} ad={ad} />
      ))}
      <Button
        secondary
        label="Додати ще книгу"
        onPress={() => navigation.navigate('Tabs', { screen: 'Add' })}
      />
    </ScrollView>
  );
}
