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
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../../../styles/Themes';
import InputField from '../../input-field/InputField.utility';

const { width, height } = Dimensions.get('window');

const Header = ({
  userName = '',
  userAvatar,
  searchQuery,
  setSearchQuery,
  showSearch = true, // Default to true
  showTopRow = true, // Default to true for Date/Emoji
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      {/* Conditional Top Section */}
      {showTopRow && (
        <View style={styles.topRow}>
          <View style={styles.dateContainer}>
            <Text style={styles.emoji}>👑</Text>
            <Text style={styles.dateText}>{currentDate}</Text>
          </View>
        </View>
      )}

      {/* Greeting + Avatar */}
      <View style={styles.greetingRow}>
        <Image
          source={
            userAvatar && userAvatar.length > 0
              ? { uri: userAvatar }
              : require('../../../../assets/placeHolder/placeholder.png')
          }
          style={styles.avatar}
        />

        <View style={styles.greetingTextContainer}>
          <Text style={styles.greeting}>
            Hi, <Text style={styles.name}>{userName}</Text>!
          </Text>
        </View>
      </View>

      {/* Conditional Search Bar */}
      {showSearch && (
        <View style={styles.searchWrapper}>
          <InputField
            placeholder="Search anything..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.inputCustomStyle}
            leftIcon={
              <MaterialCommunityIcons
                name="magnify"
                size={22}
                color={theme.colors.primary}
              />
            }
          />
        </View>
      )}
    </Animated.View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: theme.colors.primary,
    paddingTop: height * 0.06,
    paddingHorizontal: width * 0.06,
    paddingBottom: height * 0.02,
    borderBottomLeftRadius: theme.borderRadius.circle,
    borderBottomRightRadius: theme.borderRadius.circle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(1),
  },

  emoji: {
    fontSize: theme.typography.fontSize.sm,
  },

  dateText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.medium,
    color: theme.colors.white,
  },

  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.01,
    marginTop: height * 0.01,
  },

  avatar: {
    width: width * 0.14,
    height: width * 0.14,
    borderRadius: width * 0.07,
    borderWidth: 3,
    borderColor: '#E8D5B8',
  },

  greetingTextContainer: {
    marginLeft: width * 0.04,
  },

  greeting: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.white,
    lineHeight: 32,
  },

  name: {
    color: '#F5BE40',
  },

  inputCustomStyle: {
    backgroundColor: theme.colors.white,
    height: height * 0.06,
  },
});
