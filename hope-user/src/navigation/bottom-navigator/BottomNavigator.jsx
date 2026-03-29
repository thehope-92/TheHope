/**
 * @file BottomNavigator.js
 * @description A highly customized, animated bottom tab navigation component
 * featuring spring-based scale transitions and floating visual aesthetics.
 * * @module navigation/BottomNavigator
 * @requires react
 * @requires react-native
 * @requires @react-navigation/bottom-tabs
 * @requires react-native-animatable
 */

import React, { useEffect, useRef } from 'react';
import { Image, StyleSheet, Dimensions, Animated, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { theme } from '../../styles/Themes';
import Home from '../../screens/dashboard/Main';
import Profile from '../../screens/profile-screen/Profile';
import MyMood from '../../screens/mood-tracker-screen/Moods/MyMood';
import Articles from '../../screens/articles-screen/articles/Articles';
import Yoga from '../../screens/yoga-guide-screen/yoga-guide/YogaGuide';
import Habit from '../../screens/habit-screen/habits/Habit';

const Tab = createBottomTabNavigator();
const { width, height } = Dimensions.get('window');

const iconMap = {
  Home: {
    active: require('../../assets/navigatorIcons/home-filled.png'),
    inactive: require('../../assets/navigatorIcons/home.png'),
  },
  Articles: {
    active: require('../../assets/navigatorIcons/article-filled.png'),
    inactive: require('../../assets/navigatorIcons/article.png'),
  },
  Habits: {
    active: require('../../assets/navigatorIcons/habit-filled.png'),
    inactive: require('../../assets/navigatorIcons/habit.png'),
  },
  MoodTracker: {
    active: require('../../assets/navigatorIcons/mood-filled.png'),
    inactive: require('../../assets/navigatorIcons/mood.png'),
  },
  YogaGuide: {
    active: require('../../assets/navigatorIcons/yoga-filled.png'),
    inactive: require('../../assets/navigatorIcons/yoga.png'),
  },
  Profile: {
    active: require('../../assets/navigatorIcons/profile-filled.png'),
    inactive: require('../../assets/navigatorIcons/profile.png'),
  },
};

const AnimatedTabIcon = ({ focused, source }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: focused ? 1.15 : 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <Image
        source={source}
        style={[
          styles.image,
          { tintColor: focused ? theme.colors.primary : theme.colors.gray },
        ]}
      />
    </Animated.View>
  );
};

const BottomNavigator = () => {
  const screens = [
    { name: 'Main', component: Home, label: 'Home', iconKey: 'Home' },
    { name: 'Habits', component: Habit, label: 'Habits', iconKey: 'Habits' },
    { name: 'Articles', component: Articles, label: 'Articles', iconKey: 'Articles' },
    { name: 'MoodTracker', component: MyMood, label: 'Mood', iconKey: 'MoodTracker' },
    { name: 'YogaGuide', component: Yoga, label: 'Yoga', iconKey: 'YogaGuide' },
    { name: 'Profile', component: Profile, label: 'Profile', iconKey: 'Profile' },
  ];

  return (
    <Tab.Navigator
      initialRouteName="Main"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.gray,
        tabBarHideOnKeyboard: true,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      {screens.map((item) => (
        <Tab.Screen
          key={item.name}
          name={item.name}
          component={item.component}
          options={{
            tabBarLabel: item.label,
            tabBarShowLabel: true,
            tabBarIcon: ({ focused }) => (
              <AnimatedTabIcon
                focused={focused}
                source={focused ? iconMap[item.iconKey].active : iconMap[item.iconKey].inactive}
              />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default BottomNavigator;

const styles = StyleSheet.create({
  tabBar: {
    height: height * 0.085,
    backgroundColor: theme.colors.white,
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingBottom: height * 0.015,
    paddingTop: height * 0.01,
  },
  
  tabBarLabel: {
    fontSize: 10,
    fontFamily: theme.typography.bold,
    marginTop: -2,
  },

  image: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});