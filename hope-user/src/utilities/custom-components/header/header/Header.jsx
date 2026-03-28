/**
 * @file Header.js
 * @module Header
 * @description
 * A highly customizable and animated header component for React Native applications.
 * Features:
 * - Premium entrance animation (slide down spring + fade + subtle scale)
 * - Diagonal gradient background with themed colors
 * - Perfect centering using absolute positioning (unaffected by left/right content)
 * - Default back arrow on left if onPressLeft provided but no leftIcon
 * - Responsive sizing with larger title when no logo
 * - Support for image sources or custom React elements for icons
 * - Enhanced shadows and rounded bottom corners
 * @param {Object} props - Component props
 * @param {string} [props.title] - The text to display in the center
 * @param {number|Object} [props.logo] - Image source for the central logo
 * @param {number|Object|React.ReactElement} [props.leftIcon] - Left icon/element
 * @param {Function} [props.onPressLeft] - Callback for left press (triggers default back arrow if no leftIcon)
 * @param {number|Object|React.ReactElement} [props.rightIcon] - Right icon/element
 * @param {Function} [props.onPressRight] - Callback for right press
 * @returns {React.ReactElement} The rendered animated Header component
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../../../styles/Themes';

const { width, height } = Dimensions.get('window');

const Header = ({
  title,
  logo,
  leftIcon,
  onPressLeft,
  rightIcon,
  onPressRight,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const translateY = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const renderIcon = iconSource => {
    if (!iconSource) return null;
    if (React.isValidElement(iconSource)) return iconSource;
    return <Image source={iconSource} style={styles.icon} />;
  };

  const leftContent = leftIcon || (onPressLeft ? true : false);
  const rightContent = rightIcon;

  return (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { translateY }],
        },
      ]}
    >
      <LinearGradient
        colors={[
          theme.colors.primary,
          theme.colors.secondary || theme.colors.primary,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.leftGroup}>
          {logo && (
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          )}
          {title && (
            <Text style={[styles.title, !logo && styles.titleLarge]}>
              {title}
            </Text>
          )}
        </View>

        {rightContent && (
          <View style={styles.rightGroup}>
            <TouchableOpacity
              onPress={onPressRight}
              activeOpacity={0.8}
              disabled={!onPressRight}
            >
              {renderIcon(rightIcon)}
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    borderBottomLeftRadius: theme.borderRadius.xl || 28,
    borderBottomRightRadius: theme.borderRadius.xl || 28,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
  },

  gradientBackground: {
    position: 'relative',
    height: height * 0.1,
    paddingHorizontal: width * 0.06,
    alignItems: 'center',
  },

  rightGroup: {
    position: 'absolute',
    right: width * 0.06,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },

  leftGroup: {
    position: 'absolute',
    top: height * 0.026,
    bottom: 0,
    left: width * 0.04,
    justifyContent: 'center',
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: width * 0.03,
  },

  logo: {
    width: width * 0.22,
    height: width * 0.22,
    resizeMode: 'contain',
  },

  title: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.white,
    textAlign: 'center',
  },

  titleLarge: {
    fontSize: theme.typography.fontSize.xl,
  },

  icon: {
    width: width * 0.075,
    height: width * 0.075,
    tintColor: theme.colors.white,
    resizeMode: 'contain',
  },
});
