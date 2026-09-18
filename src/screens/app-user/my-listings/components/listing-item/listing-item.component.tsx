import React from 'react';
import { Text, View } from 'react-native';

import { Cover, PricePill } from 'shared/components/ui';
import { useStyles } from './listing-item.styles';
import type { ListingItemProps } from './listing-item.types';

export function ListingItem({ ad }: ListingItemProps) {
  const styles = useStyles();

  return (
    <View style={styles.row}>
      <Cover
        book={{ title: ad.title, tone: ad.tone, imageUrls: ad.imageUrls }}
      />
      <View style={styles.info}>
        <Text style={styles.title}>{ad.title}</Text>
        <View style={styles.inline}>
          <PricePill value={ad.price} />
          <View style={styles.status}>
            <Text style={styles.statusText}>{ad.status}</Text>
          </View>
        </View>
        <Text style={styles.meta}>{ad.stats}</Text>
      </View>
    </View>
  );
}
