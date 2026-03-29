/**
 * @file Habits.jsx
 * @module Screens/Habits
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  Modal as RNModal,
  FlatList,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { CalendarList } from 'react-native-calendars';
import { useDispatch, useSelector } from 'react-redux';
import {
  getDailyDashboard,
  toggleHabitStatus,
  deleteHabit,
} from '../../../redux/slices/habit.slice';
import { theme } from '../../../styles/Themes';
import Header from '../../../utilities/custom-components/header/header/Header';
import Loader from '../../../utilities/custom-components/loader/Loader.utility';
import Modal from '../../../utilities/custom-components/modal/Modal.utility';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const Habits = () => {
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { dashboard, loading } = useSelector(state => state.habit);

  const currentDateString = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const getDateString = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isFutureDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    return selected > today;
  };

  useEffect(() => {
    const dateStr = getDateString(selectedDate);
    dispatch(getDailyDashboard(dateStr));
  }, [selectedDate, dispatch]);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleDayPress = day => {
    setSelectedDate(new Date(day.dateString));
    setShowCalendar(false);
  };

  const handleDatePress = date => {
    setSelectedDate(date);
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 7; i >= 1; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date);
    }

    dates.push(new Date(today));

    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = generateDates();

  const isSelected = date => {
    return getDateString(date) === getDateString(selectedDate);
  };

  const toggleHabit = habitId => {
    if (isFutureDate()) return;
    dispatch(toggleHabitStatus(habitId));
  };

  const openMenu = habit => {
    setSelectedHabit(habit);
    setShowMenuModal(true);
  };

  const openDeleteModal = () => {
    setShowMenuModal(false);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedHabit) return;

    setIsDeleting(true);

    try {
      const resultAction = await dispatch(deleteHabit(selectedHabit._id));

      if (deleteHabit.fulfilled.match(resultAction)) {
        setShowDeleteModal(false);

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2:
            resultAction.payload?.message ||
            'Habit has been deleted successfully',
        });

        setSelectedHabit(null);
      } else if (deleteHabit.rejected.match(resultAction)) {
        // Error from backend
        Toast.show({
          type: 'error',
          text1: 'Failure',
          text2: resultAction.payload?.message || 'Failed to delete habit',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err?.message || 'Something went wrong while deleting habit',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const renderDateItem = ({ item }) => {
    const selected = isSelected(item);
    const dayName = item
      .toLocaleString('en-US', { weekday: 'short' })
      .slice(0, 3);
    const isToday = getDateString(item) === getDateString(new Date());

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleDatePress(item)}
      >
        <Animated.View
          style={[styles.dateCard, selected && styles.dateCardActive]}
        >
          <Text style={[styles.dayText, selected && styles.textActive]}>
            {dayName}
          </Text>
          <Text style={[styles.dateText, selected && styles.textActive]}>
            {item.getDate()}
          </Text>
          {isToday && <View style={styles.todayDot} />}
        </Animated.View>
      </TouchableOpacity>
    );
  };

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
          title="My Habits"
          logo={require('../../../assets/logo/logo.png')}
        />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.dateHeader}>
          <Text style={styles.headerTitle}>{currentDateString}</Text>
        </View>

        <View style={styles.controlsRow}>
          <View style={styles.statusPill}>
            <MaterialCommunityIcons name="fire" size={24} color="#FF9500" />
            <Text style={styles.statusText}>
              {dashboard.stats?.label || 'No habits today'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.calendarIconBtn}
            onPress={() => setShowCalendar(true)}
          >
            <MaterialCommunityIcons
              name="calendar-month-outline"
              size={26}
              color="#D89B73"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.dateStripContainer}>
          <FlatList
            data={dates}
            renderItem={renderDateItem}
            keyExtractor={item => item.toISOString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateListContent}
          />
        </View>

        <View style={styles.habitsContainer}>
          {loading ? (
            <Loader />
          ) : isFutureDate() ? (
            <View style={styles.futureWarning}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={70}
                color="#FF9500"
              />
              <Text style={styles.futureTitle}>Future Date Selected</Text>
              <Text style={styles.futureSubtitle}>
                Future habits cannot be completed{'\n'}because it's in the
                future.
              </Text>
            </View>
          ) : Array.isArray(dashboard.habits) && dashboard.habits.length > 0 ? (
            <FlatList
              data={dashboard.habits}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <View style={styles.habitCard}>
                  <View style={styles.habitMainContent}>
                    <View style={styles.habitIconWrapper}>
                      <LinearGradient
                        colors={[theme.colors.primary, '#8B5CF6']}
                        style={styles.habitIconCircle}
                      >
                        <MaterialCommunityIcons
                          name="target"
                          size={width * 0.08}
                          color="#FFFFFF"
                        />
                      </LinearGradient>
                    </View>

                    <View style={styles.habitInfo}>
                      <Text
                        style={[
                          styles.habitTitle,
                          item.isCompleted && styles.completedTitle,
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text style={styles.habitDesc}>{item.description}</Text>
                    </View>
                  </View>

                  <View style={styles.rightSection}>
                    <TouchableOpacity
                      style={styles.checkButton}
                      onPress={() => toggleHabit(item._id)}
                    >
                      <MaterialCommunityIcons
                        name={
                          item.isCompleted ? 'check-circle' : 'circle-outline'
                        }
                        size={width * 0.09}
                        color={item.isCompleted ? '#22C55E' : '#CCCCCC'}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.menuButton}
                      onPress={() => openMenu(item)}
                    >
                      <MaterialCommunityIcons
                        name="dots-vertical"
                        size={24}
                        color="#888"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.habitsListContent}
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="self-improvement" size={80} color="#555" />
              <Text style={styles.emptyText}>No habits scheduled</Text>
              <Text style={styles.emptySubText}>
                Add habits that match this day of the week
              </Text>
            </View>
          )}
        </View>
      </Animated.View>

      <RNModal
        visible={showMenuModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMenuModal(false)}
      >
        <View style={styles.menuOverlay}>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => setShowMenuModal(false)}
            >
              <MaterialCommunityIcons
                name="pencil-outline"
                size={24}
                color="#555"
              />
              <Text style={styles.menuText}>Edit Habit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuOption, styles.deleteOption]}
              onPress={openDeleteModal}
            >
              <MaterialCommunityIcons
                name="delete-outline"
                size={24}
                color="#FF3B30"
              />
              <Text style={[styles.menuText, styles.deleteText]}>
                Delete Habit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeMenuButton}
              onPress={() => setShowMenuModal(false)}
            >
              <Text style={styles.closeMenuText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </RNModal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setIsDeleting(false);
        }}
        title="Delete Habit"
        subtitle="This action cannot be undone."
      >
        <View style={styles.deleteModalContent}>
          <View style={styles.warningIconWrapper}>
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={78}
              color="#F44336"
            />
          </View>

          <Text style={styles.modalTitle}>Are you sure?</Text>
          <Text style={styles.modalSubtitle}>
            You are about to permanently delete{'\n'}
            <Text style={{ fontFamily: theme.typography.bold }}>
              "{selectedHabit?.title}"
            </Text>
          </Text>

          <View style={styles.modalButtonsRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.deleteButtonText}>Yes, Delete Habit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <RNModal
        visible={showCalendar}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModalContent}>
            <Text style={styles.modalTitle}>Select Date</Text>
            <CalendarList
              current={getDateString(selectedDate)}
              pastScrollRange={30}
              futureScrollRange={30}
              onDayPress={handleDayPress}
              markedDates={{
                [getDateString(selectedDate)]: {
                  selected: true,
                  selectedColor: theme.colors.primary,
                },
              }}
              theme={{
                backgroundColor: '#FFF',
                calendarBackground: '#FFF',
                selectedDayBackgroundColor: theme.colors.primary,
                todayTextColor: theme.colors.primary,
                arrowColor: theme.colors.primary,
              }}
              horizontal={true}
              pagingEnabled={true}
            />
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowCalendar(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </RNModal>
    </LinearGradient>
  );
};

export default Habits;

const styles = StyleSheet.create({
  container: { flex: 1 },

  headerContainer: { zIndex: 10 },

  content: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
    marginTop: -height * 0.03,
    overflow: 'hidden',
  },

  dateHeader: {
    marginTop: height * 0.05,
    paddingHorizontal: width * 0.05,
  },

  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.bold,
    color: theme.colors.dark,
  },

  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    marginTop: height * 0.02,
  },

  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1A17',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.012,
    borderRadius: theme.borderRadius.circle,
    gap: theme.gap(1),
    borderWidth: 1.5,
    borderColor: '#302924',
  },

  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.secondary,
  },

  calendarIconBtn: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: theme.borderRadius.circle,
    backgroundColor: '#1A1715',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#302924',
  },

  dateStripContainer: {
    height: height * 0.12,
    marginTop: height * 0.02,
  },

  dateListContent: {
    paddingHorizontal: width * 0.04,
    gap: width * 0.03,
  },

  dateCard: {
    width: width * 0.145,
    height: height * 0.095,
    backgroundColor: '#1A1715',
    borderRadius: theme.borderRadius.large,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  dateCardActive: {
    backgroundColor: theme.colors.secondary,
  },

  dayText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.white,
    fontFamily: theme.typography.semiBold,
    marginBottom: height * 0.005,
  },

  dateText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.white,
    fontFamily: theme.typography.bold,
  },

  textActive: {
    color: theme.colors.dark,
  },

  todayDot: {
    position: 'absolute',
    bottom: 6,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#FF9500',
  },

  habitsContainer: {
    flex: 1,
    paddingHorizontal: width * 0.02,
    paddingTop: height * 0.015,
  },

  habitsListContent: {
    paddingBottom: height * 0.1,
  },

  habitCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.large,
    marginBottom: height * 0.018,
    padding: width * 0.045,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#F5F5F5',
  },

  habitMainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: width * 0.04,
  },

  habitIconWrapper: {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },

  habitIconCircle: {
    width: width * 0.135,
    height: width * 0.135,
    borderRadius: theme.borderRadius.circle,
    justifyContent: 'center',
    alignItems: 'center',
  },

  habitInfo: {
    flex: 1,
  },

  habitTitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.bold,
    color: theme.colors.dark,
    marginBottom: height * 0.005,
  },

  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#999',
  },

  habitDesc: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.secondary,
    lineHeight: height * 0.022,
  },

  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkButton: {
    padding: width * 0.01,
    marginRight: width * 0.02,
  },

  menuButton: {
    padding: 8,
  },

  futureWarning: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.1,
  },

  futureTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.bold,
    color: '#FF9500',
    marginTop: height * 0.03,
    textAlign: 'center',
  },

  futureSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: '#777',
    textAlign: 'center',
    marginTop: height * 0.015,
    lineHeight: height * 0.028,
  },

  emptyState: {
    alignItems: 'center',
    marginTop: height * 0.15,
  },

  emptyText: {
    fontSize: theme.typography.fontSize.md,
    color: '#555',
    marginTop: height * 0.02,
    fontFamily: theme.typography.medium,
  },

  emptySubText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.medium,
    color: theme.colors.secondary,
    marginTop: height * 0.01,
  },

  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },

  menuContainer: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
    paddingVertical: height * 0.02,
  },

  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.018,
    paddingHorizontal: width * 0.06,
    gap: width * 0.04,
  },

  deleteOption: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },

  menuText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.medium,
    color: '#333',
  },

  deleteText: {
    color: '#FF3B30',
  },

  closeMenuButton: {
    marginTop: height * 0.01,
    paddingVertical: height * 0.018,
    alignItems: 'center',
  },

  closeMenuText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.primary,
  },

  deleteModalContent: {
    alignItems: 'center',
    paddingVertical: height * 0.02,
  },

  warningIconWrapper: {
    marginBottom: height * 0.03,
  },

  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.bold,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: height * 0.01,
  },

  modalSubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.gray,
    textAlign: 'center',
    lineHeight: height * 0.028,
  },

  modalButtonsRow: {
    flexDirection: 'row',
    marginTop: height * 0.04,
    gap: width * 0.04,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: height * 0.018,
    backgroundColor: '#333',
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
  },

  deleteButton: {
    flex: 1,
    paddingVertical: height * 0.018,
    backgroundColor: '#F44336',
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    color: '#FFF',
    fontFamily: theme.typography.semiBold,
    fontSize: theme.typography.fontSize.sm,
  },

  deleteButtonText: {
    color: '#FFF',
    fontFamily: theme.typography.semiBold,
    fontSize: theme.typography.fontSize.sm,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },

  calendarModalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
    height: height * 0.78,
    paddingTop: height * 0.025,
  },

  closeBtn: {
    marginTop: height * 0.015,
    alignSelf: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: width * 0.1,
    paddingVertical: height * 0.015,
    borderRadius: theme.borderRadius.circle,
  },

  closeText: {
    color: theme.colors.white,
    fontFamily: theme.typography.semiBold,
    fontSize: theme.typography.fontSize.sm,
  },
});
