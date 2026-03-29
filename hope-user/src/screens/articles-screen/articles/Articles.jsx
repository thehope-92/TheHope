/**
 * @file Articles.jsx
 * @module Screens/Articles
 * @description
 * Ultra ultra enhanced Articles screen with fully theme-driven styling, responsive layout,
 * premium category carousel, and pull-to-refresh functionality for real-time content updates.
 */

import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
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
  ScrollView,
  Animated,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { theme } from '../../../styles/Themes';
import Header from '../../../utilities/custom-components/header/header/Header';
import { getAllArticles } from '../../../redux/slices/articles.slice';

const { width, height } = Dimensions.get('window');

const TOP_CATEGORIES = [
  { id: '1', name: 'Stress', key: 'STRESS', color: '#8D6E63', icon: 'brain' },
  {
    id: '2',
    name: 'Anxiety',
    key: 'ANXIETY',
    color: '#B39DDB',
    icon: 'lightning-bolt',
  },
  {
    id: '3',
    name: 'Health',
    key: 'CORE_MENTAL_HEALTH',
    color: '#FF8A65',
    icon: 'medical-bag',
  },
  {
    id: '4',
    name: 'Self-Care',
    key: 'SELF_CARE',
    color: '#FFD54F',
    icon: 'human-greeting',
  },
  {
    id: '5',
    name: 'Healing',
    key: 'MINDFULNESS',
    color: '#D7CCC8',
    icon: 'flower-tulip',
  },
];

const formatCategoryBadge = categoryStr => {
  if (!categoryStr) return 'Mental Health';
  return categoryStr
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const AnimatedEmptyState = () => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
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
        style={{
          alignItems: 'center',
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <MaterialCommunityIcons
          name="book-open-variant"
          size={width * 0.38}
          color={theme.colors.secondary}
        />
        <Text style={styles.emptyTitle}>No Articles Found</Text>
        <Text style={styles.emptySubtitle}>
          We couldn't find any articles matching your search. Try exploring
          different categories.
        </Text>
      </Animated.View>
    </View>
  );
};

const Articles = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { allArticles, loading } = useSelector(state => state.article);

  const fetchArticles = useCallback(() => {
    dispatch(getAllArticles());
  }, [dispatch]);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor(theme.colors.primary);
    fetchArticles();
  }, [fetchArticles]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(getAllArticles());
    setRefreshing(false);
  }, [dispatch]);

  const isSearching = searchQuery.trim().length > 0;

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return allArticles;
    const query = searchQuery.toLowerCase().trim();
    return allArticles.filter(
      article =>
        article.title?.toLowerCase().includes(query) ||
        article.category?.toLowerCase().includes(query),
    );
  }, [allArticles, searchQuery]);

  const renderCategories = () => (
    <View style={styles.categoriesWrapper}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Suggested Category</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('All_Categories')}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {TOP_CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={styles.categoryItem}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('Article_Category', {
                categoryFilter: cat.key,
              })
            }
          >
            <View style={[styles.iconCircle, { backgroundColor: cat.color }]}>
              <MaterialCommunityIcons name={cat.icon} size={32} color="#FFF" />
            </View>
            <Text style={styles.categoryText}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderArticleItem = ({ item }) => {
    const imageUrl =
      item.thumbnail && item.thumbnail.length > 0
        ? item.thumbnail[0]
        : 'https://via.placeholder.com/400x200.png?text=No+Image';

    return (
      <TouchableOpacity
        style={styles.articleCard}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('Article_Detail', {
            slug: item.slug,
            articleId: item._id,
          })
        }
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.articleImage}
            resizeMode="cover"
          />
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>
              {formatCategoryBadge(item.category)}
            </Text>
          </View>
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

        <View style={styles.articleViewContainer}>
          <MaterialCommunityIcons
            name="eye"
            size={20}
            color={theme.colors.tertiary}
            style={{ marginLeft: theme.spacing(3) }}
          />
          <Text style={styles.articleViews} numberOfLines={1}>
            {item.viewCount || 0} views
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => {
    if (isSearching) return null;
    return (
      <View>
        {renderCategories()}
        <View
          style={[
            styles.sectionHeader,
            {
              paddingHorizontal: theme.spacing(2.5),
              marginBottom: theme.spacing(2),
            },
          ]}
        >
          <Text style={styles.sectionTitle}>All Articles</Text>
        </View>
      </View>
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
          title={'Articles'}
          logo={require('../../../assets/logo/logo.png')}
          placeholder={'Search Articles'}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </View>

      <View style={styles.content}>
        {loading && !refreshing && filteredArticles?.length === 0 ? (
          <View style={styles.centerLoader}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredArticles}
            keyExtractor={item => item._id}
            renderItem={renderArticleItem}
            ListHeaderComponent={ListHeader}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            ListEmptyComponent={AnimatedEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
          />
        )}
      </View>
    </LinearGradient>
  );
};

export default Articles;

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
  },

  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  categoriesWrapper: {
    marginBottom: theme.spacing(4),
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },

  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.bold,
    color: theme.colors.dark,
  },

  seeAllText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.medium,
    color: theme.colors.secondary,
  },

  categoriesScroll: {
    paddingHorizontal: theme.spacing(2),
  },

  categoryItem: {
    alignItems: 'center',
    marginHorizontal: theme.spacing(1),
  },

  iconCircle: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: theme.borderRadius.circle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
    ...theme.elevation.depth2,
  },

  categoryText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.medium,
    color: theme.colors.dark,
  },

  articleCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 24,
    marginHorizontal: theme.spacing(2.5),
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
    height: height * 0.25,
  },

  badgeContainer: {
    position: 'absolute',
    top: theme.spacing(2),
    left: theme.spacing(2),
    backgroundColor: 'rgba(30, 30, 30, 0.75)',
    paddingHorizontal: theme.spacing(2),
    paddingVertical: theme.spacing(1),
    borderRadius: theme.borderRadius.large,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  badgeText: {
    color: theme.colors.white,
    fontSize: 11,
    fontFamily: theme.typography.semiBold,
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
    lineHeight: theme.typography.lineHeight.md,
  },

  articleViewContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    bottom: theme.spacing(2),
  },

  articleViews: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.dark,
    left: theme.spacing(4),
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
    paddingTop: height * 0.2,
    paddingHorizontal: theme.spacing(5),
  },

  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.bold,
    color: theme.colors.dark,
    marginTop: theme.spacing(4),
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.medium,
    color: theme.colors.gray,
    marginTop: theme.spacing(2),
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.sm,
  },
});
