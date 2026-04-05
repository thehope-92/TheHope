/**
 * @file Splash.jsx
 * @module Components/Splash
 * @description
 * Ultra-Serene Cinematic Splash Screen for Mental Health & Wellness.
 *
 * Delivers a grounding and immersive launch experience with:
 * - Soft, multi-layer animated gradient background (Dawn/Dusk aesthetic)
 * - "Breathing" atmospheric orbs synchronized to an inhale/exhale rhythm
 * - Mindful logo entrance (slow fade, gentle scale, grounding upward drift)
 * - Continuous Zen floating idle animation
 * - Staggered typography reveal delivering a calming affirmation
 * - Seamless authentication routing transition
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Dimensions,
  Text,
  TextInput,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import {
  getStealthStatus,
  verifyStealthPIN,
} from '../../redux/slices/user.slice';
import Modal from '../../utilities/custom-components/modal/Modal.utility';
import Button from '../../utilities/custom-components/button/Button.utility';

import { theme } from '../../styles/Themes';

const { width, height } = Dimensions.get('screen');

const Splash = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [verifying, setVerifying] = useState(false);
  const pinRefs = useRef([]);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('transparent');
    StatusBar.setTranslucent(true);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 3500));
        const token = await AsyncStorage.getItem('authToken');

        if (token) {
          // 1. Check Stealth Status
          const statusResult = await dispatch(getStealthStatus()).unwrap();

          if (statusResult?.data?.isStealthModeEnabled) {
            // 🔒 STOP! Main par mat jao, modal dikhao Splash ke upar hi
            setShowPinModal(true);
          } else {
            // ✅ Normal Flow: No Stealth
            goToMain();
          }
        } else {
          navigation.replace('OnBoard');
        }
      } catch (error) {
        navigation.replace('OnBoard');
      }
    };
    checkSession();
  }, []);

  const goToMain = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const handleVerifyPin = async () => {
    setVerifying(true);
    try {
      await dispatch(verifyStealthPIN(pin)).unwrap();
      setShowPinModal(false);
      goToMain();
    } catch (err) {
      setShowPinModal(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Decoy' }],
      });
    } finally {
      setVerifying(false);
    }
  };

  const renderPinInput = () => {
    return (
      <View style={styles.pinContainer}>
        <Text style={[styles.pinTitle, { color: theme.colors.white }]}>
          Security Check
        </Text>
        <Text style={styles.pinSubtitle}>
          Please enter your 4-digit Stealth PIN to continue
        </Text>

        <View style={styles.pinWrapper}>
          {[0, 1, 2, 3].map(index => (
            <View key={index} style={styles.pinBoxContainer}>
              <TextInput
                ref={ref => (pinRefs.current[index] = ref)}
                style={styles.pinBoxInput}
                keyboardType="number-pad"
                maxLength={1}
                secureTextEntry={true}
                value={pin[index] || ''}
                placeholderTextColor="#555"
                selectionColor={theme.colors.primary}
                onChangeText={text => {
                  const newPin = pin.split('');
                  newPin[index] = text;
                  setPin(newPin.join('').replace(/[^0-9]/g, ''));
                  if (text && index < 3) {
                    pinRefs.current[index + 1]?.focus();
                  }
                }}
                onKeyPress={e => {
                  if (
                    e.nativeEvent.key === 'Backspace' &&
                    !pin[index] &&
                    index > 0
                  ) {
                    pinRefs.current[index - 1]?.focus();
                  }
                }}
              />
            </View>
          ))}
        </View>

        <Button
          title="Unlock Access"
          onPress={handleVerifyPin}
          loading={verifying}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
          disabled={pin.length !== 4}
          width="100%"
        />
      </View>
    );
  };

  Animatable.initializeRegistryWithDefinitions({
    mindfulRise: {
      from: {
        opacity: 0,
        scale: 0.9,
        translateY: 40,
      },
      to: {
        opacity: 1,
        scale: 1,
        translateY: 0,
      },
    },
    deepBreathe: {
      0: { opacity: 0.15, scale: 1 },
      0.5: { opacity: 0.4, scale: 1.25 },
      1: { opacity: 0.15, scale: 1 },
    },
    gentleFloat: {
      0: { translateY: 0 },
      0.5: { translateY: -8 },
      1: { translateY: 0 },
    },
    textReveal: {
      from: { opacity: 0, letterSpacing: 0, translateY: 10 },
      to: { opacity: 0.9, letterSpacing: 3, translateY: 0 },
    },
  });

  return (
    <View style={styles.container}>
      {/* 1. Serene Background Gradient */}
      <Animatable.View
        animation="fadeIn"
        duration={3000}
        style={StyleSheet.absoluteFill}
      >
        <LinearGradient
          colors={[theme.colors.primary, '#1E293B', theme.colors.secondary]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animatable.View>

      {/* 2. Atmospheric "Breathing" Orbs */}
      <Animatable.View
        animation="deepBreathe"
        iterationCount="infinite"
        duration={8000}
        easing="ease-in-out"
        style={[styles.glowOrb, styles.orbTopLeft]}
      />
      <Animatable.View
        animation="deepBreathe"
        iterationCount="infinite"
        duration={10000}
        delay={1500}
        easing="ease-in-out"
        style={[styles.glowOrb, styles.orbBottomRight]}
      />
      <Animatable.View
        animation="deepBreathe"
        iterationCount="infinite"
        duration={12000}
        delay={3000}
        easing="ease-in-out"
        style={[styles.glowOrb, styles.orbCenter]}
      />

      {/* 3. Main Content (Logo & Typography) */}
      <View style={styles.content}>
        {/* Floating Logo Container */}
        <Animatable.View
          animation="gentleFloat"
          iterationCount="infinite"
          duration={6000}
          easing="ease-in-out"
        >
          <Animatable.View
            animation="mindfulRise"
            duration={2500}
            easing="ease-out-quint"
            style={styles.logoContainer}
          >
            <Animatable.Image
              animation="fadeIn"
              delay={500}
              duration={2000}
              source={require('../../assets/logo/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animatable.View>
        </Animatable.View>

        {/* 4. Calming Tagline / Affirmation */}
        <Animatable.Text
          animation="textReveal"
          delay={1800}
          duration={2000}
          style={styles.tagline}
        >
          FIND YOUR PEACE
        </Animatable.Text>
      </View>

      <Modal
        isOpen={showPinModal} // 'isOpen' use karein agar Profile wala Modal utility yahi mangta hai
        isVisible={showPinModal} // Dono rakh dein safety ke liye
        onClose={() => {}} // User band nahi kar sakta
        showCloseButton={false}
      >
        {renderPinInput()}
      </Modal>
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* Atmospheric Orbs */
  glowOrb: {
    position: 'absolute',
    borderRadius: 999,
  },

  orbTopLeft: {
    top: -height * 0.1,
    left: -width * 0.4,
    width: width * 1.5,
    height: width * 1.5,
    backgroundColor: '#FFFFFF10',
  },

  orbBottomRight: {
    bottom: -height * 0.2,
    right: -width * 0.3,
    width: width * 1.6,
    height: width * 1.6,
    backgroundColor: theme.colors.secondary
      ? `${theme.colors.secondary}20`
      : '#8B5CF620',
  },

  orbCenter: {
    top: height * 0.3,
    left: -width * 0.1,
    width: width * 1.2,
    height: width * 1.2,
    backgroundColor: theme.colors.primary
      ? `${theme.colors.primary}15`
      : '#14B8A615',
  },

  /* Content Layout */
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },

  logo: {
    width: width * 0.55,
    height: width * 0.55,
  },

  tagline: {
    position: 'absolute',
    bottom: height * 0.25,
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.medium,
    letterSpacing: 3,
    textTransform: 'uppercase',
    opacity: 0.9,
  },

  // ==================== PIN BOX STYLES (Add these) ====================

  pinContainer: {
    alignItems: 'center',
    paddingVertical: height * 0.02,
  },

  pinTitle: {
    fontFamily: theme.typography.bold,
    fontSize: theme.typography.fontSize.xl,
    marginBottom: height * 0.01,
    textAlign: 'center',
  },

  pinSubtitle: {
    fontFamily: theme.typography.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray || '#94A3B8',
    textAlign: 'center',
    marginBottom: height * 0.04,
    paddingHorizontal: width * 0.08,
  },

  pinWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: height * 0.06,
    paddingHorizontal: width * 0.02,
  },

  pinBoxContainer: {
    width: width * 0.16,
    height: width * 0.16,
    borderRadius: theme.borderRadius.large,
    backgroundColor: '#1E1E1E', // Dark background like profile
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  pinBoxInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 24, // Thora bara font
    fontFamily: theme.typography.bold,
    color: '#FFFFFF', // White text
  },
});
