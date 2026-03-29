/**
 * @file MyMood.jsx
 * @module Screens/MyMood
 * @description
 * Ultra-enhanced My Mood tracking screen for The Hope mental wellness app.
 * Displays complete mood history from backend with elegant cards, mood emojis,
 * intensity & energy metrics, and fully responsive layout with gradient background.
 * Supports long-press to delete mood entries using the custom Modal.
 */

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../../styles/Themes';
import { useDispatch, useSelector } from 'react-redux';
import { getUserMoods, deleteMood } from '../../../redux/slices/mood.slice';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Modal from '../../../utilities/custom-components/modal/Modal.utility';
import Toast from 'react-native-toast-message';

import * as Animatable from 'react-native-animatable';
import MoodAnalytics from '../mood-analytics/MoodAnalytics';
import Header from '../../../utilities/custom-components/header/header/Header';

const { width, height } = Dimensions.get('window');

const getMoodEmoji = moodType => {
  const emojiMap = {
    OVERJOYED: '🥳',
    HAPPY: '😊',
    SAD: '😢',
    NEUTRAL: '😐',
    DEPRESSED: '😞',
    STRESSED: '😣',
    CALM: '😌',
    ANGRY: '😠',
    ANXIOUS: '😟',
  };
  return emojiMap[moodType] || '😊';
};

const formatMoodDate = dateStr => {
  const date = new Date(dateStr);
  const month = date
    .toLocaleString('default', { month: 'short' })
    .toUpperCase();
  return `${month} ${date.getDate()}`;
};

const MyMood = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const userId = useSelector(
    state => state.auth.user?._id || state.auth.user?.id,
  );
  const { moods } = useSelector(state => state.mood);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('HISTORY');
  const [selectedMoodId, setSelectedMoodId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    if (userId) {
      dispatch(getUserMoods(userId));
    }
  }, [dispatch, userId]);

  const handleLongPress = moodId => {
    setSelectedMoodId(moodId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMoodId) return;

    setDeleting(true);

    try {
      const result = await dispatch(deleteMood(selectedMoodId));

      if (deleteMood.fulfilled.match(result)) {
        // Success: Show backend message
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: result.payload?.message || 'Mood entry deleted successfully.',
        });
      } else if (deleteMood.rejected.match(result)) {
        // Error: Show backend error message
        Toast.show({
          type: 'error',
          text1: 'Delete Failed',
          text2: result.payload?.message || 'Failed to delete mood entry.',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'Something went wrong while deleting.',
      });
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setSelectedMoodId(null);
    }
  };

  const renderMoodItem = ({ item }) => (
    <TouchableOpacity
      style={styles.moodCard}
      activeOpacity={0.9}
      onLongPress={() => handleLongPress(item._id || item.id)}
      delayLongPress={500}
    >
      <View style={styles.datePill}>
        <Text style={styles.dateText}>{formatMoodDate(item.moodDate)}</Text>
      </View>

      <View style={styles.moodInfo}>
        <Text style={styles.moodName}>{item.moodType}</Text>

        <View style={styles.levelsRow}>
          <View style={styles.levelPill}>
            <Text style={styles.levelLabel}>Intensity</Text>
            <Text style={styles.levelValue}>{item.moodIntensity}</Text>
          </View>
          <View style={styles.levelPill}>
            <Text style={styles.levelLabel}>Energy</Text>
            <Text style={styles.levelValue}>{item.energyLevel}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.moodEmoji}>{getMoodEmoji(item.moodType)}</Text>
    </TouchableOpacity>
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
          title={'My Mood'}
          logo={require('../../../assets/logo/logo.png')}
          showSearch={false}
        />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'HISTORY' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('HISTORY')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'HISTORY' && styles.activeTabText,
            ]}
          >
            History
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'ANALYTICS' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('ANALYTICS')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'ANALYTICS' && styles.activeTabText,
            ]}
          >
            Analytics
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {activeTab === 'HISTORY' ? (
          <>
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>All</Text>
            </View>
            <FlatList
              data={moods}
              keyExtractor={item => item._id || item.id}
              renderItem={renderMoodItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.flatListContent}
              ListEmptyComponent={
                <Animatable.View
                  animation="fadeInUp"
                  duration={900}
                  delay={200}
                  style={styles.emptyContainer}
                >
                  {/* Icon */}
                  <Animatable.View
                    animation="zoomIn"
                    duration={900}
                    delay={300}
                    style={styles.emptyIconWrapper}
                  >
                    <Animatable.View
                      animation="pulse"
                      iterationCount="infinite"
                      duration={2500}
                      easing="ease-in-out"
                    >
                      <MaterialCommunityIcons
                        name="emoticon-happy-outline"
                        size={width * 0.2}
                        color="#FFFFFF"
                      />
                    </Animatable.View>
                  </Animatable.View>

                  {/* Title */}
                  <Animatable.Text
                    animation="fadeInDown"
                    duration={800}
                    delay={500}
                    style={styles.emptyText}
                  >
                    No moods yet
                  </Animatable.Text>

                  {/* Description */}
                  <Animatable.Text
                    animation="fadeInUp"
                    duration={800}
                    delay={700}
                    style={styles.emptySubText}
                  >
                    Start tracking your mood and build emotional awareness over
                    time
                  </Animatable.Text>
                </Animatable.View>
              }
            />
          </>
        ) : (
          <MoodAnalytics />
        )}
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate('Create_Mood')}
        >
          <MaterialCommunityIcons
            name="plus"
            size={width * 0.09}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      {/* Delete Confirmation Modal using your custom Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedMoodId(null);
        }}
        title="Delete Mood Entry?"
        subtitle="This action cannot be undone. Your mood record will be permanently removed."
        showCloseButton={true}
        buttons={[
          {
            label: 'Cancel',
            variant: 'secondary',
            onClick: () => {
              setShowDeleteModal(false);
              setSelectedMoodId(null);
            },
          },
          {
            label: 'Delete',
            variant: 'danger',
            onClick: handleDeleteConfirm,
            loading: deleting,
            disabled: deleting,
          },
        ]}
      />
    </LinearGradient>
  );
};

export default MyMood;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  headerContainer: {
    zIndex: 10,
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: theme.borderRadius.circle,
    padding: height * 0.005,
    marginBottom: height * 0.02,
    marginTop: height * 0.02,
    marginHorizontal: width * 0.02,
  },

  tabButton: {
    flex: 1,
    paddingVertical: height * 0.012,
    borderRadius: theme.borderRadius.circle,
    alignItems: 'center',
  },

  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },

  tabText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.medium,
    color: 'rgba(255,255,255,0.8)',
  },

  activeTabText: {
    color: '#3E322A',
    fontFamily: theme.typography.semiBold,
  },

  analyticsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.15,
  },

  analyticsTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.bold,
    color: '#FFFFFF',
    marginBottom: 10,
  },

  analyticsSub: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.regular,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    paddingHorizontal: width * 0.1,
  },

  listContainer: {
    flex: 1,
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.03,
  },

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.015,
    paddingHorizontal: width * 0.01,
  },

  listHeaderText: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.semiBold,
    color: '#3E322A',
  },

  flatListContent: {
    paddingBottom: height * 0.22,
  },

  moodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.large,
    paddingVertical: height * 0.024,
    paddingHorizontal: width * 0.024,
    marginBottom: height * 0.02,
    shadowColor: '#252321',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 18,
    borderWidth: 1.5,
    borderColor: '#F5F0E8',
    overflow: 'hidden',
    position: 'relative',
  },

  datePill: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: width * 0.025,
    paddingVertical: height * 0.012,
    borderRadius: theme.borderRadius.circle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  dateText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.dark,
  },

  moodInfo: {
    flex: 1,
    paddingHorizontal: width * 0.05,
  },

  moodName: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.bold,
    color: '#3E322A',
    marginBottom: height * 0.01,
  },

  levelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.06,
  },

  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.015,
  },

  levelLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.medium,
    color: '#8B7D6B',
  },

  levelValue: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.semiBold,
    color: '#3E322A',
  },

  moodEmoji: {
    fontSize: width * 0.12,
  },

  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.12,
  },

  emptyIconWrapper: {
    width: width * 0.32,
    height: width * 0.32,
    borderRadius: width * 0.16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(54, 219, 211, 0.15)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: height * 0.03,
  },

  emptyText: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.bold,
    color: '#FFFFFF',
    marginBottom: height * 0.012,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  emptySubText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.regular,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
  },

  bottomBar: {
    position: 'absolute',
    bottom: height * 0.04,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },

  floatingButton: {
    width: width * 0.18,
    height: width * 0.18,
    backgroundColor: '#87B07D',
    borderRadius: width * 0.09,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#87B07D',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 16,
  },
});
