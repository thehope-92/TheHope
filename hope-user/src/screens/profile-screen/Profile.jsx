/**
 * @file Profile.jsx
 * @module Screens/Profile
 * @description
 * The primary user account management screen for the NiDrip Central application.
 * * Responsibilities:
 * - Displays user identity information (Avatar, Username).
 * - Provides navigation to secondary account screens (My Profile, About Us).
 * - Manages session termination (Logout) with Redux state cleanup and feedback.
 * - Handles destructive actions (Account Deletion) via a secure modal workflow and reason collection.
 * * Features:
 * - Dynamic Profile Sync: Fetches latest user data via Redux on focus.
 * - Secure Logout: Resets navigation stack to 'Signin' upon successful session clearance.
 * - Enhanced Feedback: Integrates `react-native-toast-message` for process status (success/error).
 * - Modal Integration: Uses a custom utility modal for permanent account removal confirmations.
 */

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  StatusBar,
  Text,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../styles/Themes';
import { useDispatch, useSelector } from 'react-redux';
import { deleteAccount, getUser } from '../../redux/slices/user.slice';
import Header from '../../utilities/custom-components/header/header/Header';
import ProfileCard from '../../utilities/custom-components/card/profile-card/ProfileCard';
import { useNavigation } from '@react-navigation/native';
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
  const [deleteReason, setDeleteReason] = useState('');

  useEffect(() => {
    if (user?.id) {
      dispatch(getUser(user.id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('transparent');
  }, []);

  const handleProfileNavigate = () => {
    navigation.navigate('My_Profile', {
      user: profile,
    });
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
            navigationTarget={'Support_Center'}
          />
          <ProfileCard
            title="About Us"
            iconName="information-outline"
            navigationTarget={'About_Us'}
          />
        </View>

        <View style={styles.menuGroup}>
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
              width={width * 0.12}
            />

            <Button
              title="Delete"
              onPress={handleDeleteAccount}
              loading={loading}
              backgroundColor="#F44336"
              textColor={theme.colors.white}
              width={width * 0.12}
            />
          </View>
        </View>
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
    color: theme.colors.primary,
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
    width: '109%',
    marginBottom: height * 0.03,
    fontSize: theme.typography.fontSize.md,
  },

  modalButtonsRow: {
    width: width * 0.86,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
