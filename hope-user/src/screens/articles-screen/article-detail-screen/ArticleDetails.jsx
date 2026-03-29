/**
 * @file ArticleDetail.jsx
 * @module Screens/ArticleDetail
 * @description
 * Beautiful, animated, realistic and professional Article Detail screen with image carousel, smooth fade-in animations, premium typography, meta information, tags and clean reading experience.
 */

import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  StatusBar,
  Image,
  FlatList,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { theme } from '../../../styles/Themes';
import Header from '../../../utilities/custom-components/header/header/Header';
import { getAllArticles } from '../../../redux/slices/articles.slice';
import Loader from '../../../utilities/custom-components/loader/Loader.utility';

const { width, height } = Dimensions.get('window');

const formatCategoryBadge = categoryStr => {
  if (!categoryStr) return 'Mental Health';
  return categoryStr
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const formatDate = dateStr => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const ArticleDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const { articleId } = route.params || {};
  const { allArticles, loading } = useSelector(state => state.article);

  const article = allArticles?.find(a => a._id === articleId) || null;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor(theme.colors.primary);

    if (!allArticles?.length) {
      dispatch(getAllArticles());
    }
  }, [dispatch, allArticles]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        friction: 8,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (loading && !article) {
    return (
      <View style={styles.loaderContainer}>
        <Loader />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.loaderContainer}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={60}
          color={theme.colors.gray}
        />
        <Text style={styles.errorText}>Article not found</Text>
      </View>
    );
  }

  const images =
    article.thumbnail?.length > 0
      ? article.thumbnail
      : ['https://via.placeholder.com/800x500.png?text=Article+Image'];

  let tags = [];
  if (article.tags?.length) {
    const raw = article.tags[0];
    if (typeof raw === 'string' && raw.startsWith('[')) {
      try {
        tags = JSON.parse(raw);
      } catch (e) {
        tags = article.tags;
      }
    } else {
      tags = article.tags;
    }
  }

  const renderCarouselItem = ({ item }) => (
    <View style={styles.carouselItem}>
      <Image
        source={{ uri: item }}
        style={styles.heroImage}
        resizeMode="cover"
      />
    </View>
  );

  return (
    <LinearGradient
      colors={[
        theme.colors.primary,
        theme.colors.secondary,
        theme.colors.tertiary,
      ]}
      style={styles.container}
    >
      <Header
        showTopRow={false}
        showLogo={false}
        showAvatar={false}
        showGreeting={false}
        showTitle={false}
        showBackButton={true}
      />

      <View style={styles.content}>
        <Animated.ScrollView
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }],
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.carouselContainer}>
            <FlatList
              data={images}
              renderItem={renderCarouselItem}
              keyExtractor={(_, index) => index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.carousel}
            />

            {images.length > 1 && (
              <View style={styles.dotContainer}>
                {images.map((_, index) => (
                  <View key={index} style={styles.dot} />
                ))}
              </View>
            )}
          </View>

          <View style={styles.articleInfo}>
            <View style={styles.badgeRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.badgeText}>
                  {formatCategoryBadge(article.category)}
                </Text>
              </View>

              {article.readingTime && (
                <View style={styles.readingTimeBadge}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={14}
                    color={theme.colors.secondary}
                  />
                  <Text style={styles.readingTimeText}>
                    {article.readingTime} min read
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.title}>{article.title}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                {article.addedBy?.userName || 'The Hope Team'}
              </Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>
                {formatDate(article.createdAt)}
              </Text>
            </View>

            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <View key={index} style={styles.tagChip}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.contentText}>
              {article.content || 'No content available.'}
            </Text>
          </View>
        </Animated.ScrollView>
      </View>
    </LinearGradient>
  );
};

export default ArticleDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -20,
    overflow: 'hidden',
  },

  scrollContent: {
    paddingBottom: height * 0.1,
  },

  carouselContainer: {
    position: 'relative',
  },

  carousel: {
    height: height * 0.32,
  },

  carouselItem: {
    width: width,
    height: height * 0.32,
  },

  heroImage: {
    width: '100%',
    height: '100%',
  },

  dotContainer: {
    position: 'absolute',
    bottom: theme.spacing(3),
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.white,
    opacity: 0.6,
  },

  articleInfo: {
    paddingHorizontal: theme.spacing(3.5),
    paddingTop: theme.spacing(4),
  },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },

  categoryBadge: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing(3),
    paddingVertical: theme.spacing(1),
    borderRadius: theme.borderRadius.large,
  },

  badgeText: {
    color: theme.colors.white,
    fontSize: 13,
    fontFamily: theme.typography.semiBold,
  },

  readingTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: theme.spacing(2.5),
    paddingVertical: theme.spacing(1),
    borderRadius: theme.borderRadius.large,
    gap: 4,
  },

  readingTimeText: {
    fontSize: 13,
    fontFamily: theme.typography.medium,
    color: theme.colors.dark,
  },

  title: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.bold,
    color: theme.colors.dark,
    lineHeight: 34,
    marginBottom: theme.spacing(3),
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing(4),
  },

  metaText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.medium,
    color: theme.colors.gray,
  },

  metaDot: {
    marginHorizontal: theme.spacing(2),
    color: theme.colors.gray,
    fontSize: 18,
    lineHeight: 14,
  },

  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(5),
  },

  tagChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: theme.spacing(3),
    paddingVertical: theme.spacing(1),
    borderRadius: theme.borderRadius.large,
  },

  tagText: {
    fontSize: 13,
    fontFamily: theme.typography.medium,
    color: theme.colors.dark,
  },

  contentText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.regular,
    color: '#3E322A',
    lineHeight: 26,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },

  errorText: {
    marginTop: theme.spacing(3),
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.medium,
    color: theme.colors.gray,
  },
});
