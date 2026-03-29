/**
 * @file AllCategories.jsx
 * @module Screens/AllCategories
 * @description
 * Vibrant and cheerful All Categories screen with colorful cards, unique icons, modern design, search functionality and animated empty state.
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../styles/Themes';
import Header from '../../../utilities/custom-components/header/header/Header';

const { width, height } = Dimensions.get('window');

const {
  LIBRARY_CATEGORIES,
} = require('../../../constants/categories/categories');

const categoryConfig = {
  STRESS: { icon: 'brain', color: '#FF6B6B' },
  ANXIETY: { icon: 'lightning-bolt', color: '#4ECDC4' },
  DEPRESSION: { icon: 'cloud', color: '#A78BFA' },
  BIPOLAR_DISORDER: { icon: 'thermostat', color: '#FF9F1C' },
  PTSD: { icon: 'shield-alert', color: '#2EC4B6' },
  OCD: { icon: 'recycle', color: '#FF6B9D' },
  EATING_DISORDERS: { icon: 'food-apple', color: '#F7A072' },

  SELF_CARE: { icon: 'hand-heart', color: '#6EE7B7' },
  SLEEP_HYGIENE: { icon: 'moon-waning-crescent', color: '#7B8CF7' },
  MINDFULNESS: { icon: 'flower-tulip', color: '#9ED37E' },
  MEDITATION: { icon: 'meditation', color: '#FFB84D' },
  NUTRITION: { icon: 'carrot', color: '#FF8C42' },
  EXERCISE: { icon: 'dumbbell', color: '#FF4E6E' },

  EMOTIONAL_REGULATION: { icon: 'emoticon-happy-outline', color: '#45B8AC' },
  RELATIONSHIPS: { icon: 'account-multiple', color: '#FF6B9D' },
  SOCIAL_ANXIETY: { icon: 'account-group', color: '#A78BFA' },
  SELF_ESTEEM: { icon: 'star-outline', color: '#FFD93D' },
  GRIEF_AND_LOSS: { icon: 'heart-broken', color: '#FF8A80' },
  ANGER_MANAGEMENT: { icon: 'fire', color: '#FF6B6B' },

  WORK_LIFE_BALANCE: { icon: 'scale-balance', color: '#4ECDC4' },
  BURNOUT: { icon: 'battery-alert', color: '#FF9F1C' },
  TIME_MANAGEMENT: { icon: 'clock-time-eight', color: '#45B8AC' },
  ACADEMIC_PRESSURE: { icon: 'book-open-variant', color: '#9ED37E' },

  RESILIENCE: { icon: 'shield-check', color: '#6EE7B7' },
  MOTIVATION: { icon: 'rocket-launch', color: '#FF8C42' },
  HABIT_BUILDING: { icon: 'checkbox-marked-circle', color: '#FFB84D' },
  COGNITIVE_REFRAMING: { icon: 'thought-bubble', color: '#A78BFA' },
};

const allCategories = Object.entries(LIBRARY_CATEGORIES).flatMap(
  ([group, cats]) =>
    cats.map(cat => ({
      key: cat,
      name: cat
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' '),
      ...categoryConfig[cat],
    })),
);

const AnimatedEmptyState = () => {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 2500,
            useNativeDriver: true,
          }),
        ]),
      ),
    ]).start();
  }, []);

  return (
    <View style={styles.emptyContainer}>
      <Animated.View
        style={{
          transform: [
            { scale: scaleAnim },
            {
              rotate: rotateAnim.interpolate({
                inputRange: [-1, 1],
                outputRange: ['-12deg', '12deg'],
              }),
            },
          ],
          opacity: opacityAnim,
        }}
      >
        <MaterialCommunityIcons
          name="magnify"
          size={width * 0.32}
          color={theme.colors.secondary}
        />
      </Animated.View>

      <Text style={styles.emptyTitle}>No Categories Found</Text>
      <Text style={styles.emptySubtitle}>
        We couldn't find any categories matching your search
      </Text>
    </View>
  );
};

const AllCategories = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return allCategories;

    const query = searchQuery.toLowerCase().trim();

    return allCategories.filter(cat => cat.name.toLowerCase().includes(query));
  }, [searchQuery]);

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate('Article_Category', { categoryFilter: item.key })
      }
    >
      <View
        style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}
      >
        <MaterialCommunityIcons name={item.icon} size={38} color={item.color} />
      </View>
      <Text style={styles.categoryName} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
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
      <View style={styles.headerContainer}>
        <Header
          showTopRow={false}
          showLogo={true}
          showAvatar={false}
          showGreeting={false}
          showTitle={true}
          title={'Categories'}
          logo={require('../../../assets/logo/logo.png')}
          placeholder={'Search Categories...'}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </View>

      <View style={styles.content}>
        <FlatList
          data={filteredCategories}
          keyExtractor={item => item.key}
          renderItem={renderCategoryItem}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          ListEmptyComponent={AnimatedEmptyState}
        />
      </View>
    </LinearGradient>
  );
};

export default AllCategories;

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
    paddingTop: theme.spacing(3),
  },

  listContent: {
    paddingHorizontal: theme.spacing(2.5),
    paddingBottom: theme.spacing(6),
  },

  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: theme.spacing(3),
  },

  categoryCard: {
    width: (width - 40) / 2 - theme.spacing(1.5),
    paddingVertical: theme.spacing(4.5),
    alignItems: 'center',
  },

  iconContainer: {
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: theme.borderRadius.circle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },

  categoryName: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.dark,
    textAlign: 'center',
    paddingHorizontal: theme.spacing(2),
    lineHeight: 23,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: height * 0.18,
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
