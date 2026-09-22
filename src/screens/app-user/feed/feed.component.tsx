import {
  BOOK_CATEGORIES,
  formatBooksCount,
  t,
  translateCategory,
} from 'shared/localization/i18n';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BookRow,
  Empty,
  ScreenHeader,
  useCommonStyles,
} from 'shared/components/ui';
import type { Book } from 'shared/data';
import { useAppStore } from 'store/AppStore';
import { useAuth } from 'providers/auth/AuthProvider';
import { useTheme } from 'shared/theme';
import { fetchActiveListingCities } from 'services/books';
import type { FeedSort } from 'services/books';
import { FeedFilterButton } from './components/feed-filter-button';
import { FeedFiltersModal } from './components/feed-filters-modal';
import { FeedSelectModal } from './components/feed-select-modal';
import { useStyles } from './feed.styles';
import type { FeedScreenProps } from './feed.types';

const SORT_LABEL_KEYS: Record<FeedSort, string> = {
  recent: 'filters.sortRecent',
  price_asc: 'filters.sortPriceAsc',
  price_desc: 'filters.sortPriceDesc',
  distance: 'filters.sortDistance',
};

export function FeedScreen({ navigation }: FeedScreenProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });
  const common = useCommonStyles();
  const { theme } = useTheme();
  const store = useAppStore();
  const { profile } = useAuth();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectOpen, setSelectOpen] = useState<
    'location' | 'category' | null
  >(null);
  const initialCityApplied = useRef(false);
  const hasLocation = Boolean(profile?.latitude && profile?.longitude);
  const filters = store.feedFilters;
  const setFeedFilters = store.setFeedFilters;
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (initialCityApplied.current || !profile?.city) {
      return;
    }
    initialCityApplied.current = true;
    setFeedFilters({ city: profile.city });
  }, [profile?.city, setFeedFilters]);

  useEffect(() => {
    let cancelled = false;
    fetchActiveListingCities()
      .then(cities => {
        if (!cancelled) {
          setCitySuggestions(cities);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  const locationOptions = useMemo(() => {
    const options: { value: string | null; label: string }[] = [
      { value: null, label: t('filters.allUkraine') },
    ];
    if (profile?.city) {
      options.push({ value: profile.city, label: profile.city });
    }
    if (
      filters.city &&
      !options.some(option => option.value === filters.city)
    ) {
      options.push({ value: filters.city, label: filters.city });
    }
    return options;
  }, [filters.city, profile?.city]);

  const categoryOptions = useMemo(
    () => [
      { value: null, label: t('filters.allCategories') },
      ...BOOK_CATEGORIES.map(category => ({
        value: category,
        label: translateCategory(category),
      })),
    ],
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: Book }) => (
      <BookRow
        book={item}
        favorite={store.favs.includes(item.id)}
        onOpen={() =>
          navigation.getParent()?.navigate('Book', { bookId: item.id })
        }
        onHeart={() => store.toggleFav(item.id)}
      />
    ),
    [navigation, store],
  );

  const activeFilterCount = [
    filters.freeOnly ? true : null,
    filters.condition,
    filters.minPrice,
    filters.maxPrice,
    filters.radiusKm,
    filters.sort !== 'recent' ? filters.sort : null,
  ].filter(value => value !== null && value !== undefined).length;

  return (
    <View style={styles.screen}>
      <ScreenHeader title={t('feed.title')} />

      <FlatList
        data={store.feedBooks}
        keyExtractor={book => book.id}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={[
          styles.page,
          !store.feedBooks.length && styles.emptyPage,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={store.feedLoading && Boolean(store.feedBooks.length)}
            onRefresh={() => void store.loadFeed()}
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => void store.loadMoreFeed()}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <TextInput
              style={styles.search}
              value={filters.query}
              onChangeText={value => store.setFeedFilters({ query: value })}
              placeholder={t('feed.search')}
              placeholderTextColor={styles.colors.placeholder}
            />
            <View style={styles.quickFilters}>
              <FeedFilterButton
                label={t('filters.location')}
                value={filters.city || t('filters.allUkraine')}
                icon="location-outline"
                onPress={() => setSelectOpen('location')}
              />
              <FeedFilterButton
                label={t('filters.category')}
                value={
                  filters.category
                    ? translateCategory(filters.category)
                    : t('filters.allCategories')
                }
                icon="book-outline"
                onPress={() => setSelectOpen('category')}
              />
              <FeedFilterButton
                compact
                label={t('filters.button')}
                icon="options-outline"
                badge={activeFilterCount}
                onPress={() => setFiltersOpen(true)}
              />
            </View>
            <Text style={common.mini}>
              {t('feed.resultSummary', {
                books: formatBooksCount(store.feedBooks.length),
                sort: t(SORT_LABEL_KEYS[filters.sort]),
              })}
            </Text>
            {store.feedError ? (
              <Empty text={t('feed.loadError', { error: store.feedError })} />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          store.feedLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={theme.palette.accent} />
            </View>
          ) : store.feedError ? null : (
            <Empty text={t('feed.empty')} />
          )
        }
        ListFooterComponent={
          store.feedLoadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator color={theme.palette.accent} />
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />

      <FeedFiltersModal
        visible={filtersOpen}
        filters={filters}
        hasLocation={hasLocation}
        onClose={() => setFiltersOpen(false)}
        onApply={partial => {
          store.setFeedFilters(partial);
          setFiltersOpen(false);
        }}
        onReset={() => {
          store.setFeedFilters({
            freeOnly: false,
            condition: null,
            minPrice: null,
            maxPrice: null,
            radiusKm: null,
            sort: 'recent',
          });
          setFiltersOpen(false);
        }}
      />

      <FeedSelectModal
        visible={selectOpen === 'location'}
        title={t('filters.chooseLocation')}
        value={filters.city}
        options={locationOptions}
        customLabel={t('filters.otherLocation')}
        customPlaceholder={t('filters.cityVillagePlaceholder')}
        customValue={filters.city ?? ''}
        suggestions={citySuggestions}
        onClose={() => setSelectOpen(null)}
        onSelect={city => {
          initialCityApplied.current = true;
          store.setFeedFilters({ city });
        }}
      />

      <FeedSelectModal
        visible={selectOpen === 'category'}
        title={t('filters.chooseCategory')}
        value={filters.category}
        options={categoryOptions}
        onClose={() => setSelectOpen(null)}
        onSelect={category => store.setFeedFilters({ category })}
      />
    </View>
  );
}
