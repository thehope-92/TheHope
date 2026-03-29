/**
 * @file ArticleDetail.jsx
 * @module Screens/ArticleDetail
 * @description
 * Ultra-enhanced, editorial-style Article Detail screen with premium typography and content formatting.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  StatusBar,
  Image,
  FlatList,
  Animated,
  TouchableOpacity,
  Share,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { theme } from '../../../styles/Themes';
import Header from '../../../utilities/custom-components/header/header/Header';
import { getArticleBySlug } from '../../../redux/slices/articles.slice';
import Loader from '../../../utilities/custom-components/loader/Loader.utility';

const { width, height } = Dimensions.get('window');

const formatCategoryBadge = categoryStr => {
  if (!categoryStr) return 'Mental Health';
  return categoryStr
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const ArticleDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { slug } = route.params || {};
  const { selectedArticle, loading } = useSelector(state => state.article);

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (slug) {
      dispatch(getArticleBySlug(slug));
    }
  }, [slug, dispatch]);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  if (loading && !selectedArticle) {
    return (
      <View style={styles.loaderContainer}>
        <Loader />
      </View>
    );
  }

  if (!selectedArticle) {
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
    selectedArticle.thumbnail?.length > 0
      ? selectedArticle.thumbnail
      : ['https://via.placeholder.com/800x500.png'];

  const renderCarouselItem = ({ item }) => (
    <View style={styles.carouselItem}>
      <Image
        source={{ uri: item }}
        style={styles.heroImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)']}
        style={styles.imageOverlay}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        showTopRow={false}
        showLogo={true}
        logo={require('../../../assets/logo/logo.png')}
        showAvatar={false}
        showGreeting={false}
        showTitle={true}
        title={selectedArticle.title}
        showSearch={false}
        showBackButton={true}
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.carouselWrapper}>
          <FlatList
            data={images}
            renderItem={renderCarouselItem}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            pagingEnabled
            onMomentumScrollEnd={e => {
              setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
            }}
            showsHorizontalScrollIndicator={false}
          />
          {images.length > 1 && (
            <View style={styles.pagination}>
              {images.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, activeIndex === i && styles.activeDot]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.mainContentSheet}>
          <View style={styles.dragHandle} />

          <View style={styles.metaHeader}>
            <View style={styles.badgeRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.badgeText}>
                  {formatCategoryBadge(selectedArticle.category)}
                </Text>
              </View>
              <View style={styles.viewCount}>
                <MaterialCommunityIcons
                  name="eye-outline"
                  size={16}
                  color="#888"
                />
                <Text style={styles.viewText}>
                  {selectedArticle.viewCount || 0} Views
                </Text>
              </View>
            </View>

            <Text style={styles.mainTitle}>{selectedArticle.title}</Text>

            <View style={styles.authorSection}>
              <Image
                source={require('../../../assets/placeHolder/placeholder.png')}
                style={styles.authorAvatar}
              />
              <View>
                <Text style={styles.authorName}>
                  {selectedArticle.addedBy?.userName || 'The Hope Team'}
                </Text>
                <Text style={styles.publishDate}>
                  {new Date(selectedArticle.createdAt).toLocaleDateString(
                    'en-US',
                    { month: 'long', day: 'numeric', year: 'numeric' },
                  )}{' '}
                  • {selectedArticle.readingTime} min read
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.articleBody}>
            <Text style={styles.introText}>
              Understanding mental wellness starts with knowledge. This guide
              explores the depths of {selectedArticle.title} to help you find
              balance.
            </Text>

            <View style={styles.contentDivider} />

            <Text style={styles.bodyText}>{selectedArticle.content}</Text>

            <View style={styles.quoteCard}>
              <MaterialCommunityIcons
                name="format-quote-open"
                size={32}
                color={theme.colors.primary}
                style={styles.quoteIcon}
              />
              <Text style={styles.quoteText}>
                Your mental health is a priority. Your happiness is an
                essential. Your self-care is a necessity.
              </Text>
            </View>
          </View>

          <View style={styles.tagsWrapper}>
            {selectedArticle.tags?.map((tag, idx) => (
              <View key={idx} style={styles.tagChip}>
                <Text style={styles.tagLabel}>
                  #{tag.replace(/[\[\]"]/g, '')}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default ArticleDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },

  scrollContent: {
    paddingBottom: height * 0.1,
  },

  carouselWrapper: {
    height: height * 0.35,
    backgroundColor: '#000',
  },

  carouselItem: {
    width: width,
    height: height * 0.35,
  },

  heroImage: {
    width: '100%',
    height: '100%',
  },

  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  pagination: {
    position: 'absolute',
    bottom: height * 0.02,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.gap(2),
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },

  activeDot: {
    backgroundColor: '#FFF',
    width: 18,
  },

  mainContentSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -30,
    minHeight: height * 0.7,
    paddingHorizontal: 24,
  },

  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },

  metaHeader: {
    marginBottom: 25,
  },

  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  categoryBadge: {
    backgroundColor: '#F0F7F0',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },

  badgeText: {
    color: '#6B8E6B',
    fontSize: 12,
    fontFamily: theme.typography.semiBold,
    textTransform: 'uppercase',
  },

  viewCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  viewText: {
    color: '#999',
    fontSize: 12,
    fontFamily: theme.typography.medium,
  },

  mainTitle: {
    fontSize: 28,
    fontFamily: theme.typography.bold,
    color: '#2D2D2D',
    lineHeight: 36,
    marginBottom: 20,
  },

  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },

  authorAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
    backgroundColor: '#F5F5F5',
  },

  authorName: {
    fontSize: 15,
    fontFamily: theme.typography.bold,
    color: '#333',
  },

  publishDate: {
    fontSize: 12,
    color: '#888',
    fontFamily: theme.typography.regular,
    marginTop: 2,
  },

  shareBtn: {
    marginLeft: 'auto',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  articleBody: {
    marginTop: 20,
  },

  introText: {
    fontSize: 17,
    fontFamily: theme.typography.medium,
    color: '#555',
    lineHeight: 26,
    fontStyle: 'italic',
  },

  contentDivider: {
    width: 50,
    height: 4,
    backgroundColor: theme.colors.primary,
    marginVertical: 25,
    borderRadius: 2,
  },

  bodyText: {
    fontSize: 16,
    lineHeight: 28,
    fontFamily: theme.typography.regular,
    color: '#444',
    textAlign: 'justify',
  },

  quoteCard: {
    backgroundColor: '#FDF8F0',
    padding: 24,
    borderRadius: 20,
    marginVertical: 30,
    borderLeftWidth: 5,
    borderLeftColor: theme.colors.primary,
  },

  quoteIcon: {
    marginBottom: 10,
  },

  quoteText: {
    fontSize: 18,
    fontFamily: theme.typography.medium,
    color: '#3E322A',
    lineHeight: 28,
  },

  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
    paddingBottom: 40,
  },

  tagChip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },

  tagLabel: {
    fontSize: 13,
    color: '#777',
    fontFamily: theme.typography.medium,
  },

  errorText: {
    marginTop: 20,
    fontSize: 16,
    color: '#999',
    fontFamily: theme.typography.medium,
  },
});
