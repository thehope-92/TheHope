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
  userName = '',
  userAvatar,
  title = '',
  logo,
  searchQuery,
  setSearchQuery,
  placeholder,
  showAvatar = true,
  showGreeting = true,
  showTitle = false,
  showLogo = false,
  showSearch = true,
  showTopRow = true,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
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
      {showTopRow && (
        <View style={styles.topRow}>
          <View style={styles.dateContainer}>
            <Text style={styles.emoji}>👑</Text>
            <Text style={styles.dateText}>{currentDate}</Text>
          </View>
        </View>
      )}

      {(showLogo || showTitle) && (
        <View style={styles.middleRow}>
          {showLogo && logo && (
            <Image
              source={logo}
              style={styles.logoStyle}
              resizeMode="contain"
            />
          )}
          {showTitle && title && (
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>
          )}
        </View>
      )}

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
                size={20}
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
    paddingTop: height * 0.05,
    paddingHorizontal: width * 0.06,
    paddingBottom: height * 0.025,
    borderBottomLeftRadius: width * 0.08,
    borderBottomRightRadius: width * 0.08,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
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
  },

  emoji: {
    fontSize: theme.typography.fontSize.md,
    marginRight: width * 0.015,
  },

  dateText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.medium,
    color: theme.colors.white,
    opacity: 0.9,
  },

  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.012,
  },

  logoStyle: {
    width: width * 0.12,
    height: width * 0.12,
    resizeMode: 'contain',
  },

  headerTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.white,
    marginLeft: width * 0.02,
    flexShrink: 1,
  },

  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.015,
  },

  avatar: {
    width: width * 0.11,
    height: width * 0.11,
    borderRadius: (width * 0.11) / 2,
    borderWidth: 2,
    borderColor: 'rgba(232, 213, 184, 0.8)',
  },

  greetingTextContainer: {
    marginLeft: width * 0.03,
  },

  greeting: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.white,
  },

  name: {
    color: theme.colors.secondary || '#F5BE40',
  },

  searchWrapper: {
    marginTop: height * 0.005,
  },

  inputCustomStyle: {
    backgroundColor: theme.colors.white,
    height: height * 0.055,
    borderRadius: theme.borderRadius.md || 12,
  },
});
