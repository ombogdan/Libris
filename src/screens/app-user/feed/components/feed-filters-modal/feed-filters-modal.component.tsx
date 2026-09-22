import { t, translateCondition } from 'shared/localization/i18n';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Chip, Field } from 'shared/components/ui';
import { useKeyboardHeight } from 'hooks/useKeyboardHeight';
import type { FeedSort } from 'services/books';
import { useStyles } from './feed-filters-modal.styles';
import type { FeedFiltersModalProps } from './feed-filters-modal.types';

const CONDITIONS = ['Як нова', 'Добрий', 'Читана'];
const RADIUS_OPTIONS = [5, 10, 25, 50, 100];

export function FeedFiltersModal({
  visible,
  filters,
  hasLocation,
  onClose,
  onApply,
  onReset,
}: FeedFiltersModalProps) {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const styles = useStyles({ bottomInset: insets.bottom, keyboardHeight });
  const [condition, setCondition] = useState(filters.condition);
  const [freeOnly, setFreeOnly] = useState(filters.freeOnly);
  const [minPrice, setMinPrice] = useState(filters.minPrice?.toString() ?? '');
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() ?? '');
  const [radiusKm, setRadiusKm] = useState(filters.radiusKm);
  const [sort, setSort] = useState(filters.sort);
  const sorts: { value: FeedSort; label: string }[] = [
    { value: 'recent', label: t('filters.sortRecent') },
    { value: 'price_asc', label: t('filters.sortPriceAsc') },
    { value: 'price_desc', label: t('filters.sortPriceDesc') },
    { value: 'distance', label: t('filters.sortDistance') },
  ];

  useEffect(() => {
    if (!visible) {
      return;
    }
    setCondition(filters.condition);
    setFreeOnly(filters.freeOnly);
    setMinPrice(filters.minPrice?.toString() ?? '');
    setMaxPrice(filters.maxPrice?.toString() ?? '');
    setRadiusKm(filters.radiusKm);
    setSort(filters.sort);
  }, [visible, filters]);

  const apply = () => {
    const parsedMin = Number(minPrice.replace(',', '.'));
    const parsedMax = Number(maxPrice.replace(',', '.'));
    // "Free" already means price = 0, so a price range alongside it can
    // only contradict it (e.g. "from 100") and silently zero out results —
    // free wins and the range is dropped.
    let nextMin =
      !freeOnly && minPrice.trim() && Number.isFinite(parsedMin)
        ? parsedMin
        : null;
    let nextMax =
      !freeOnly && maxPrice.trim() && Number.isFinite(parsedMax)
        ? parsedMax
        : null;
    // Same for a "from" typed higher than "to" — swap instead of returning
    // nothing.
    if (nextMin !== null && nextMax !== null && nextMin > nextMax) {
      [nextMin, nextMax] = [nextMax, nextMin];
    }

    onApply({
      condition,
      freeOnly,
      minPrice: nextMin,
      maxPrice: nextMax,
      radiusKm: hasLocation ? radiusKm : null,
      sort: sort === 'distance' && !hasLocation ? 'recent' : sort,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('filters.title')}</Text>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.label}>{t('filters.priceType')}</Text>
            <View style={styles.chips}>
              <Chip
                label={t('filters.anyPrice')}
                active={!freeOnly}
                onPress={() => setFreeOnly(false)}
              />
              <Chip
                label={t('feed.free')}
                active={freeOnly}
                onPress={() => setFreeOnly(true)}
              />
            </View>

            <Text style={styles.label}>{t('filters.condition')}</Text>
            <View style={styles.chips}>
              <Chip
                label={t('filters.anyCondition')}
                active={condition === null}
                onPress={() => setCondition(null)}
              />
              {CONDITIONS.map(value => (
                <Chip
                  key={value}
                  label={translateCondition(value)}
                  active={condition === value}
                  onPress={() => setCondition(value)}
                />
              ))}
            </View>

            <Text style={styles.label}>{t('filters.priceRange')}</Text>
            <View style={styles.priceRow}>
              <View
                style={[styles.priceField, freeOnly && styles.priceFieldOff]}
              >
                <Field
                  compact
                  editable={!freeOnly}
                  label={t('filters.priceFrom')}
                  keyboardType="numeric"
                  value={minPrice}
                  onChangeText={setMinPrice}
                />
              </View>
              <View
                style={[styles.priceField, freeOnly && styles.priceFieldOff]}
              >
                <Field
                  compact
                  editable={!freeOnly}
                  label={t('filters.priceTo')}
                  keyboardType="numeric"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                />
              </View>
            </View>

            <Text style={styles.label}>{t('filters.distance')}</Text>
            <View style={styles.chips}>
              <Chip
                label={t('filters.anyDistance')}
                active={radiusKm === null}
                onPress={() => setRadiusKm(null)}
              />
              {RADIUS_OPTIONS.map(value => (
                <Chip
                  key={value}
                  label={t('filters.radiusKm', { value })}
                  active={radiusKm === value}
                  onPress={() => setRadiusKm(value)}
                />
              ))}
            </View>
            {!hasLocation ? (
              <Text style={styles.hint}>{t('filters.noLocation')}</Text>
            ) : null}

            <Text style={styles.label}>{t('filters.sort')}</Text>
            <View style={styles.chips}>
              {sorts.map(option => (
                <Chip
                  key={option.value}
                  label={option.label}
                  active={sort === option.value}
                  onPress={() => setSort(option.value)}
                />
              ))}
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <View style={styles.actionGrow}>
              <Button secondary label={t('filters.reset')} onPress={onReset} />
            </View>
            <View style={styles.actionGrow}>
              <Button label={t('filters.apply')} onPress={apply} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
