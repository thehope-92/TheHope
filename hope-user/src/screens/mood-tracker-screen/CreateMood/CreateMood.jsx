/**
 * @file CreateMood.jsx
 * @module Screens/CreateMood
 * @description
 * Ultra-premium mood creation screen for The Hope mental wellness app.
 * Features a horizontal pager for mood selection with clear visual feedback
 * for the "Selected" state, and a detailed entry sheet using custom InputFields.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Switch,
  StatusBar,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch } from 'react-redux';
import { createMood } from '../../../redux/slices/mood.slice';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import Slider from '@react-native-community/slider';
import { theme } from '../../../styles/Themes';
import InputField from '../../../utilities/custom-components/input-field/InputField.utility';
import Header from '../../../utilities/custom-components/header/header/Header';

const { width, height } = Dimensions.get('window');

const moodOptions = [
  {
    id: 1,
    type: 'HAPPY',
    label: "I'm Feeling Happy",
    color: '#F9D976',
    icon: 'emoticon-happy-outline',
  },
  {
    id: 2,
    type: 'SAD',
    label: "I'm Feeling Sad",
    color: '#F28C33',
    icon: 'emoticon-sad-outline',
  },
  {
    id: 3,
    type: 'ANXIOUS',
    label: "I'm Feeling Anxious",
    color: '#B4A2F8',
    icon: 'emoticon-confused-outline',
  },
  {
    id: 4,
    type: 'STRESSED',
    label: "I'm Feeling Stressed",
    color: '#7E9DFE',
    icon: 'emoticon-frown-outline',
  },
  {
    id: 5,
    type: 'ANGRY',
    label: "I'm Feeling Angry",
    color: '#FF7676',
    icon: 'emoticon-angry-outline',
  },
  {
    id: 6,
    type: 'TIRED',
    label: "I'm Feeling Tired",
    color: '#A2C17D',
    icon: 'emoticon-dead-outline',
  },
  {
    id: 7,
    type: 'CALM',
    label: "I'm Feeling Calm",
    color: '#88D8C0',
    icon: 'emoticon-cool-outline',
  },
  {
    id: 8,
    type: 'EXCITED',
    label: "I'm Feeling Excited",
    color: '#FFB347',
    icon: 'emoticon-excited-outline',
  },
  {
    id: 9,
    type: 'NEUTRAL',
    label: "I'm Feeling Neutral",
    color: '#9C775D',
    icon: 'emoticon-neutral-outline',
  },
];

const CreateMood = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const scrollX = useRef(new Animated.Value(0)).current;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMoodIndex, setSelectedMoodIndex] = useState(0);
  const [moodIntensity, setMoodIntensity] = useState(0);
  const [energyLevel, setEnergyLevel] = useState(0);
  const [sleepHours, setSleepHours] = useState('');
  const [location, setLocation] = useState('');
  const [weatherCondition, setWeatherCondition] = useState('');
  const [moodNote, setMoodNote] = useState('');
  const [tags, setTags] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('transparent');
  }, []);

  const handleCreateMood = async () => {
    setLoading(true);

    const selectedMood = moodOptions[selectedMoodIndex];

    const moodData = {
      moodType: selectedMood.type,
      moodIntensity: Math.round(moodIntensity),
      energyLevel: Math.round(energyLevel),
      sleepHours: Number(sleepHours) || 0,
      location: location.trim(),
      weatherCondition: weatherCondition.trim(),
      moodNote: moodNote.trim(),
      tags: tags.trim() ? tags.split(',').map(t => t.trim()) : [],
      moodDate: new Date().toISOString(),
      isPrivate,
    };

    try {
      const result = await dispatch(createMood(moodData));

      if (createMood.fulfilled.match(result)) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: result.payload?.message || '',
        });
        navigation.goBack();
      } else if (createMood.rejected.match(result)) {
        const message =
          result.payload?.message ||
          result.error?.message ||
          'Could not save mood';
        const isDuplicate =
          message.toLowerCase().includes('already') ||
          message.toLowerCase().includes('exist');

        Toast.show({
          type: isDuplicate ? 'error' : 'error',
          text2: message,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSetMood = index => {
    setSelectedMoodIndex(index);
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
          title={'Create Mood'}
          logo={require('../../../assets/logo/logo.png')}
          showSearch={false}
        />
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>How are you feeling?</Text>
      </View>

      <View style={styles.selectorWrapper}>
        <Animated.ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false },
          )}
          onMomentumScrollEnd={e => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(idx);
          }}
          scrollEventThrottle={16}
          style={styles.moodSelectorScroll}
        >
          {moodOptions.map((mood, index) => {
            const isSelected = selectedMoodIndex === index;
            return (
              <View key={mood.id} style={styles.fullCard}>
                <View
                  style={[
                    styles.moodCardInner,
                    { backgroundColor: mood.color },
                    isSelected && styles.selectedCardBorder,
                  ]}
                >
                  {isSelected && (
                    <View style={styles.selectionBadge}>
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={28}
                        color="#FFF"
                      />
                    </View>
                  )}

                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons
                      name={mood.icon}
                      size={width * 0.35}
                      color="#FFF"
                    />
                    <Text style={styles.moodLabel}>{mood.label}</Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.setMoodBtn,
                      isSelected && styles.activeSetBtn,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => onSetMood(index)}
                  >
                    <View style={styles.btnContent}>
                      <Text
                        style={[
                          styles.setMoodText,
                          isSelected && styles.activeSetText,
                        ]}
                      >
                        {isSelected ? 'Selected' : 'Set Mood'}
                      </Text>
                      <MaterialCommunityIcons
                        name={isSelected ? 'check-bold' : 'check'}
                        size={20}
                        color={isSelected ? '#FFF' : '#3E322A'}
                        style={{ marginLeft: 10 }}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </Animated.ScrollView>

        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {moodOptions.map((_, i) => {
            const opacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.4, 1, 0.4],
              extrapolate: 'clamp',
            });
            const scale = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [1, 1.5, 1],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { opacity, transform: [{ scale }] }]}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.detailsSheet}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Deepen your entry</Text>

          <View style={styles.sliderGroup}>
            <View style={styles.sliderHeader}>
              <Text style={styles.fieldLabel}>Mood Intensity</Text>
              <Text style={styles.sliderValue}>
                {Math.round(moodIntensity)}/10
              </Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              value={moodIntensity}
              onValueChange={setMoodIntensity}
              minimumTrackTintColor={moodOptions[currentIndex].color}
              thumbTintColor="#3E322A"
            />
          </View>

          <View style={styles.sliderGroup}>
            <View style={styles.sliderHeader}>
              <Text style={styles.fieldLabel}>Energy Level</Text>
              <Text style={styles.sliderValue}>
                {Math.round(energyLevel)}/10
              </Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              value={energyLevel}
              onValueChange={setEnergyLevel}
              minimumTrackTintColor={moodOptions[currentIndex].color}
              thumbTintColor="#3E322A"
            />
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.fieldLabel}>Sleep Hours</Text>
              <InputField
                value={sleepHours}
                onChangeText={setSleepHours}
                placeholder="e.g. 8"
                keyboardType="numeric"
                placeholderTextColor="rgba(62, 50, 42, 0.4)"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.fieldLabel}>Weather</Text>
              <InputField
                value={weatherCondition}
                onChangeText={setWeatherCondition}
                placeholder="Sunny..."
                placeholderTextColor="rgba(62, 50, 42, 0.4)"
              />
            </View>
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Location</Text>
            <InputField
              value={location}
              onChangeText={setLocation}
              placeholder="Where are you?"
              placeholderTextColor="rgba(62, 50, 42, 0.4)"
            />
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>What's on your mind?</Text>
            <InputField
              value={moodNote}
              onChangeText={setMoodNote}
              placeholder="Write something..."
              multiline
              numberOfLines={4}
              placeholderTextColor="rgba(62, 50, 42, 0.4)"
            />
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Tags</Text>
            <InputField
              value={tags}
              onChangeText={setTags}
              placeholder="work, anxiety..."
              placeholderTextColor="rgba(62, 50, 42, 0.4)"
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleText}>Keep this entry private</Text>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{
                false: '#D1C4B9',
                true: moodOptions[currentIndex].color,
              }}
              thumbColor="#FFF"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitBtn,
              {
                backgroundColor:
                  moodOptions[selectedMoodIndex].color === '#F9D976'
                    ? '#3E322A'
                    : moodOptions[selectedMoodIndex].color,
              },
            ]}
            onPress={handleCreateMood}
            disabled={loading}
          >
            <Text
              style={[
                styles.submitBtnText,
                moodOptions[selectedMoodIndex].color === '#F9D976' && {
                  color: '#FFF',
                },
              ]}
            >
              {loading ? 'Saving...' : 'Save My Mood'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </LinearGradient>
  );
};

export default CreateMood;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  headerContainer: {
    zIndex: 10,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.015,
    marginBottom: height * 0.01,
    paddingHorizontal: width * 0.06,
  },

  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.bold,
    color: theme.colors.white,
  },

  selectorWrapper: {
    height: height * 0.42,
    alignItems: 'center',
  },

  moodSelectorScroll: {
    flex: 1,
  },

  fullCard: {
    width: width,
    paddingHorizontal: width * 0.02,
    paddingVertical: height * 0.01,
    alignItems: 'center',
    justifyContent: 'center',
  },

  moodCardInner: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    position: 'relative',
    borderWidth: 3,
    borderColor: 'transparent',
  },

  selectedCardBorder: {
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },

  selectionBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 5,
  },

  iconContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },

  moodLabel: {
    fontSize: 20,
    fontFamily: theme.typography.bold,
    color: '#FFF',
    marginTop: 5,
  },

  setMoodBtn: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 5,
  },

  activeSetBtn: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: '#FFF',
  },

  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  setMoodText: {
    fontSize: 15,
    fontFamily: theme.typography.bold,
    color: '#3E322A',
  },

  activeSetText: {
    color: '#FFF',
  },

  paginationContainer: {
    flexDirection: 'row',
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
    marginHorizontal: 4,
  },

  detailsSheet: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: 10,
  },

  scrollContent: {
    paddingHorizontal: width * 0.06,
    paddingTop: 25,
    paddingBottom: height * 0.05,
  },

  sectionTitle: {
    fontSize: 20,
    fontFamily: theme.typography.bold,
    color: '#3E322A',
    marginBottom: 20,
  },

  fieldWrapper: {
    marginBottom: 18,
  },

  fieldLabel: {
    fontSize: 14,
    fontFamily: theme.typography.bold,
    color: '#6B5E4F',
    marginBottom: 8,
    marginLeft: 4,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  sliderGroup: {
    marginBottom: 20,
  },

  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sliderValue: {
    fontSize: 16,
    fontFamily: theme.typography.bold,
    color: '#3E322A',
  },

  slider: {
    width: '100%',
    height: 40,
  },

  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9F6F2',
    padding: 15,
    borderRadius: 18,
    marginVertical: 10,
  },

  toggleText: {
    fontSize: 15,
    fontFamily: theme.typography.medium,
    color: '#3E322A',
  },

  submitBtn: {
    backgroundColor: '#3E322A',
    paddingVertical: 18,
    borderRadius: 22,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },

  submitBtnText: {
    fontSize: 18,
    fontFamily: theme.typography.bold,
    color: '#FFF',
  },
});
