/**
 * @file ChangeStealthPin.jsx
 * @module Screens/ChangeStealthPin
 * @description Screen for updating the Stealth Mode PIN with validation and secure input
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../styles/Themes';
import Header from '../../../utilities/custom-components/header/header/Header';
import Toast from 'react-native-toast-message';
import Loader from '../../../utilities/custom-components/loader/Loader.utility';
import { changeStealthPIN } from '../../../redux/slices/user.slice';
import Button from '../../../utilities/custom-components/button/Button.utility';
import InputField from '../../../utilities/custom-components/input-field/InputField.utility';
import { useDispatch } from 'react-redux';

const { width, height } = Dimensions.get('window');

const ChangeStealthPin = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleUpdatePin = async () => {
    if (!currentPin || !newPin) {
      return Toast.show({
        type: 'error',
        text1: 'Required',
        text2: 'Please fill all PIN fields',
      });
    }

    setLoading(true);

    try {
      const response = await dispatch(
        changeStealthPIN({
          oldPin: currentPin,
          newPin,
        }),
      ).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: response?.message || '',
      });

      setLoading(false);
      navigation.goBack();
    } catch (error) {
      setLoading(false);

      // 3. Console log yahan lagao taake error nazar aaye
      console.log('Stealth PIN Update Error:', error);

      Toast.show({
        type: 'error',
        text1: 'Failure',
        // Agar error object hai toh uske andar ka message dikhao
        text2: typeof error === 'string' ? error : error?.message || '',
      });
    }
  };

  const renderInput = (
    label,
    value,
    setValue,
    isVisible,
    toggleVisible,
    placeholder,
  ) => (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputContainer}>
        <InputField
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.secondary}
          keyboardType="numeric"
          maxLength={4}
          secureTextEntry={!isVisible}
          leftIcon={
            <MaterialCommunityIcons
              name={'lock-outline'}
              size={22}
              color={theme.colors.primary}
            />
          }
          rightIcon={
            <TouchableOpacity onPress={toggleVisible}>
              <MaterialCommunityIcons
                name={isVisible ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={theme.colors.dark}
              />
            </TouchableOpacity>
          }
        />
      </View>
    </View>
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
          showSearch={false}
          title="Change Pin"
          logo={require('../../../assets/logo/logo.png')}
        />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.infoSection}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons
                  name="shield-lock-outline"
                  size={40}
                  color={theme.colors.secondary}
                />
              </View>
              <Text style={styles.title}>Change Stealth PIN</Text>
              <Text style={styles.subtitle}>
                Update your security code to keep your wellness data private in
                Stealth Mode.
              </Text>
            </View>

            <View style={styles.formContainer}>
              {renderInput(
                'Current PIN',
                currentPin,
                setCurrentPin,
                showCurrent,
                () => setShowCurrent(!showCurrent),
                'Enter current pin',
              )}

              {renderInput(
                'New PIN',
                newPin,
                setNewPin,
                showNew,
                () => setShowNew(!showNew),
                'Enter new 4 digit pin',
              )}
            </View>

            <Button
              title="Update"
              onPress={handleUpdatePin}
              loading={loading}
              backgroundColor={theme.colors.primary}
              textColor={theme.colors.white}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </LinearGradient>
  );
};

export default ChangeStealthPin;

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
    borderTopLeftRadius: theme.borderRadius.circle,
    borderTopRightRadius: theme.borderRadius.circle,
    marginTop: -height * 0.02,
    overflow: 'hidden',
  },

  scrollContent: {
    paddingHorizontal: width * 0.07,
    paddingTop: height * 0.05,
    paddingBottom: height * 0.04,
  },

  infoSection: {
    alignItems: 'center',
    marginBottom: height * 0.04,
  },

  iconCircle: {
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: theme.borderRadius.circle,
    backgroundColor: '#FDF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.02,
    borderWidth: 2,
    borderColor: '#F3EFEA',
  },

  title: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.bold,
    color: theme.colors.dark,
    marginBottom: height * 0.02,
  },

  subtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: '#777',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: theme.typography.semiBold,
  },

  formContainer: {
    gap: theme.gap(2),
    marginBottom: height * 0.04,
  },

  inputWrapper: {
    width: '100%',
  },

  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.dark,
  },
});
