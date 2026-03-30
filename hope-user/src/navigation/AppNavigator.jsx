/**
 * @file AppNavigator.jsx
 * @module Navigation/AppNavigator
 * @description
 * Root navigation configuration for the NiDrip Central application.
 * This navigator manages the top-level stack, including the splash sequence,
 * authentication flow, and the primary application entry points.
 *
 * Responsibilities:
 * - Orchestrates the main navigation hierarchy[cite: 1].
 * - Manages global StatusBar state with dynamic color updates[cite: 1].
 * - Implements consistent screen transitions and gesture navigation[cite: 1].
 *
 * Features:
 * - Dynamic StatusBar management[cite: 1].
 * - Smooth 'fade_from_bottom' animations[cite: 1].
 * - Centralized route definitions for Auth, Profile, and Main flows[cite: 1].
 */

import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../styles/Themes';

// --- Screen Imports ---
import Splash from '../screens/splash-screen/Splash';
import OnBoarding from '../screens/onboarding-screen/OnBoarding';

// --- Authentication Screens ---
import Signin from '../screens/auth/Signin/Signin';
import Signup from '../screens/auth/Signup/Signup';
import ForgotPassword from '../screens/auth/Forgot-Password/ForgotPassword';

// Main Application
import BottomNavigator from '../navigation/bottom-navigator/BottomNavigator';

//Profile & Sub-screens
import MyProfile from '../screens/profile-screen/sub-screens/MyProfile';
import About from '../screens/profile-screen/sub-screens/About';

// Mood Tracking Screens
import CreateMood from '../screens/mood-tracker-screen/CreateMood/CreateMood';

// Articles Screens
import AllCategories from '../screens/articles-screen/all-categories-screen/AllCategories';
import ArticleCategory from '../screens/articles-screen/article-category-screen/ArticleCategory';
import ArticleDetails from '../screens/articles-screen/article-detail-screen/ArticleDetails';

// Yoga Guide Screens
import AllYogaCategories from '../screens/yoga-guide-screen/all-yoga-categories-screen/AllYogaCategories';
import YogaCategory from '../screens/yoga-guide-screen/yoga-category-screen/YogaCategory';
import YogaDetail from '../screens/yoga-guide-screen/yoga-detail-screen/YogaDetail';

//Habit Screens
import CreateHabit from '../screens/habit-screen/create-habit/CreateHabit';
import UpdateHabit from '../screens/habit-screen/update-habit/UpdateHabit';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [statusBarColor, setStatusBarColor] = useState(theme.colors.primary);

  return (
    <>
      <StatusBar
        backgroundColor={statusBarColor}
        barStyle="dark-content"
        translucent={false}
      />

      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          gestureEnabled: true,
        }}
      >
        {/* --- ENTRY POINT --- */}
        <Stack.Screen name="Splash">
          {props => <Splash {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        <Stack.Screen name="OnBoard">
          {props => (
            <OnBoarding {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* --- AUTH --- */}
        <Stack.Screen name="Signin">
          {props => <Signin {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        <Stack.Screen name="Signup">
          {props => <Signup {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        <Stack.Screen name="Forgot_Password">
          {props => (
            <ForgotPassword {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* --- MAIN APPLICATION ENTRY --- */}
        <Stack.Screen name="Main">
          {props => (
            <BottomNavigator {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* --- PROFILE & SUBSCREENS --- */}
        <Stack.Screen name="My_Profile">
          {props => (
            <MyProfile {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="About_Us">
          {props => <About {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        {/* --- MOOD TRACKING SCREENS --- */}
        <Stack.Screen name="Create_Mood">
          {props => (
            <CreateMood {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* --- ARTICLES SCREENS --- */}
        <Stack.Screen name="All_Categories">
          {props => (
            <AllCategories {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Article_Category">
          {props => (
            <ArticleCategory {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Article_Detail">
          {props => (
            <ArticleDetails {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* --- YOGA GUIDE SCREENS --- */}
        <Stack.Screen name="All_Yoga_Categories">
          {props => (
            <AllYogaCategories
              {...props}
              setStatusBarColor={setStatusBarColor}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Yoga_Category">
          {props => (
            <YogaCategory {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Yoga_Detail">
          {props => (
            <YogaDetail {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* --- HABIT SCREENS --- */}
        <Stack.Screen name="Add_Habit">
          {props => (
            <CreateHabit {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Update_Habit">
          {props => (
            <UpdateHabit {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </>
  );
};

export default AppNavigator;
