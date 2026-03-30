/**
 * @file CreateHabit.jsx
 * @module Screens/CreateHabit
 * @description Ultra-enhanced habit creation screen with elegant UI, 12-hour time picker, and Notifee push notifications.
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
  ScrollView,
  FlatList,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { createHabit } from '../../../redux/slices/habit.slice';
import { theme } from '../../../styles/Themes';
import Header from '../../../utilities/custom-components/header/header/Header';
import InputField from '../../../utilities/custom-components/input-field/InputField.utility';
import Button from '../../../utilities/custom-components/button/Button.utility';
import Modal from '../../../utilities/custom-components/modal/Modal.utility';
import notifee, {
  TriggerType,
  AndroidImportance,
  RepeatFrequency,
} from '@notifee/react-native';

const { width, height } = Dimensions.get('window');

const CreateHabit = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { loading } = useSelector(state => state.habit);

  const startDateParam =
    route.params?.startDate || new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'OTHER',
    frequency: [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ],
    isReminderOn: true,
    reminderTime: '09:00', // Internal 24-hour format
    startDate: startDateParam,
  });

  const [displayTime, setDisplayTime] = useState('9:00 AM');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('AM');

  const categories = [
    { value: 'HYDRATION', label: 'Hydration', icon: 'water' },
    { value: 'SLEEP', label: 'Sleep', icon: 'bed' },
    { value: 'NUTRITION', label: 'Nutrition', icon: 'food-apple' },
    { value: 'EXERCISE', label: 'Exercise', icon: 'dumbbell' },
    { value: 'MEDICATION', label: 'Medication', icon: 'pill' },
    { value: 'HYGIENE', label: 'Hygiene', icon: 'shower-head' },
    { value: 'POSTURE', label: 'Posture', icon: 'human' },
    { value: 'MINDFULNESS', label: 'Mindfulness', icon: 'brain' },
    { value: 'JOURNALING', label: 'Journaling', icon: 'notebook' },
    { value: 'READING', label: 'Reading', icon: 'book-open-page-variant' },
    { value: 'DIGITAL_DETOX', label: 'Digital Detox', icon: 'cellphone-off' },
    { value: 'OTHER', label: 'Other', icon: 'dots-horizontal' },
  ];

  const days = [
    { key: 'MONDAY', short: 'M' },
    { key: 'TUESDAY', short: 'T' },
    { key: 'WEDNESDAY', short: 'W' },
    { key: 'THURSDAY', short: 'T' },
    { key: 'FRIDAY', short: 'F' },
    { key: 'SATURDAY', short: 'S' },
    { key: 'SUNDAY', short: 'S' },
  ];

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('transparent');
    StatusBar.setTranslucent(true);
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleDay = day => {
    setFormData(prev => ({
      ...prev,
      frequency: prev.frequency.includes(day)
        ? prev.frequency.filter(d => d !== day)
        : [...prev.frequency, day],
    }));
  };

  const selectCategory = cat => {
    setFormData(prev => ({ ...prev, category: cat }));
  };

  const toggleReminder = () => {
    setFormData(prev => ({
      ...prev,
      isReminderOn: !prev.isReminderOn,
    }));
  };

  // Open Time Picker
  const openTimePicker = () => {
    const [hour24, minute] = formData.reminderTime.split(':').map(Number);
    const hour12 = hour24 % 12 || 12;
    const period = hour24 >= 12 ? 'PM' : 'AM';

    setSelectedHour(hour12);
    setSelectedMinute(minute);
    setSelectedPeriod(period);
    setShowTimePicker(true);
  };

  // Save Time from Picker (12h → 24h)
  const saveSelectedTime = () => {
    let hour24 = selectedHour;
    if (selectedPeriod === 'PM' && selectedHour !== 12) hour24 += 12;
    if (selectedPeriod === 'AM' && selectedHour === 12) hour24 = 0;

    const time24 = `${hour24.toString().padStart(2, '0')}:${selectedMinute
      .toString()
      .padStart(2, '0')}`;

    setFormData(prev => ({ ...prev, reminderTime: time24 }));
    setDisplayTime(
      `${selectedHour}:${selectedMinute
        .toString()
        .padStart(2, '0')} ${selectedPeriod}`,
    );
    setShowTimePicker(false);
  };

  // Schedule Notification
  const scheduleHabitReminder = async (habitId, title, reminderTime24) => {
    try {
      const [hour, minute] = reminderTime24.split(':').map(Number);

      const now = new Date();
      let triggerDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hour,
        minute,
        0,
        0,
      );

      if (triggerDate.getTime() <= now.getTime()) {
        triggerDate.setDate(triggerDate.getDate() + 1);
      }

      await notifee.createTriggerNotification(
        {
          id: habitId,
          title: '⏰ Habit Reminder',
          body: `It's time for your habit: ${title}`,
          android: {
            channelId: 'habit-reminders',
            importance: AndroidImportance.HIGH,
            pressAction: { id: 'default' },
            sound: 'default',
          },
          ios: {
            sound: 'default',
          },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: triggerDate.getTime(),
          repeatFrequency: RepeatFrequency.DAILY,
        },
      );

      console.log(`✅ Reminder scheduled for "${title}" at ${reminderTime24}`);
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  };

  const handleCreateHabit = async () => {
    if (!formData.title.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Title Required',
        text2: 'Please give your habit a name',
      });
      return;
    }

    try {
      const resultAction = await dispatch(createHabit(formData));

      if (createHabit.fulfilled.match(resultAction)) {
        const newHabit = resultAction.payload.habit;

        if (formData.isReminderOn && newHabit?._id) {
          await scheduleHabitReminder(
            newHabit._id,
            formData.title,
            formData.reminderTime,
          );
        }

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: resultAction.payload?.message || 'Your habit is now active!',
        });

        navigation.goBack();
      } else if (createHabit.rejected.match(resultAction)) {
        Toast.show({
          type: 'error',
          text1: 'Creation Failed',
          text2: resultAction.payload?.message || 'Something went wrong',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Unexpected error occurred',
      });
    }
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
          title="Create Habit"
          logo={require('../../../assets/logo/logo.png')}
        />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.formSection}>
            <Text style={styles.label}>Habit Name</Text>
            <InputField
              value={formData.title}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, title: text }))
              }
              placeholder="e.g. Drink 8 glasses of water"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Description</Text>
            <InputField
              value={formData.description}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, description: text }))
              }
              placeholder="Why is this habit important to you?"
              multiline
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Category</Text>
            <FlatList
              data={categories}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.value}
              contentContainerStyle={styles.categoryList}
              renderItem={({ item }) => {
                const isSelected = formData.category === item.value;
                return (
                  <TouchableOpacity
                    style={[
                      styles.categoryCard,
                      isSelected && styles.categoryCardActive,
                    ]}
                    onPress={() => selectCategory(item.value)}
                  >
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={28}
                      color={isSelected ? '#FFF' : theme.colors.dark}
                    />
                    <Text
                      style={[
                        styles.categoryLabel,
                        isSelected && styles.categoryLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Repeat On</Text>
            <View style={styles.frequencyContainer}>
              {days.map(day => {
                const isActive = formData.frequency.includes(day.key);
                return (
                  <TouchableOpacity
                    key={day.key}
                    style={[
                      styles.dayButton,
                      isActive && styles.dayButtonActive,
                    ]}
                    onPress={() => toggleDay(day.key)}
                  >
                    <Text
                      style={[styles.dayText, isActive && styles.dayTextActive]}
                    >
                      {day.short}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.formSection}>
            <View style={styles.reminderHeader}>
              <View>
                <Text style={styles.label}>Daily Reminder</Text>
                <Text style={styles.subLabel}>
                  Get notified to stay consistent
                </Text>
              </View>
              <TouchableOpacity onPress={toggleReminder}>
                <MaterialCommunityIcons
                  name={
                    formData.isReminderOn
                      ? 'toggle-switch'
                      : 'toggle-switch-off'
                  }
                  size={58}
                  color={formData.isReminderOn ? theme.colors.primary : '#999'}
                />
              </TouchableOpacity>
            </View>

            {formData.isReminderOn && (
              <TouchableOpacity
                onPress={openTimePicker}
                style={styles.timeSelector}
              >
                <InputField
                  value={displayTime}
                  placeholder="9:00 AM"
                  leftIcon={
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={24}
                      color={theme.colors.primary}
                    />
                  }
                  editable={false}
                />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            title="Create Habit"
            onPress={handleCreateHabit}
            loading={loading}
            iconName="plus-circle"
            iconColor={theme.colors.white}
            textColor={theme.colors.white}
            iconPosition="left"
            elevation="depth3"
          />
        </View>
      </Animated.View>

      {/* Custom Time Picker Modal */}
      <Modal
        isOpen={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        title="Select Reminder Time"
      >
        <View style={styles.timePickerContent}>
          <View style={styles.timePickerRow}>
            <TouchableOpacity
              onPress={() =>
                setSelectedHour(prev => (prev === 1 ? 12 : prev - 1))
              }
            >
              <MaterialCommunityIcons
                name="chevron-up"
                size={40}
                color="#666"
              />
            </TouchableOpacity>
            <Text style={styles.timePickerNumber}>{selectedHour}</Text>
            <TouchableOpacity
              onPress={() =>
                setSelectedHour(prev => (prev === 12 ? 1 : prev + 1))
              }
            >
              <MaterialCommunityIcons
                name="chevron-down"
                size={40}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.timePickerColon}>:</Text>

          <View style={styles.timePickerRow}>
            <TouchableOpacity
              onPress={() => setSelectedMinute(prev => (prev - 1 + 60) % 60)}
            >
              <MaterialCommunityIcons
                name="chevron-up"
                size={40}
                color="#666"
              />
            </TouchableOpacity>
            <Text style={styles.timePickerNumber}>
              {selectedMinute.toString().padStart(2, '0')}
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedMinute(prev => (prev + 1) % 60)}
            >
              <MaterialCommunityIcons
                name="chevron-down"
                size={40}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.periodSelector}>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'AM' && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod('AM')}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === 'AM' && styles.periodTextActive,
                ]}
              >
                AM
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'PM' && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod('PM')}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === 'PM' && styles.periodTextActive,
                ]}
              >
                PM
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Set Time"
            onPress={saveSelectedTime}
            style={{ marginTop: height * 0.03 }}
          />
        </View>
      </Modal>
    </LinearGradient>
  );
};

export default CreateHabit;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  headerContainer: {
    zIndex: 10,
    paddingBottom: theme.spacing(2),
  },

  content: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.large * 2,
    borderTopRightRadius: theme.borderRadius.large * 2,
    marginTop: theme.spacing(-2),
    overflow: 'hidden',
    ...theme.elevation.depth3,
  },

  scrollContent: {
    paddingHorizontal: theme.spacing(3),
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(15),
  },

  formSection: {
    marginBottom: theme.spacing(4),
    gap: theme.gap(1),
  },

  label: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.bold,
    color: theme.colors.dark,
    lineHeight: theme.typography.lineHeight.md,
  },

  subLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.regular,
    color: '#64748B',
  },

  categoryList: {
    paddingVertical: theme.spacing(1),
    gap: theme.gap(2),
  },

  categoryCard: {
    width: width * 0.25,
    paddingVertical: theme.spacing(2),
    borderRadius: theme.borderRadius.large,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.gray + '40',
    gap: theme.gap(1),
  },

  categoryCardActive: {
    backgroundColor: theme.colors.primary,
    borderColor: '#8B5CF6',
  },

  categoryLabelActive: {
    color: '#FFF',
  },

  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: theme.borderRadius.circle,
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.medium,
    color: '#94A3B8',
  },

  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.gap(1),
    marginTop: theme.spacing(1),
  },

  dayButton: {
    paddingVertical: theme.spacing(1),
    paddingHorizontal: theme.spacing(1.5),
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.gray + '30',
    minWidth: (width - 100) / 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },

  dayButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },

  dayText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.dark,
  },

  dayTextActive: {
    color: theme.colors.white,
  },

  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing(1),
  },

  timeContainer: {
    marginTop: theme.spacing(1),
  },

  timeInputWrapper: {
    width: width * 0.5,
  },

  timeInputText: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.bold,
    color: theme.colors.primary,
  },

  buttonContainer: {
    position: 'absolute',
    bottom: theme.spacing(4),
    left: theme.spacing(3),
    right: theme.spacing(3),
  },

  timePickerContent: {
    alignItems: 'center',
    paddingVertical: height * 0.02,
  },

  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.08,
  },

  timePickerNumber: {
    fontSize: width * 0.12,
    fontFamily: theme.typography.bold,
    color: theme.colors.white,
    minWidth: width * 0.15,
    textAlign: 'center',
  },

  timePickerColon: {
    fontSize: width * 0.1,
    fontFamily: theme.typography.bold,
    color: '#666',
    marginTop: -height * 0.02,
  },

  periodSelector: {
    flexDirection: 'row',
    marginTop: height * 0.04,
    gap: width * 0.04,
  },

  periodButton: {
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.015,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: '#F0F0F0',
  },

  periodButtonActive: {
    backgroundColor: theme.colors.primary,
  },

  periodText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.semiBold,
    color: '#555',
  },

  periodTextActive: {
    color: '#FFF',
  },
});
