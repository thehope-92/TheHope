/**
 * @file YogaGuide.jsx
 * @module Screens/YogaGuide
 * @description
 * Ultra-enhanced, high-performance Yoga Guide screen.
 * Features theme-driven responsive layouts, floating glassmorphism badges,
 * scroll-reactive item scaling animations, and premium category navigation.
 * Optimized for high-density displays using localized Dimensions and central design tokens.
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
import { getAllYogaGuides } from '../../../redux/slices/yoga.slice';

const { width, height } = Dimensions.get('window');

const YOGA_CATEGORIES = [
  { id: '1', name: 'Hatha', key: 'HATHA', color: '#81C784', icon: 'yoga' },
  { id: '2', name: 'Vinyasa', key: 'VINYASA', color: '#64B5F6', icon: 'waves' },
  {
    id: '3',
    name: 'Yin',
    key: 'YIN',
    color: '#BA68C8',
    icon: 'moon-waning-crescent',
  },
  {
    id: '4',
    name: 'Restorative',
    key: 'RESTORATIVE',
    color: '#FF8A65',
    icon: 'leaf',
  },
  {
    id: '5',
    name: 'Power',
    key: 'POWER',
    color: '#E57373',
    icon: 'lightning-bolt',
  },
];

const formatTypeBadge = typeStr => {
  if (!typeStr) return 'Yoga';
  return typeStr
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
          name="flower-poppy"
          size={width * 0.4}
          color={theme.colors.secondary}
        />
        <Text style={styles.emptyTitle}>Begin Your Journey</Text>
        <Text style={styles.emptySubtitle}>
          Explore different yoga styles or adjust your search to find the
          perfect practice.
        </Text>
      </Animated.View>
    </View>
  );
};

const YogaGuide = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const { allGuides, loading } = useSelector(state => state.yoga);

  const fetchGuides = useCallback(() => {
    dispatch(getAllYogaGuides());
  }, [dispatch]);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor(theme.colors.primary);
    fetchGuides();
  }, [fetchGuides]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(getAllYogaGuides());
    setRefreshing(false);
  }, [dispatch]);

  const isSearching = searchQuery.trim().length > 0;

  const filteredGuides = useMemo(() => {
    if (!searchQuery.trim()) return allGuides;
    const query = searchQuery.toLowerCase().trim();
    return allGuides.filter(
      guide =>
        guide.title?.toLowerCase().includes(query) ||
        guide.category?.toLowerCase().includes(query),
    );
  }, [allGuides, searchQuery]);

  const renderGuideItem = ({ item, index }) => {
    const imageUrl =
      item.coverImage || 'https://via.placeholder.com/600x400.png?text=Yoga';

    const inputRange = [
      -1,
      0,
      height * 0.3 * index,
      height * 0.3 * (index + 2),
    ];
    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.9],
    });
    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.5],
    });

    return (
      <Animated.View
        style={[styles.guideCardContainer, { transform: [{ scale }], opacity }]}
      >
        <TouchableOpacity
          style={styles.guideCard}
          activeOpacity={0.95}
          onPress={() =>
            navigation.navigate('Yoga_Detail', {
              yogaId: item._id,
              yogaData: item,
            })
          }
        >
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.guideImage}
              resizeMode="cover"
            />
            <View style={styles.floatingBadges}>
              <View
                style={[
                  styles.glassBadge,
                  { backgroundColor: theme.colors.primary + 'CC' },
                ]}
              >
                <Text style={styles.badgeText}>
                  {formatTypeBadge(item.category)}
                </Text>
              </View>
              <View
                style={[
                  styles.glassBadge,
                  { backgroundColor: theme.colors.tertiary + 'EE' },
                ]}
              >
                <Text
                  style={[styles.badgeText, { color: theme.colors.primary }]}
                >
                  {item.difficultyLevel}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.guideTitle} numberOfLines={1}>
              {item.title}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={16}
                  color={theme.colors.secondary}
                />
                <Text style={styles.metaText}>{item.durationMinutes} min</Text>
              </View>

              <View style={styles.metaSeparator} />

              <View style={styles.metaItem}>
                <MaterialCommunityIcons
                  name="lightning-bolt-outline"
                  size={16}
                  color={theme.colors.secondary}
                />
                <Text style={styles.metaText} numberOfLines={1}>
                  {item.targetAreas?.slice(0, 2).join(', ') || 'General'}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primary, '#1e4b82']}
      style={styles.container}
    >
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <View style={styles.headerContainer}>
        <Header
          showTopRow={false}
          showLogo={true}
          showAvatar={false}
          showGreeting={false}
          showTitle={true}
          title={'Yoga Guides'}
          logo={require('../../../assets/logo/logo.png')}
          placeholder={'Search yoga guides...'}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </View>

      <View style={styles.mainContent}>
        {loading && !refreshing && filteredGuides?.length === 0 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Curating your session...</Text>
          </View>
        ) : (
          <Animated.FlatList
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true },
            )}
            data={filteredGuides}
            keyExtractor={item => item._id}
            renderItem={renderGuideItem}
            // 2. MODIFIED: Only show ListHeader when NOT searching
            ListHeaderComponent={!isSearching ? ListHeader : null}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            ListEmptyComponent={AnimatedEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
              />
            }
          />
        )}
      </View>
    </LinearGradient>
  );
};

const ListHeader = () => (
  <View style={styles.listHeader}>
    <YogaGuideCategories />
    <View style={styles.featuredHeader}>
      <Text style={styles.sectionTitle}>All Yoga Guides</Text>
      <Text style={styles.sectionSubtitle}>
        Explore our comprehensive collection of yoga guides.
      </Text>
    </View>
  </View>
);

const YogaGuideCategories = React.memo(() => {
  const navigation = useNavigation();
  return (
    <View style={styles.categoriesSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Suggested Styles</Text>
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => navigation.navigate('All_Yoga_Categories')}
        >
          <Text style={styles.seeAllText}>Explore All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catScroll}
      >
        {YOGA_CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={styles.catCard}
            onPress={() =>
              navigation.navigate('Yoga_Category', { typeFilter: cat.key })
            }
          >
            <View
              style={[styles.catIconBox, { backgroundColor: cat.color + '15' }]}
            >
              <MaterialCommunityIcons
                name={cat.icon}
                size={28}
                color={cat.color}
              />
            </View>
            <Text style={styles.catLabel}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

export default YogaGuide;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  headerContainer: {
    zIndex: 10,
  },

  mainContent: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -20,
    overflow: 'hidden',
  },

  scrollContent: {
    paddingTop: theme.spacing(4),
    paddingBottom: height * 0.12,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: theme.spacing(2),
    fontFamily: theme.typography.medium,
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.sm,
  },

  categoriesSection: {
    marginBottom: theme.spacing(3),
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },

  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.bold,
    color: theme.colors.primary,
  },

  sectionSubtitle: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.medium,
    color: theme.colors.gray,
    marginTop: 2,
  },

  seeAllText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.bold,
    color: theme.colors.secondary,
  },

  catScroll: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(1),
  },

  catCard: {
    alignItems: 'center',
    marginRight: theme.spacing(3),
  },

  catIconBox: {
    width: 65,
    height: 65,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  catLabel: {
    fontSize: 14,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.dark,
  },

  featuredHeader: {
    paddingHorizontal: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },

  guideCardContainer: {
    paddingHorizontal: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },

  guideCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 30,
    overflow: 'hidden',
    ...theme.elevation.depth2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },

  imageWrapper: {
    height: height * 0.22,
    width: '100%',
    position: 'relative',
  },

  guideImage: {
    width: '100%',
    height: '100%',
  },

  floatingBadges: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  glassBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },

  badgeText: {
    color: theme.colors.white,
    fontSize: 12,
    fontFamily: theme.typography.bold,
    textTransform: 'uppercase',
  },

  cardContent: {
    padding: theme.spacing(2.5),
  },

  guideTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.bold,
    color: theme.colors.primary,
    marginBottom: height * 0.01,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  metaText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.secondary,
    marginLeft: width * 0.01,
  },

  metaSeparator: {
    borderRadius: 2,
    backgroundColor: theme.colors.gray,
    marginHorizontal: width * 0.02,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: height * 0.15,
    paddingHorizontal: theme.spacing(6),
  },

  emptyTitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.black,
    color: theme.colors.primary,
    marginTop: theme.spacing(3),
  },

  emptySubtitle: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.medium,
    color: theme.colors.gray,
    textAlign: 'center',
    marginTop: height * 0.01,
    lineHeight: 22,
  },
});
