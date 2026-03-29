/**
 * @file Header.js
 * @module Header
 * @description
 * A highly customizable and animated header component.
 * Allows developers to toggle Avatar, Greeting, Title, Logo, Search, and Top Row.
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
  // Data Props
  userName = '',
  userAvatar,
  title = '',
  logo, // Can be a require() or {uri: ''}
  searchQuery,
  setSearchQuery,
  placeholder,

  // Visibility Toggles
  showAvatar = true,
  showGreeting = true,
  showTitle = false,
  showLogo = false,
  showSearch = true,
  showTopRow = true,
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
      {/* 1. Top Section: Date/Emoji */}
      {showTopRow && (
        <View style={styles.topRow}>
          <View style={styles.dateContainer}>
            <Text style={styles.emoji}>👑</Text>
            <Text style={styles.dateText}>{currentDate}</Text>
          </View>
        </View>
      )}

      {/* 2. Middle Section: Logo or Title (Centered or Left-aligned based on Greeting) */}
      <View style={styles.middleRow}>
        {showLogo && logo && (
          <Image source={logo} style={styles.logoStyle} resizeMode="contain" />
        )}
        {showTitle && title && <Text style={styles.headerTitle}>{title}</Text>}
      </View>

      {/* 3. User Info Section: Avatar + Greeting */}
      {(showAvatar || showGreeting) && (
        <View style={styles.greetingRow}>
          {showAvatar && (
            <Image
              source={
                userAvatar && userAvatar.length > 0
                  ? { uri: userAvatar }
                  : require('../../../../assets/placeHolder/placeholder.png')
              }
              style={styles.avatar}
            />
          )}

          {showGreeting && (
            <View style={styles.greetingTextContainer}>
              <Text style={styles.greeting}>
                Hi, <Text style={styles.name}>{userName}</Text>!
              </Text>
            </View>
          )}
        </View>
      )}

      {/* 4. Bottom Section: Search Bar */}
      {showSearch && (
        <View style={styles.searchWrapper}>
          <InputField
            placeholder={placeholder}
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
    marginBottom: height * 0.01,
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(1),
  },

  dateText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.medium,
    color: theme.colors.white,
  },

  middleRow: {
    flexDirection: 'row',
    marginBottom: height * 0.01,
  },

  logoStyle: {
    width: width * 0.18,
    height: width * 0.18,
    resizeMode: 'contain',
  },

  headerTitle: {
    fontSize: theme.typography.fontSize.xxl,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.white,
    top: height * 0.02,
    left: width * 0.02,
  },

  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: height * 0.01,
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
  },

  name: {
    color: '#F5BE40',
  },

  searchWrapper: {
    marginTop: height * 0.01,
  },

  inputCustomStyle: {
    backgroundColor: theme.colors.white,
    height: height * 0.055,
  },
});
