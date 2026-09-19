import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, ScreenHeader } from 'shared/components/ui';
import {
  fetchProfileReviewSummary,
  fetchUserReviews,
} from 'services/reviews';
import { useTheme } from 'shared/theme';
import { RatingSummary } from './components/rating-summary';
import { ReviewItem } from './components/review-item';
import { useStyles } from './user-reviews.styles';
import type {
  UserReviewListItem,
  UserReviewsScreenProps,
} from './user-reviews.types';

export function UserReviewsScreen({
  navigation,
  route,
}: UserReviewsScreenProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ bottomInset: insets.bottom });
  const { theme } = useTheme();
  const [reviews, setReviews] = useState<UserReviewListItem[]>([]);
  const [ratingAverage, setRatingAverage] = useState<number | null>(null);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const displayName = route.params.displayName?.trim() || 'Користувач';
  const hasReviews = reviews.length > 0;

  const loadReviews = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const [rows, summary] = await Promise.all([
          fetchUserReviews(route.params.userId),
          fetchProfileReviewSummary(route.params.userId),
        ]);
        setReviews(
          rows.map(row => ({
            id: row.id,
            reviewerName: row.reviewer_name,
            reviewerAvatarUrl: row.reviewer_avatar_url,
            rating: row.rating,
            comment: row.comment || null,
            listingTitle: row.listing_title,
            createdAt: row.created_at,
          })),
        );
        setRatingAverage(summary.review_count ? summary.rating_average : null);
        setReviewsCount(summary.review_count);
      } catch (loadError) {
        setError(
          loadError && typeof loadError === 'object' && 'message' in loadError
            ? String(loadError.message)
            : 'Не вдалося завантажити відгуки.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [route.params.userId],
  );

  useFocusEffect(
    useCallback(() => {
      void loadReviews();
    }, [loadReviews]),
  );

  const renderReview = useCallback(
    ({ item }: { item: UserReviewListItem }) => <ReviewItem review={item} />,
    [],
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={theme.palette.accent} />
          <Text style={styles.stateText}>Завантажуємо відгуки…</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centeredState}>
          <Text style={styles.errorText}>
            Не вдалося завантажити відгуки. Перевір з’єднання та спробуй ще раз.
          </Text>
          <Button
            secondary
            label="Спробувати ще раз"
            onPress={() => void loadReviews()}
          />
        </View>
      );
    }

    return (
      <View style={styles.centeredState}>
        <View style={styles.emptyIcon}>
          <Text style={styles.emptyIconText}>★</Text>
        </View>
        <Text style={styles.stateText}>
          У цього користувача ще немає відгуків.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Відгуки" onBack={navigation.goBack} />

      <FlatList
        data={reviews}
        keyExtractor={review => review.id}
        renderItem={renderReview}
        contentContainerStyle={[styles.page, !hasReviews && styles.emptyPage]}
        ListHeaderComponent={
          <>
            <RatingSummary
              displayName={displayName}
              average={ratingAverage}
              count={reviewsCount}
            />
            {error && hasReviews ? (
              <View style={styles.inlineError}>
                <Text style={styles.inlineErrorText}>
                  Не вдалося оновити відгуки
                </Text>
                <Button
                  secondary
                  label="Повторити"
                  onPress={() => void loadReviews()}
                />
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadReviews(true)}
            colors={[theme.palette.accent]}
            tintColor={theme.palette.accent}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
