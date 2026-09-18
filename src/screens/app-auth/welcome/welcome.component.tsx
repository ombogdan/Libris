import React from 'react';
import { Text, View } from 'react-native';

import { Button, Chip } from '../../components/ui';
import { useStyles } from './welcome.styles';
import type { WelcomeScreenProps } from './welcome.types';

export function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const styles = useStyles();

  return (
    <View style={styles.page}>
      <View>
        <View style={styles.logo}>
          <Text style={styles.logoText}>К</Text>
        </View>
        <Text style={styles.hero}>Книжки,{`\n`}що йдуть далі</Text>
        <Text style={styles.subtitle}>
          Продавай прочитане, віддавай безкоштовно, знаходь підручники в своєму
          місті.
        </Text>
      </View>
      <View>
        <View style={styles.tags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>1 240 книг поруч</Text>
          </View>
          <Chip label="Полтава · Київ · Львів" />
        </View>
        <Button
          label="Створити акаунт"
          onPress={() => navigation.navigate('Signup')}
        />
        <Button
          secondary
          label="Спершу подивлюсь"
          onPress={() => navigation.replace('Tabs', { screen: 'Feed' })}
        />
      </View>
    </View>
  );
}
