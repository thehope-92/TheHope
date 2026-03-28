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
      </Stack.Navigator>
    </>
  );
};

export default AppNavigator;
