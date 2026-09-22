import { t } from 'shared/localization/i18n';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, ScreenHeader } from 'shared/components/ui';
import { useAuth } from 'providers/auth/AuthProvider';
import {
  fetchProfileReviewSummary,
  fetchUserReviews,
  replyToReview,
} from 'services/reviews';
import { getFriendlyErrorMessage } from 'services/moderation';
import { useAppStore } from 'store/AppStore';
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
  const { session } = useAuth();
  const store = useAppStore();
  const [reviews, setReviews] = useState<UserReviewListItem[]>([]);
  const [ratingAverage, setRatingAverage] = useState<number | null>(null);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const displayName = route.params.displayName?.trim() || t('common.user');
  const hasReviews = reviews.length > 0;
  const canReply = Boolean(
    session?.user.id && session.user.id === route.params.userId,
  );

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
            reply: row.reply,
            replyCreatedAt: row.reply_created_at,
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
            : t('reviews.loadError'),
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

  const submitReply = useCallback(
    async (reviewId: string, text: string) => {
      setIsSubmittingReply(true);
      try {
        const updated = await replyToReview(reviewId, text);
        setReviews(current =>
          current.map(item =>
            item.id === reviewId
              ? {
                  ...item,
                  reply: updated.reply,
                  replyCreatedAt: updated.reply_created_at,
                }
              : item,
          ),
        );
        setReplyingId(null);
      } catch (replyError) {
        store.notify(
          getFriendlyErrorMessage(replyError, t('reviews.replyError')),
        );
      } finally {
        setIsSubmittingReply(false);
      }
    },
    [store],
  );

  const confirmRemoveReply = useCallback(
    (reviewId: string) => {
      Alert.alert(t('reviews.removeReplyConfirmTitle'), '', [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('reviews.removeReply'),
          style: 'destructive',
          onPress: () => void submitReply(reviewId, ''),
        },
      ]);
    },
    [submitReply],
  );

  const renderReview = useCallback(
    ({ item }: { item: UserReviewListItem }) => (
      <ReviewItem
        review={item}
        revieweeName={displayName}
        canReply={canReply}
        isReplying={replyingId === item.id}
        isSubmittingReply={isSubmittingReply && replyingId === item.id}
        onStartReply={() => setReplyingId(item.id)}
        onCancelReply={() => setReplyingId(null)}
        onSubmitReply={text => void submitReply(item.id, text)}
        onRemoveReply={() => confirmRemoveReply(item.id)}
      />
    ),
    [canReply, confirmRemoveReply, displayName, isSubmittingReply, replyingId, submitReply],
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={theme.palette.accent} />
          <Text style={styles.stateText}>{t('reviews.loading')}</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centeredState}>
          <Text style={styles.errorText}>{t('reviews.loadError')}</Text>
          <Button
            secondary
            label={t('common.retry')}
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
        <Text style={styles.stateText}>{t('reviews.empty')}</Text>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title={t('reviews.title')} onBack={navigation.goBack} />

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
                  {t('reviews.updateError')}
                </Text>
                <Button
                  secondary
                  label={t('common.repeat')}
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
