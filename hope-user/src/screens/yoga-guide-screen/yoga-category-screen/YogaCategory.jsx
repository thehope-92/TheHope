/**
 * @file YogaCategory.jsx
 * @module Screens/YogaCategory
 * @description
 * Dedicated screen to display all yoga guides of a specific category.
 * Cards are styled identically to the main YogaGuide screen.
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
import { getAllYogaGuides } from '../../../redux/slices/yoga.slice';

const { width, height } = Dimensions.get('window');

// Helper for formatting badge text
const formatTypeBadge = typeStr => {
  if (!typeStr) return 'Yoga';
  return typeStr
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

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
          name="yoga"
          size={width * 0.35}
          color={theme.colors.secondary}
        />
      </Animated.View>
      <Text style={styles.emptyTitle}>No Yoga Guides Found</Text>
      <Text style={styles.emptySubtitle}>
        We couldn't find any yoga guides in this category right now.
      </Text>
    </View>
  );
};

const YogaCategory = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const { typeFilter } = route.params || {};
  const { allGuides, loading } = useSelector(state => state.yoga);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor(theme.colors.primary);
    dispatch(getAllYogaGuides());
  }, [dispatch]);

  const filteredYogaGuides = useMemo(() => {
    let yogaGuides = allGuides || [];
    if (typeFilter) {
      yogaGuides = yogaGuides.filter(item => item.category === typeFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      yogaGuides = yogaGuides.filter(
        item =>
          item.title?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query),
      );
    }
    return yogaGuides;
  }, [allGuides, typeFilter, searchQuery]);

  const categoryName = typeFilter
    ? typeFilter
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    : 'Yoga Guides';

  const renderYogaGuideItem = ({ item }) => {
    const imageUrl =
      item.coverImage || 'https://via.placeholder.com/600x400.png?text=Yoga';

    return (
      <View style={styles.guideCardContainer}>
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
      </View>
    );
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primary, '#1e4b82']}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <Header
          showTopRow={false}
          showLogo={true}
          logo={require('../../../assets/logo/logo.png')}
          showAvatar={false}
          showGreeting={false}
          showTitle={true}
          title={categoryName}
          placeholder={`Search in ${categoryName}...`}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showBackButton={true}
        />
      </View>

      <View style={styles.content}>
        {loading && filteredYogaGuides.length === 0 ? (
          <View style={styles.centerLoader}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredYogaGuides}
            keyExtractor={item => item._id}
            renderItem={renderYogaGuideItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            ListEmptyComponent={AnimatedEmptyState}
          />
        )}
      </View>
    </LinearGradient>
  );
};

export default YogaCategory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  headerContainer: {
    zIndex: 10,
    paddingTop: height * 0.01,
  },

  content: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: width * 0.09,
    borderTopRightRadius: width * 0.09,
    marginTop: -(height * 0.025),
    overflow: 'hidden',
  },

  flatListContent: {
    paddingTop: theme.spacing(4),
    paddingBottom: height * 0.1,
  },

  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  guideCardContainer: {
    paddingHorizontal: width * 0.025,
    marginBottom: height * 0.025,
  },

  guideCard: {
    backgroundColor: theme.colors.white,
    borderRadius: width * 0.08,
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
    top: height * 0.018,
    left: width * 0.04,
    right: width * 0.04,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  glassBadge: {
    paddingHorizontal: width * 0.035,
    paddingVertical: height * 0.007,
    borderRadius: width * 0.03,
  },

  badgeText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
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
    marginBottom: height * 0.008,
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
    marginLeft: width * 0.015,
  },

  metaSeparator: {
    width: width * 0.012,
    height: width * 0.012,
    borderRadius: (width * 0.012) / 2,
    backgroundColor: theme.colors.gray,
    marginHorizontal: width * 0.025,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: height * 0.15,
    paddingHorizontal: width * 0.1,
  },

  emptyTitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.bold,
    color: theme.colors.primary,
    marginTop: theme.spacing(3),
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.medium,
    color: theme.colors.gray,
    textAlign: 'center',
    marginTop: height * 0.01,
    lineHeight: theme.typography.fontSize.sm * 1.5,
  },
});
