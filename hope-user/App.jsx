/**
 * @file App.js
 * @module App
 * @description
 * Root entry point of the React Native application.
 *
 * Serves as the top-level component responsible for:
 * - Mounting the primary navigation structure via {@link RootNavigator}
 * - Initializing the global toast notification system with custom styling
 * - Setting up Notifee for push notifications (habit reminders)
 */

import React, { useEffect } from 'react';
import { Dimensions } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import Toast, { BaseToast } from 'react-native-toast-message';
import { theme } from './src/styles/Themes';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import notifee, { AndroidImportance } from '@notifee/react-native';

const { width, height } = Dimensions.get('window');

const CustomToast = type => props => {
  const isSuccess = type === 'success';
  const color = isSuccess ? theme.colors.success : theme.colors.error;
  const iconName = isSuccess ? 'check-circle' : 'alert-circle';

  return (
    <BaseToast
      {...props}
      style={{
        borderLeftWidth: width * 0.03,
        borderLeftColor: color,
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.large,
        padding: width * 0.02,
        width: width * 0.9,
        marginTop: height * 0.016,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
      }}
      contentContainerStyle={{
        flex: 1,
        paddingLeft: width * 0.02,
      }}
      text1Style={{
        fontSize: width * 0.045,
        fontFamily: theme.typography.semiBold,
        color,
        marginBottom: 0,
      }}
      text2Style={{
        fontSize: width * 0.038,
        fontFamily: theme.typography.semiBold,
        color: theme.colors.dark,
      }}
      text1NumberOfLines={3}
      text2NumberOfLines={5}
      renderLeadingIcon={() => (
        <MaterialCommunityIcons
          name={iconName}
          size={width * 0.07}
          color={color}
          style={{ marginRight: width * 0.02 }}
        />
      )}
    />
  );
};

const toastConfig = {
  success: CustomToast('success'),
  error: CustomToast('error'),
};

const App = () => {
  // Initialize Notifee notification channel on app start
  useEffect(() => {
    const setupNotifee = async () => {
      try {
        await notifee.createChannel({
          id: 'habit-reminders',
          name: 'Habit Reminders',
          description: 'Daily reminders for your habits',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
        });

        console.log('Notifee channel "habit-reminders" created successfully');
      } catch (error) {
        console.error('Failed to create Notifee channel:', error);
      }
    };

    setupNotifee();
  }, []);

  return (
    <>
      <RootNavigator />
      <Toast config={toastConfig} />
    </>
  );
};

export default App;
