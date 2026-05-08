/**
 * @file Profile.jsx
 * @module Screens/Profile
 * @description
 * The primary user account management screen for the NiDrip Central application.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  StatusBar,
  Text,
  ScrollView,
  Linking,
  TouchableOpacity,
  Animated,
  TextInput,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../styles/Themes';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteAccount,
  getUser,
  setStealthPIN,
  enableStealthMode,
  disableStealthMode,
} from '../../redux/slices/user.slice';
import Header from '../../utilities/custom-components/header/header/Header';
import ProfileCard from '../../utilities/custom-components/card/profile-card/ProfileCard';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { logoutUser } from '../../redux/slices/auth.slice';
import Modal from '../../utilities/custom-components/modal/Modal.utility';
import Button from '../../utilities/custom-components/button/Button.utility';
import InputField from '../../utilities/custom-components/input-field/InputField.utility';

const { width, height } = Dimensions.get('window');

const Profile = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const user = useSelector(state => state.auth.user);
  const profile = useSelector(state => state.user.user);

  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [pin, setPin] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [stealthLoading, setStealthLoading] = useState(false);
  const isStealthModeEnabled = profile?.isStealthModeEnabled || false;
  const [isDisabling, setIsDisabling] = useState(false);

  const toggleAnim = useRef(new Animated.Value(0)).current;

  const pinRefs = useRef([]);

  // Fetch latest user data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        dispatch(getUser(user.id));
      }
    }, [dispatch, user]),
  );

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('transparent');
    StatusBar.setTranslucent(true);
  }, []);

  // Smooth toggle animation
  useEffect(() => {
    Animated.timing(toggleAnim, {
      toValue: isStealthModeEnabled ? 1 : 0,
      duration: 280,
      useNativeDriver: false,
    }).start();
  }, [isStealthModeEnabled]);

  const translateX = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [3, width * 0.072],
  });

  const trackColor = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#CBD5E1', '#22C55E'],
  });

  const handleProfileNavigate = () => {
    navigation.navigate('My_Profile', { user: profile });
  };

  const handleLogout = async () => {
    try {
      const resultAction = await dispatch(logoutUser());

      if (logoutUser.fulfilled.match(resultAction)) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: resultAction.payload?.message,
        });

        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Signin' }],
          });
        }, 2000);
      } else if (logoutUser.rejected.match(resultAction)) {
        Toast.show({
          type: 'error',
          text1: 'Failure',
          text2:
            resultAction.payload?.message ||
            'Something went wrong during logout.',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Unexpected Error',
        text2: err?.message || 'Something went wrong.',
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteReason.trim().length < 5) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Reason',
        text2: 'Please provide a reason (min 5 characters)',
      });
      return;
    }

    setLoading(true);
    try {
      const resultAction = await dispatch(
        deleteAccount({
          userId: profile?.id || profile?._id,
          reason: deleteReason,
        }),
      );

      if (deleteAccount.fulfilled.match(resultAction)) {
        setShowDeleteModal(false);
        Toast.show({
          type: 'success',
          text1: 'Account Deleted',
          text2: resultAction.payload?.message,
        });

        setTimeout(() => {
          navigation.reset({ index: 0, routes: [{ name: 'Signin' }] });
        }, 2000);
      } else if (deleteAccount.rejected.match(resultAction)) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: resultAction.payload?.message || 'Failed to delete account.',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Unexpected Error',
        text2: err?.message || 'Something went wrong.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStealthMode = () => {
    setPin('');
    // Agar Stealth enabled hai, toh hum disable mode (isDisabling = true) mein ja rahe hain
    setIsDisabling(isStealthModeEnabled);
    setShowPinModal(true);
  };

  const handlePinSubmit = async () => {
    if (pin.length !== 4) {
      Toast.show({
        type: 'error',
        text1: 'Invalid PIN',
        text2: 'Please enter a 4-digit PIN',
      });
      return;
    }

    setStealthLoading(true);
    try {
      const hasPinSet = !!profile?.stealth?.hasStealthPin;
      let response;

      if (isDisabling) {
        // CASE 1: Turn OFF
        response = await dispatch(disableStealthMode(pin)).unwrap();
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response?.message || '',
        });
      } else {
        // CASE 2 & 3: Turn ON or Set PIN
        if (hasPinSet) {
          response = await dispatch(enableStealthMode(pin)).unwrap();
        } else {
          response = await dispatch(setStealthPIN(pin)).unwrap();
        }

        setShowPinModal(false);
        setPin('');

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response?.message || '',
        });        

        return;
      }

      setShowPinModal(false);
      setPin('');
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Failure',
        text2: err?.message || '',
      });
    } finally {
      setStealthLoading(false);
    }
  };

  const renderPinInput = () => {
    const hasPinSet = !!profile?.stealth?.hasStealthPin;

    const title = isDisabling
      ? 'Disable Stealth Mode'
      : hasPinSet
      ? 'Enable Stealth Mode'
      : 'Set 4-Digit PIN';

    const subtitle = isDisabling
      ? 'Enter your PIN to turn off stealth mode'
      : hasPinSet
      ? 'Enter your existing PIN to enable'
      : 'Create a secure 4-digit PIN for privacy';

    const buttonText = isDisabling
      ? 'Disable Stealth Mode'
      : hasPinSet
      ? 'Enable Stealth Mode'
      : 'Activate Stealth Mode';

    const buttonColor = isDisabling ? '#F44336' : theme.colors.primary;

    return (
      <View style={styles.pinContainer}>
        <Text style={[styles.pinTitle, { color: theme.colors.white }]}>
          {title}
        </Text>
        <Text style={styles.pinSubtitle}>{subtitle}</Text>

        <View style={styles.pinWrapper}>
          {[0, 1, 2, 3].map(index => (
            <View key={index} style={styles.pinBoxContainer}>
              <TextInput
                ref={ref => (pinRefs.current[index] = ref)}
                style={styles.pinBoxInput}
                keyboardType="number-pad"
                maxLength={1}
                secureTextEntry={true} // PIN ko hide rakhne ke liye
                value={pin[index] || ''}
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
                selectionColor={theme.colors.primary}
              />
            </View>
          ))}
        </View>

        <Button
          title={buttonText}
          onPress={handlePinSubmit}
          loading={stealthLoading}
          backgroundColor={buttonColor}
          textColor={theme.colors.white}
          disabled={pin.length !== 4}
          width="100%"
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header
          userName={profile?.userName || 'User'}
          userAvatar={profile?.profilePicture}
          showSearch={false}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.menuGroup}>
          <ProfileCard
            title="My Profile"
            iconName="account-circle-outline"
            onPressFunction={handleProfileNavigate}
          />
        </View>

        <View style={styles.menuGroup}>
          <ProfileCard
            title="Support Center"
            iconName="headphones"
            onPressFunction={() => setShowSupportModal(true)}
          />
          <ProfileCard
            title="About Us"
            iconName="information-outline"
            navigationTarget={'About_Us'}
          />
        </View>

        <View style={styles.menuGroup}>
          {/* STEALTH MODE TOGGLE */}
          <View style={styles.stealthRow}>
            <View style={styles.stealthInfo}>
              <MaterialCommunityIcons
                name="incognito"
                size={28}
                color={isStealthModeEnabled ? theme.colors.primary : '#8E8E93'}
              />
              <View>
                <Text style={styles.stealthTitle}>Stealth Mode</Text>
                <Text style={styles.stealthDescription}>
                  {isStealthModeEnabled
                    ? 'App is hidden behind PIN'
                    : 'Protect your privacy'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleToggleStealthMode}
              disabled={stealthLoading}
              style={styles.toggleWrapper}
            >
              <Animated.View
                style={[styles.toggleTrack, { backgroundColor: trackColor }]}
              >
                <Animated.View
                  style={[styles.toggleKnob, { transform: [{ translateX }] }]}
                />
              </Animated.View>
            </TouchableOpacity>
          </View>

          <ProfileCard
            title="Change Pin"
            iconName="reload"
            navigationTarget={'Change_Pin'}
          />

          <ProfileCard
            title="Logout"
            iconName="logout-variant"
            onPressFunction={handleLogout}
          />

          <ProfileCard
            title="Delete Account"
            iconName="account-remove-outline"
            onPressFunction={() => setShowDeleteModal(true)}
          />
        </View>
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteReason('');
        }}
        title="Delete Account"
        showCloseButton={true}
      >
        <View style={styles.enhancedModalContent}>
          <View style={styles.warningIconWrapper}>
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={78}
              color="#F44336"
            />
          </View>

          <Text style={styles.modalTitle}>This is permanent.</Text>
          <Text style={styles.modalSubtitle}>
            Once you delete your account, all your data, progress, and history
            will be gone forever.
          </Text>
          <Text style={styles.modalDescription}>
            Please tell us why you’re leaving:
          </Text>

          <InputField
            style={styles.reasonInput}
            placeholder="Enter your reason here..."
            value={deleteReason}
            onChangeText={setDeleteReason}
            multiline
            numberOfLines={4}
          />

          <View style={styles.modalButtonsRow}>
            <Button
              title="Cancel"
              onPress={() => {
                setShowDeleteModal(false);
                setDeleteReason('');
              }}
              backgroundColor="#F4F5F7"
              textColor="#3E322A"
              width={width * 0.38}
            />

            <Button
              title="Delete"
              onPress={handleDeleteAccount}
              loading={loading}
              backgroundColor="#F44336"
              textColor={theme.colors.white}
              width={width * 0.38}
            />
          </View>
        </View>
      </Modal>

      {/* Support Center Modal */}
      <Modal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        showCloseButton={true}
      >
        <View style={styles.enhancedModalContent}>
          <View style={styles.supportIconWrapper}>
            <MaterialCommunityIcons
              name="headset"
              size={70}
              color={theme.colors.primary}
            />
          </View>

          <Text style={styles.supportTitle}>We’re here for you</Text>
          <Text style={styles.supportSubtitle}>
            At The Hope, your peace of mind matters most. Reach out anytime —
            we’re listening with care and compassion.
          </Text>

          <TouchableOpacity
            style={styles.contactCard}
            activeOpacity={0.85}
            onPress={() =>
              Linking.openURL('whatsapp://send?phone=+923090207411')
            }
          >
            <View
              style={[styles.contactIconBg, { backgroundColor: '#E8F5E9' }]}
            >
              <MaterialCommunityIcons
                name="whatsapp"
                size={34}
                color="#25D366"
              />
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactMethod}>Chat on WhatsApp</Text>
              <Text style={styles.contactDetail}>+92 309 020 7411</Text>
              <Text style={styles.responseTag}>Usually replies in minutes</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={26}
              color="#BDBDBD"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            activeOpacity={0.85}
            onPress={() =>
              Linking.openURL('mailto:support.thehope92@gmail.com')
            }
          >
            <View
              style={[styles.contactIconBg, { backgroundColor: '#E3F2FD' }]}
            >
              <MaterialCommunityIcons
                name="email-outline"
                size={34}
                color="#2196F3"
              />
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactMethod}>Send us an Email</Text>
              <Text style={styles.contactDetail}>
                support.thehope92@gmail.com
              </Text>
              <Text style={styles.responseTag}>We reply within 24 hours</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={26}
              color="#BDBDBD"
            />
          </TouchableOpacity>

          <Text style={styles.privacyNote}>
            All conversations are completely private and confidential • Your
            healing journey is safe with us
          </Text>
        </View>
      </Modal>

      {/* ====================== ULTRA ENHANCED PIN MODAL ====================== */}
      <Modal
        isOpen={showPinModal}
        onClose={() => {
          setShowPinModal(false);
          setPin('');
        }}
        title={isDisabling ? 'Disable Stealth Mode' : 'Enable Stealth Mode'}
        subtitle={
          isDisabling ? 'Enter your PIN to disable' : 'Your privacy shield'
        }
        showCloseButton={true}
      >
        {renderPinInput()}
      </Modal>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },

  headerContainer: {
    zIndex: 10,
  },

  scrollContent: {
    paddingBottom: height * 0.05,
    paddingHorizontal: width * 0.034,
  },

  menuGroup: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.large,
    paddingVertical: height * 0.014,
    paddingHorizontal: width * 0.024,
    marginBottom: height * 0.02,
    marginTop: height * 0.02,
  },

  stealthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: height * 0.022,
    paddingHorizontal: width * 0.04,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  stealthInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.04,
  },

  stealthTitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.dark,
  },

  stealthDescription: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.regular,
    color: '#64748B',
    marginTop: 2,
  },

  toggleWrapper: {
    marginLeft: -width * 0.1,
  },

  toggleTrack: {
    width: width * 0.145,
    height: width * 0.072,
    borderRadius: width * 0.036,
    justifyContent: 'center',
    paddingHorizontal: width * 0.006,
  },

  toggleKnob: {
    width: width * 0.06,
    height: width * 0.06,
    borderRadius: width * 0.03,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },

  // PIN MODAL STYLES

  // ==================== PIN BOX STYLES (Add these) ====================
  pinWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: height * 0.06,
    paddingHorizontal: width * 0.02,
  },

  pinContainer: {
    alignItems: 'center',
    paddingVertical: height * 0.02,
  },

  pinTitle: {
    fontFamily: theme.typography.bold,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.white,
    marginBottom: height * 0.01,
  },

  pinSubtitle: {
    fontFamily: theme.typography.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray,
    textAlign: 'center',
    marginBottom: height * 0.04,
    paddingHorizontal: width * 0.08,
  },

  pinBoxes: {
    flexDirection: 'row',
    gap: width * 0.04,
    marginBottom: height * 0.05,
  },

  pinBoxContainer: {
    width: width * 0.16,
    height: width * 0.16,
    borderRadius: theme.borderRadius.large,
    backgroundColor: '#1E1E1E',
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

  pinBoxFilled: {
    borderColor: theme.colors.white,
    backgroundColor: theme.colors.white,
  },

  pinBoxInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.bold,
  },

  pinDigit: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.dark,
    fontFamily: theme.typography.semiBold,
  },

  enhancedModalContent: {
    paddingTop: height * 0.02,
    paddingBottom: height * 0.04,
    alignItems: 'center',
  },

  warningIconWrapper: {
    width: width * 0.24,
    height: width * 0.24,
    backgroundColor: '#FFEBEE',
    borderRadius: theme.borderRadius.circle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.025,
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },

  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.bold,
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: height * 0.015,
  },

  modalSubtitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.semiBold,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: height * 0.015,
    lineHeight: 22,
  },

  modalDescription: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.regular,
    color: '#6B5E4F',
    textAlign: 'center',
    marginBottom: height * 0.035,
    lineHeight: 22,
  },

  reasonInput: {
    width: '100%',
    marginBottom: height * 0.03,
    fontSize: theme.typography.fontSize.md,
  },

  modalButtonsRow: {
    width: width * 0.86,
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: width * 0.04,
  },

  supportIconWrapper: {
    width: width * 0.22,
    height: width * 0.22,
    backgroundColor: '#F4F5F7',
    borderRadius: theme.borderRadius.circle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.02,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },

  supportTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.bold,
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: height * 0.01,
  },

  supportSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.regular,
    color: theme.colors.gray,
    textAlign: 'center',
    marginBottom: height * 0.035,
    paddingHorizontal: width * 0.05,
    lineHeight: 22,
  },

  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: theme.colors.white,
    padding: width * 0.04,
    borderRadius: theme.borderRadius.large,
    marginBottom: height * 0.015,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },

  contactIconBg: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: width * 0.03,
  },

  contactTextContainer: {
    flex: 1,
  },

  contactMethod: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.dark,
    marginBottom: height * 0.005,
  },

  contactDetail: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.regular,
    color: theme.colors.dark,
  },

  responseTag: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.semiBold,
    color: '#64748B',
  },

  privacyNote: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.regular,
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: height * 0.025,
    lineHeight: 18,
    paddingHorizontal: width * 0.05,
  },
});
