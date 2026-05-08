/**
 * @file Home.jsx
 * @module Screens/Home
 * @description Primary landing screen for the The Hope application.
 */

import React, { useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  StatusBar,
  ScrollView,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getUser } from '../../redux/slices/user.slice';
import { getDailyDashboard } from '../../redux/slices/habit.slice';
import LinearGradient from 'react-native-linear-gradient';
import { getMoodAnalytics } from '../../redux/slices/mood.slice';
import { getAllYogaGuides } from '../../redux/slices/yoga.slice';
import Header from '../../utilities/custom-components/header/header/Header';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../styles/Themes';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const getMoodDetails = moodId => {
  switch (moodId) {
    case 'HAPPY':
      return {
        icon: 'emoticon-happy-outline',
        color: '#FFD700',
        label: 'Happy',
      };
    case 'SAD':
      return { icon: 'emoticon-sad-outline', color: '#60A5FA', label: 'Sad' };
    case 'ANXIOUS':
      return {
        icon: 'emoticon-confused-outline',
        color: '#A855F7',
        label: 'Anxious',
      };
    default:
      return {
        icon: 'emoticon-neutral-outline',
        color: '#94A3B8',
        label: 'Neutral',
      };
  }
};

const Home = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);
  const profile = useSelector(state => state.user.user);
  const { stats } = useSelector(state => state.habit.dashboard);
  const { analytics } = useSelector(state => state.mood);
  const { allGuides } = useSelector(state => state.yoga);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (user?.id) {
      dispatch(getUser(user.id));
      dispatch(getDailyDashboard(new Date().toISOString().split('T')[0]));
      dispatch(getMoodAnalytics());
      dispatch(getAllYogaGuides());
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [dispatch, user]);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('transparent');
    StatusBar.setTranslucent(true);
  }, []);

  const latestMood = useMemo(() => {
    if (analytics && analytics.length > 0) {
      const data = analytics[0];
      const details = getMoodDetails(data._id);
      return { ...data, ...details };
    }
    return null;
  }, [analytics]);

  const AnalyticsCard = ({
    title,
    value,
    icon,
    color,
    subText,
    children,
    onPress,
  }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.glassCard, { borderLeftColor: color, borderLeftWidth: 5 }]}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
          <MaterialCommunityIcons name={icon} size={22} color={color} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardValue}>{value}</Text>
        <Text style={styles.cardSubText}>{subText}</Text>
      </View>
      {children}
    </TouchableOpacity>
  );

  const handleBannerPress = () => {
    // 1. Trigger Spring Animation for tactile feedback
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        tension: 100,
        friction: 3,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 3,
      }),
    ]).start();

    // 2. Navigate to Directory Screen (Ensure 'Directory' is registered)
    setTimeout(() => {
      navigation.navigate('Emergency_help');
    }, 1500); // Thora delay taake toast aur animation complete ho
  };

  return (
    <View style={styles.container}>
      <Header
        userName={profile?.userName || 'User'}
        userAvatar={profile?.profilePicture}
        showSearch={false}
      />

      <Animated.ScrollView
        style={{ flex: 1, opacity: fadeAnim }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Habits & Mood Analytics</Text>

        <View style={styles.statsRow}>
          <AnalyticsCard
            title="Habits"
            value={`${stats?.percent || 0}%`}
            icon="check-circle-outline"
            color="#4ADE80"
            subText={`${stats?.completed || 0}/${stats?.total || 0} Done`}
            onPress={() => navigation.navigate('Habits')}
          >
            <View style={styles.progressContainer}>
              <View style={[styles.progressCircle, { borderColor: '#4ADE80' }]}>
                <Text style={[styles.progressText, { color: '#4ADE80' }]}>
                  {stats?.percent || 0}%
                </Text>
              </View>
            </View>
          </AnalyticsCard>

          <AnalyticsCard
            title="Mood Pulse"
            value={latestMood?.label || 'N/A'}
            icon={latestMood?.icon || 'emoticon-outline'}
            color={latestMood?.color || '#60A5FA'}
            subText={`Intensity: ${latestMood?.avgIntensity || 0}/5`}

          >
            <View style={styles.moodMiniChart}>
              {[1, 2, 3, 4, 5].map(step => (
                <View
                  key={step}
                  style={[
                    styles.intensityBar,
                    {
                      backgroundColor:
                        step <= (latestMood?.avgIntensity || 0)
                          ? latestMood?.color
                          : '#E2E8F0',
                    },
                  ]}
                />
              ))}
            </View>
          </AnalyticsCard>
        </View>

        <Text style={styles.sectionTitle}>Yoga Guides</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.yogaScroll}
        >
          {allGuides.map((guide, index) => (
            <TouchableOpacity
              key={index}
              style={styles.yogaCard}
              onPress={() => navigation.navigate('YogaGuide')}
            >
              <View style={styles.yogaIconCircle}>
                <MaterialCommunityIcons
                  name="meditation"
                  size={28}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={styles.yogaText} numberOfLines={1}>
                {guide.title}
              </Text>
              <Text style={styles.yogaSubText}>
                {guide.duration || '15 min'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.bannerContainer}>
          <Animated.View
            style={[
              styles.bannerScaleWrapper,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <TouchableOpacity activeOpacity={1} onPress={handleBannerPress}>
              <LinearGradient
                // Deep premium gradient for high-end feel
                colors={['#1E293B', '#0F172A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bannerGlass}
              >
                {/* Subtle Inner Glow/Reflection */}
                <View style={styles.bannerReflector} />

                <View style={styles.bannerTextSection}>
                  <View style={styles.titleRow}>
                    <Text style={styles.bannerTitle}>Stay Stealthy! 🥷</Text>
                    <View style={styles.statusBadge}>
                      <View style={styles.pulseDot} />
                      <Text style={styles.statusText}>Active</Text>
                    </View>
                  </View>
                  <Text style={styles.bannerText}>
                    Your journey is private. Tap here to access Emergency Help &
                    Expert Directory instantly.
                  </Text>
                </View>

                <View style={styles.actionChevron}>
                  <MaterialCommunityIcons
                    name="arrow-right-circle"
                    size={28}
                    color="rgba(255,255,255,0.8)"
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default Home;

const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  // --- Layout Containers ---
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  scrollContent: {
    padding: width * 0.05,
    paddingTop: height * 0.01,
    paddingBottom: height * 0.04,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: width * 0.03,
  },

  // --- Typography & Headings ---
  sectionTitle: {
    fontSize: width * 0.045,
    fontFamily: theme.typography.bold,
    color: '#1E293B',
    marginBottom: height * 0.02,
    marginTop: height * 0.025,
  },

  // --- Analytics & Glass Cards ---
  glassCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: width * 0.06,
    padding: width * 0.04,
    minHeight: screenHeight * 0.2,
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBox: {
    padding: width * 0.02,
    borderRadius: width * 0.03,
    marginRight: width * 0.02,
  },

  cardTitle: {
    fontSize: width * 0.032,
    fontFamily: theme.typography.semiBold,
    color: '#64748B',
  },

  cardValue: {
    fontSize: width * 0.05,
    fontFamily: theme.typography.bold,
    color: '#1E293B',
    marginTop: height * 0.01,
  },

  cardSubText: {
    fontSize: width * 0.028,
    fontFamily: theme.typography.medium,
    color: '#94A3B8',
    marginTop: height * 0.003,
  },

  // --- Progress & Mood Elements ---
  progressContainer: {
    position: 'absolute',
    bottom: height * 0.02,
    right: width * 0.04,
  },

  progressCircle: {
    width: width * 0.11,
    height: width * 0.11,
    borderRadius: width * 0.055,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },

  progressText: {
    fontSize: width * 0.022,
    fontFamily: theme.typography.bold,
  },

  moodMiniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: width * 0.01,
    height: height * 0.02,
    marginTop: height * 0.012,
  },

  intensityBar: {
    width: width * 0.012,
    height: '100%',
    borderRadius: 4,
  },

  // --- Yoga Section ---
  yogaScroll: {
    marginTop: height * 0.006,
  },

  yogaCard: {
    width: width * 0.38,
    backgroundColor: theme.colors.white,
    padding: width * 0.045,
    borderRadius: width * 0.065,
    marginRight: width * 0.04,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },

  yogaIconCircle: {
    width: width * 0.135,
    height: width * 0.135,
    borderRadius: width * 0.0675,
    backgroundColor: 'linear-gradient(135deg, #F1F5F9 0%, #E0E7FF 100%)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.018,
    borderWidth: 2,
    borderColor: '#E0E7FF',
    elevation: 3,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },

  yogaText: {
    fontSize: width * 0.038,
    fontFamily: theme.typography.bold,
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  yogaSubText: {
    fontSize: width * 0.032,
    color: '#64748B',
    marginTop: height * 0.006,
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  bannerContainer: {
    width: '100%',
    marginTop: height * 0.03,
    marginBottom: height * 0.02,
  },

  bannerScaleWrapper: {
    width: '100%',
  },

  bannerGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.028,
    paddingHorizontal: width * 0.055,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    // Realistic elevation
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },

  bannerReflector: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.03)',
    transform: [{ rotate: '-45deg' }, { translateY: -height * 0.1 }],
  },

  bannerTextSection: {
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(1),
    marginBottom: height * 0.01,
  },

  bannerTitle: {
    fontFamily: theme.typography.bold,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.white,
    letterSpacing: 0.5,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: width * 0.01,
    paddingVertical: height * 0.01,
    borderRadius: theme.borderRadius.large,
    gap: theme.gap(1),
  },

  pulseDot: {
    width: width * 0.014,
    height: width * 0.014,
    borderRadius: theme.borderRadius.circle,
    backgroundColor: '#22C55E',
  },

  statusText: {
    fontSize: width * 0.024,
    fontFamily: theme.typography.semiBold,
    color: '#22C55E',
    textTransform: 'uppercase',
  },

  bannerText: {
    fontFamily: theme.typography.medium,
    fontSize: width * 0.034,
    color: '#94A3B8',
    width: '100%',
  },

  actionChevron: {
    marginLeft: width * 0.04,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
