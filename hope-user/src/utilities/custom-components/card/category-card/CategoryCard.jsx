/**
 * @component CategoryCard
 * @description A high-performance, animated card component used to display product categories.
 * * Responsibilities:
 * - Displays category imagery with a fallback shimmer/placeholder system.
 * - Handles mount-in spring animations and touch-feedback scaling.
 * - Provides visual density through itemCount badges and overlays.
 * * @param {Object} props
 * @param {string} props.title - The display name of the category.
 * @param {string} [props.imageUrl] - The remote URI for the category cover image.
 * @param {Function} props.onPress - Callback function triggered when the card is tapped.
 * @param {number} [props.itemCount=0] - The total number of products available in this category.
 * * @returns {React.JSX.Element}
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../../../styles/Themes';

const { width, height } = Dimensions.get('window');

const CategoryCard = ({ title, imageUrl, onPress, itemCount }) => {
  const mountScale = useRef(new Animated.Value(0.9)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(mountScale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1100,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const combinedScale = Animated.multiply(mountScale, pressScale);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const shimmerTranslate = shimmer.interpolate({
    inputRange: [-1, 1],
    outputRange: [-width * 0.5, width * 0.5],
  });

  const hasImage = Boolean(imageUrl);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.card,
          {
            opacity: opacityAnim,
            transform: [{ scale: combinedScale }],
          },
        ]}
      >
        <View
          style={[
            styles.imageWrap,
            hasImage ? styles.imageWrapWithImage : styles.imageWrapNoImage,
          ]}
        >
          {hasImage ? (
            <Image source={{ uri: imageUrl }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <MaterialCommunityIcons
                name="apps"
                size={36}
                color={theme.colors.gray}
              />
              <Animated.View
                style={[
                  styles.shimmer,
                  { transform: [{ translateX: shimmerTranslate }] },
                ]}
              />
            </View>
          )}

          <View style={styles.topRow}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color={theme.colors.white}
              />
            </View>
          </View>

          <View
            style={[
              styles.overlay,
              hasImage ? styles.overlayDark : styles.overlayLight,
            ]}
          >
            <Text
              style={[
                styles.title,
                hasImage ? styles.titleLight : styles.titleDark,
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              style={[
                styles.subtitle,
                hasImage ? styles.titleLight : styles.titleDark,
              ]}
              numberOfLines={1}
            >
              {itemCount ?? 0} Products
            </Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default CategoryCard;

const styles = StyleSheet.create({
  container: {
    width: width * 0.44,
    marginHorizontal: width * 0.02,
    marginBottom: height * 0.02,
  },

  card: {
    borderRadius: theme.borderRadius.large,
    backgroundColor: theme.colors.white,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },

  inner: {
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
  },

  imageWrap: {
    width: '100%',
    aspectRatio: 0.85,
    position: 'relative',
    justifyContent: 'flex-end',
  },

  imageWrapWithImage: {
    backgroundColor: theme.colors.white,
  },

  imageWrapNoImage: {
    backgroundColor: theme.colors.gray,
    alignItems: 'center',
    justifyContent: 'center',
    padding: height * 0.01,
  },

  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: width * 0.9,
    backgroundColor: 'rgba(255,255,255,0.6)',
    opacity: 0.6,
    transform: [{ translateX: -100 }],
    borderRadius: 8,
  },

  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: height * 0.014,
    paddingHorizontal: width * 0.04,
    flexDirection: 'column',
    justifyContent: 'center',
  },

  overlayDark: {
    backgroundColor: 'rgba(0,0,0,0.36)',
  },

  overlayLight: {
    backgroundColor: 'rgba(255,255,255,0.92)',
  },

  title: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.semiBold,
    textTransform: 'capitalize',
  },

  subtitle: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.light,
    textTransform: 'capitalize',
  },

  titleLight: {
    color: theme.colors.white,
  },

  titleDark: {
    color: theme.colors.dark,
  },

  topRow: {
    position: 'absolute',
    top: height * 0.01,
    left: width * 0.02,
    right: width * 0.02,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  iconCircle: {
    width: width * 0.076,
    height: height * 0.038,
    borderRadius: theme.borderRadius.circle,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.circle,
    minWidth: width * 0.09,
    elevation: 2,
  },

  badgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.bold,
    color: theme.colors.dark,
    textAlign: 'center',
  },

  badgeSub: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.light,
    color: theme.colors.dark,
    textAlign: 'center',
  },
});
