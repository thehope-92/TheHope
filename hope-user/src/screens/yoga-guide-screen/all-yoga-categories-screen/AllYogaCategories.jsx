/**
 * @file AllYogaCategories.jsx
 * @module Screens/AllYogaCategories
 * @description
 * Vibrant and cheerful All Yoga Categories screen with colorful cards, unique icons, modern design, search functionality and animated empty state.
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

const YOGA_CATEGORY_CONFIG = {
  HATHA: { name: 'Hatha', icon: 'yoga', color: '#81C784' },
  VINYASA: { name: 'Vinyasa', icon: 'waves', color: '#64B5F6' },
  ASHTANGA: { name: 'Ashtanga', icon: 'fire', color: '#FF7043' },
  YIN: { name: 'Yin', icon: 'moon-waning-crescent', color: '#9575CD' },
  RESTORATIVE: { name: 'Restorative', icon: 'leaf', color: '#4DB6AC' },
  POWER: { name: 'Power', icon: 'lightning-bolt', color: '#F06292' },
  KUNDALINI: { name: 'Kundalini', icon: 'om', color: '#FFD54F' },
  CHAIR_YOGA: { name: 'Chair Yoga', icon: 'chair-rolling', color: '#A1887F' },
  PRENATAL: { name: 'Prenatal', icon: 'baby-carriage', color: '#F48FB1' },
};

const yogaCategoriesData = Object.entries(YOGA_CATEGORY_CONFIG).map(
  ([key, value]) => ({
    key,
    ...value,
  }),
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

const AllYogaCategories = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return yogaCategoriesData;

    const query = searchQuery.toLowerCase().trim();

    return yogaCategoriesData.filter(cat =>
      cat.name.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate('Yoga_Category', { typeFilter: item.key })
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

export default AllYogaCategories;

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
