/**
 * @file UpdateHabit.jsx
 * @module Screens/UpdateHabit
 * @description Screen for editing an existing habit with pre-filled data.
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
import { updateHabit } from '../../../redux/slices/habit.slice'; // Make sure this action exists
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

const UpdateHabit = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { loading } = useSelector(state => state.habit);

  // Get habit data passed from navigation
  const habitToEdit = route.params?.habit;

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
    reminderTime: '09:00',
    startDate: '',
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

  // Pre-fill form when habit data is available
  useEffect(() => {
    if (habitToEdit) {
      const habit = habitToEdit;

      // Convert reminderTime from 24h to 12h display
      let display = '9:00 AM';
      if (habit.reminderTime) {
        const [hour24, minute] = habit.reminderTime.split(':').map(Number);
        const hour12 = hour24 % 12 || 12;
        const period = hour24 >= 12 ? 'PM' : 'AM';
        display = `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
      }

      setFormData({
        title: habit.title || '',
        description: habit.description || '',
        category: habit.category || 'OTHER',
        frequency: Array.isArray(habit.frequency) ? habit.frequency : [],
        isReminderOn: habit.isReminderOn ?? true,
        reminderTime: habit.reminderTime || '09:00',
        startDate: habit.startDate || '',
      });

      setDisplayTime(display);
    }
  }, [habitToEdit]);

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

  const openTimePicker = () => {
    const [hour24, minute] = formData.reminderTime.split(':').map(Number);
    const hour12 = hour24 % 12 || 12;
    const period = hour24 >= 12 ? 'PM' : 'AM';

    setSelectedHour(hour12);
    setSelectedMinute(minute);
    setSelectedPeriod(period);
    setShowTimePicker(true);
  };

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

  const handleUpdateHabit = async () => {
    if (!formData.title.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Title Required',
        text2: 'Please give your habit a name',
      });
      return;
    }

    if (!habitToEdit?._id) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Habit ID is missing',
      });
      return;
    }

    try {
      const updateData = {
        ...formData,
        habitId: habitToEdit._id, // or however your backend expects it
      };

      const resultAction = await dispatch(updateHabit(updateData));

      if (updateHabit.fulfilled.match(resultAction)) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Habit updated successfully!',
        });
        navigation.goBack();
      } else if (updateHabit.rejected.match(resultAction)) {
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
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
          title={`Edit ${habitToEdit?.title} Habit`}
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
            title="Update Habit"
            onPress={handleUpdateHabit}
            loading={loading}
            iconName="edit-2"
            iconColor={theme.colors.white}
            iconPosition="left"
            textColor={theme.colors.white}
            elevation="depth3"
          />
        </View>
      </Animated.View>

      {/* Time Picker Modal */}
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

export default UpdateHabit;

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
    color: theme.colors.textSecondary,
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
    borderColor: theme.colors.primary,
  },

  categoryLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.medium,
    color: theme.colors.textTertiary,
  },

  categoryLabelActive: {
    color: theme.colors.white,
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

  buttonContainer: {
    position: 'absolute',
    bottom: theme.spacing(4),
    left: theme.spacing(3),
    right: theme.spacing(3),
  },

  timeSelector: {
    marginTop: theme.spacing(1),
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
    color: theme.colors.textSecondary,
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
    backgroundColor: theme.colors.background,
  },

  periodButtonActive: {
    backgroundColor: theme.colors.primary,
  },

  periodText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.secondary,
  },

  periodTextActive: {
    color: theme.colors.white,
  },
});
