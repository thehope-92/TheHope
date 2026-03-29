/**
 * @file ArticleCategory.jsx
 * @module Screens/ArticleCategory
 * @description
 * Dedicated screen to display all articles of a specific category with search support.
 */

import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { theme } from '../../../styles/Themes';
import Header from '../../../utilities/custom-components/header/header/Header';
import { getAllArticles } from '../../../redux/slices/articles.slice';

const { width, height } = Dimensions.get('window');

const AnimatedEmptyState = () => {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.emptyContainer}>
      <Animated.View
        style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}
      >
        <MaterialCommunityIcons
          name="book-open-variant"
          size={width * 0.35}
          color={theme.colors.secondary}
        />
      </Animated.View>
      <Text style={styles.emptyTitle}>No Articles Found</Text>
      <Text style={styles.emptySubtitle}>
        We couldn't find any articles in this category right now
      </Text>
    </View>
  );
};

const ArticleCategory = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const { categoryFilter } = route.params || {};
  const { allArticles, loading } = useSelector(state => state.article);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor(theme.colors.primary);
    dispatch(getAllArticles());
  }, [dispatch]);

  // Filter articles by category and search query
  const filteredArticles = useMemo(() => {
    let articles = allArticles || [];

    // Filter by category
    if (categoryFilter) {
      articles = articles.filter(
        article => article.category === categoryFilter,
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      articles = articles.filter(
        article =>
          article.title?.toLowerCase().includes(query) ||
          article.description?.toLowerCase().includes(query),
      );
    }

    return articles;
  }, [allArticles, categoryFilter, searchQuery]);

  const categoryName = categoryFilter
    ? categoryFilter
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    : 'Articles';

  const renderArticleItem = ({ item }) => {
    const imageUrl =
      item.thumbnail?.[0] ||
      'https://via.placeholder.com/400x200.png?text=No+Image';

    return (
      <TouchableOpacity
        style={styles.articleCard}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('Article_Detail', { articleId: item._id })
        }
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.articleImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.articleFooter}>
          <Text style={styles.articleTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.arrowButton}>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#333"
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={[
        theme.colors.primary,
        theme.colors.secondary,
        theme.colors.tertiary,
      ]}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <Header
          showTopRow={false}
          showLogo={true}
          showAvatar={false}
          showGreeting={false}
          showTitle={true}
          title={categoryName}
          logo={require('../../../assets/logo/logo.png')}
          placeholder={`Search in ${categoryName}...`}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showBackButton={true}
        />
      </View>

      <View style={styles.content}>
        {loading && filteredArticles.length === 0 ? (
          <View style={styles.centerLoader}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredArticles}
            keyExtractor={item => item._id}
            renderItem={renderArticleItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            ListEmptyComponent={AnimatedEmptyState}
          />
        )}
      </View>
    </LinearGradient>
  );
};

export default ArticleCategory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  headerContainer: {
    zIndex: 10,
  },

  content: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -20,
    overflow: 'hidden',
  },

  flatListContent: {
    paddingTop: theme.spacing(3),
    paddingBottom: height * 0.1,
    paddingHorizontal: theme.spacing(2.5),
  },

  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  articleCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 24,
    marginBottom: theme.spacing(3),
    ...theme.elevation.depth3,
  },

  imageContainer: {
    position: 'relative',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },

  articleImage: {
    width: '100%',
    height: height * 0.24,
  },

  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(3),
  },

  articleTitle: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.bold,
    color: theme.colors.dark,
    marginRight: theme.spacing(2),
    lineHeight: 24,
  },

  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.circle,
    backgroundColor: theme.colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: height * 0.22,
    paddingHorizontal: theme.spacing(6),
  },

  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.bold,
    color: theme.colors.dark,
    marginTop: theme.spacing(5),
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.medium,
    color: theme.colors.gray,
    marginTop: theme.spacing(2),
    textAlign: 'center',
    lineHeight: 22,
  },
});
