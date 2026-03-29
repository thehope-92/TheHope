/**
 * @file YogaDetail.jsx
 * @module Screens/YogaDetail
 * @description
 * Ultra-enhanced Yoga Detail screen featuring parallax header animations,
 * glassmorphism stats, and sequential entrance animations for instruction steps.
 * Built with performance-optimized Animated API and responsive Dimensions.
 * Includes an integrated, realistic YouTube-style inline video player.
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StatusBar,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Video from 'react-native-video';
import { theme } from '../../../styles/Themes';

const { width, height } = Dimensions.get('window');

const YogaDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const controlsTimeoutRef = useRef(null);

  const [showPlayer, setShowPlayer] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const { yogaId, yogaData: passedYogaData } = route.params || {};
  const yogaData = passedYogaData || {};

  useEffect(() => {
    Animated.timing(contentFade, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('transparent');
  }, []);

  const formatTime = timeInSeconds => {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleProgress = data => {
    setCurrentTime(data.currentTime);
  };

  const handleLoad = data => {
    setDuration(data.duration);
    hideControlsWithDelay();
  };

  const toggleControls = () => {
    setShowControls(!showControls);
    if (!showControls) {
      hideControlsWithDelay();
    } else {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const hideControlsWithDelay = () => {
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const togglePlayPause = () => {
    setPaused(!paused);
    hideControlsWithDelay();
  };

  const handleVideoEnd = () => {
    setPaused(true);
    setShowControls(true);
  };

  if (!yogaData || !yogaData._id) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={60}
          color={theme.colors.primary}
        />
        <Text style={styles.errorText}>Yoga guide not found</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const headerHeight = height * 0.45;
  const topInset = Platform.OS === 'ios' ? 45 : StatusBar.currentHeight || 24;
  const videoHeight = width * (9 / 16);
  const totalVideoAreaHeight = videoHeight + topInset;

  const imageScale = scrollY.interpolate({
    inputRange: [-headerHeight, 0],
    outputRange: [1.5, 1],
    extrapolateLeft: 'extend',
    extrapolateRight: 'clamp',
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight * 0.1],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, headerHeight / 2],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });

  const backBtnOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight * 0.5],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {!showPlayer ? (
        <Animated.View
          style={[
            styles.header,
            { transform: [{ translateY: headerTranslate }] },
          ]}
        >
          <Animated.Image
            source={{
              uri:
                yogaData.coverImage ||
                'https://via.placeholder.com/600x400.png?text=Yoga',
            }}
            style={[styles.headerImage, { transform: [{ scale: imageScale }] }]}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.85)']}
            style={styles.headerOverlay}
          />
          <Animated.View
            style={[
              styles.headerInfo,
              { transform: [{ translateY: titleTranslateY }] },
            ]}
          >
            <View style={styles.badgeRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {yogaData.category?.replace(/_/g, ' ') || 'Yoga'}
                </Text>
              </View>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: 'rgba(255,255,255,0.2)' },
                ]}
              >
                <Text style={styles.categoryText}>
                  {yogaData.difficultyLevel || 'BEGINNER'}
                </Text>
              </View>
            </View>
            <Text style={styles.mainTitle}>{yogaData.title}</Text>
          </Animated.View>
        </Animated.View>
      ) : (
        <View
          style={[
            styles.videoContainer,
            { height: totalVideoAreaHeight, paddingTop: topInset },
          ]}
        >
          <TouchableWithoutFeedback onPress={toggleControls}>
            <View style={styles.videoWrapper}>
              <Video
                source={{ uri: yogaData.video }}
                style={styles.videoPlayer}
                resizeMode="contain"
                paused={paused}
                onProgress={handleProgress}
                onLoad={handleLoad}
                onEnd={handleVideoEnd}
                ignoreSilentSwitch="ignore"
              />
              {showControls && (
                <View style={styles.controlsOverlay}>
                  <View style={styles.topControls}>
                    <TouchableOpacity
                      style={styles.videoBackButton}
                      onPress={() => {
                        setShowPlayer(false);
                        setPaused(true);
                      }}
                      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    >
                      <MaterialCommunityIcons
                        name="chevron-down"
                        size={36}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.centerControls}>
                    <TouchableOpacity
                      onPress={togglePlayPause}
                      style={styles.playPauseButton}
                    >
                      <MaterialCommunityIcons
                        name={paused ? 'play' : 'pause'}
                        size={48}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.bottomControls}>
                    <Text style={styles.timeText}>
                      {formatTime(currentTime)}
                    </Text>
                    <View style={styles.progressBarBackground}>
                      <View
                        style={[
                          styles.progressBarForeground,
                          {
                            width: `${(currentTime / (duration || 1)) * 100}%`,
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.progressScrubber,
                          { left: `${(currentTime / (duration || 1)) * 100}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.timeText}>{formatTime(duration)}</Text>
                  </View>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      )}

      {!showPlayer && (
        <Animated.View
          style={[styles.backButtonWrapper, { opacity: backBtnOpacity }]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.colors.white}
            />
          </TouchableOpacity>
        </Animated.View>
      )}

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          showPlayer && { paddingTop: totalVideoAreaHeight },
        ]}
      >
        <Animated.View style={[styles.contentArea, { opacity: contentFade }]}>
          <View style={styles.glassStatsRow}>
            <View style={styles.statItem}>
              <View style={styles.statIconCircle}>
                <MaterialCommunityIcons
                  name="clock-fast"
                  size={20}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={styles.statValue}>
                {yogaData.durationMinutes || 0}m
              </Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={styles.statIconCircle}>
                <MaterialCommunityIcons
                  name="arm-flex"
                  size={20}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={styles.statValue}>
                {yogaData.targetAreas?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Areas</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={styles.statIconCircle}>
                <MaterialCommunityIcons
                  name="yoga"
                  size={20}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={styles.statValue}>
                {yogaData.equipmentNeeded?.[0] || 'Mat'}
              </Text>
              <Text style={styles.statLabel}>Tool</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionIndicator} />
            <Text style={styles.sectionTitle}>Overview</Text>
          </View>
          <Text style={styles.descriptionText}>
            {yogaData.description || 'No description available'}
          </Text>

          {yogaData.targetAreas && yogaData.targetAreas.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIndicator} />
                <Text style={styles.sectionTitle}>Focus Areas</Text>
              </View>
              <View style={styles.tagGrid}>
                {yogaData.targetAreas.map((area, index) => (
                  <View key={index} style={styles.areaTag}>
                    <Text style={styles.areaTagText}>{area}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {yogaData.instructions && yogaData.instructions.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIndicator} />
                <Text style={styles.sectionTitle}>Step by Step Guide</Text>
              </View>
              {yogaData.instructions.map((step, idx) => (
                <View key={idx} style={styles.instructionStep}>
                  <View style={styles.stepNumberContainer}>
                    <LinearGradient
                      colors={[theme.colors.primary, theme.colors.secondary]}
                      style={styles.stepGradient}
                    >
                      <Text style={styles.stepNumberText}>
                        {step.stepNumber}
                      </Text>
                    </LinearGradient>
                    {idx !== yogaData.instructions.length - 1 && (
                      <View style={styles.stepLine} />
                    )}
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepDescription}>{step.text}</Text>
                  </View>
                </View>
              ))}
            </>
          )}

          {yogaData.benefits && yogaData.benefits.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIndicator} />
                <Text style={styles.sectionTitle}>Key Benefits</Text>
              </View>
              {yogaData.benefits.map((benefit, i) => (
                <View key={i} style={styles.benefitRow}>
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={22}
                    color={theme.colors.secondary}
                  />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </>
          )}

          <View style={{ height: height * 0.15 }} />
        </Animated.View>
      </Animated.ScrollView>

      {yogaData.video && !showPlayer && (
        <View style={styles.stickyFooter}>
          <TouchableOpacity
            style={styles.primaryActionButton}
            activeOpacity={0.85}
            onPress={() => {
              setShowPlayer(true);
              setPaused(false);
            }}
          >
            <LinearGradient
              colors={[theme.colors.primary, '#1a3a5f']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <MaterialCommunityIcons
                name="play-circle"
                size={24}
                color={theme.colors.white}
              />
              <Text style={styles.actionButtonText}>Start Practice Video</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default YogaDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background || '#F8F9FB',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: width * 0.08,
  },

  errorText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.bold,
    color: theme.colors.primary,
    marginTop: height * 0.02,
    marginBottom: height * 0.03,
    textAlign: 'center',
  },

  errorButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: width * 0.1,
    paddingVertical: height * 0.018,
    borderRadius: width * 0.08,
  },

  errorButtonText: {
    color: theme.colors.white,
    fontFamily: theme.typography.bold,
    fontSize: theme.typography.fontSize.sm,
  },

  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.45,
    overflow: 'hidden',
    zIndex: 1,
  },

  headerImage: {
    width: '100%',
    height: '100%',
  },

  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  headerInfo: {
    position: 'absolute',
    bottom: height * 0.06,
    left: width * 0.06,
    right: width * 0.06,
  },

  badgeRow: {
    flexDirection: 'row',
    marginBottom: height * 0.015,
  },

  categoryBadge: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.008,
    borderRadius: width * 0.05,
    backgroundColor: theme.colors.secondary,
    marginRight: width * 0.02,
  },

  categoryText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.bold,
    textTransform: 'uppercase',
  },

  mainTitle: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.black,
    letterSpacing: -0.5,
  },

  backButtonWrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? height * 0.07 : height * 0.05,
    left: width * 0.05,
    zIndex: 10,
  },

  backButton: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000',
    zIndex: 100,
  },

  videoWrapper: {
    width: width,
    height: width * (9 / 16),
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },

  videoPlayer: {
    ...StyleSheet.absoluteFillObject,
  },

  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.02,
    zIndex: 101,
  },

  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: height * 0.015,
    zIndex: 102,
  },

  videoBackButton: {
    padding: width * 0.02,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: width * 0.05,
  },

  centerControls: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  playPauseButton: {
    width: width * 0.18,
    height: width * 0.18,
    borderRadius: width * 0.09,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: height * 0.01,
  },

  progressBarBackground: {
    flex: 1,
    height: height * 0.006,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: width * 0.04,
    borderRadius: width * 0.01,
    position: 'relative',
    justifyContent: 'center',
  },

  progressBarForeground: {
    height: '100%',
    backgroundColor: theme.colors.secondary || '#FF0000',
    borderRadius: width * 0.01,
    position: 'absolute',
    left: 0,
  },

  progressScrubber: {
    width: width * 0.035,
    height: width * 0.035,
    borderRadius: (width * 0.035) / 2,
    backgroundColor: theme.colors.secondary || '#FF0000',
    position: 'absolute',
    marginLeft: -(width * 0.0175),
  },

  timeText: {
    color: '#FFF',
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.medium,
    width: width * 0.12,
    textAlign: 'center',
  },

  scrollContent: {
    paddingTop: height * 0.49,
  },

  contentArea: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: width * 0.1,
    borderTopRightRadius: width * 0.1,
    paddingTop: height * 0.04,
    paddingHorizontal: width * 0.06,
    minHeight: height,
  },

  glassStatsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: width * 0.06,
    paddingVertical: height * 0.025,
    marginBottom: height * 0.04,
    marginTop: -height * 0.08,
    ...theme.elevation.depth3,
    alignItems: 'center',
    justifyContent: 'space-around',
    zIndex: 20,
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },

  statIconCircle: {
    width: width * 0.11,
    height: width * 0.11,
    borderRadius: width * 0.055,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.01,
  },

  statValue: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.bold,
    color: theme.colors.primary,
  },

  statLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.medium,
    color: theme.colors.gray,
    textTransform: 'uppercase',
  },

  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: theme.colors.border || '#EEEEEE',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
    marginTop: height * 0.015,
  },

  sectionIndicator: {
    width: width * 0.012,
    height: height * 0.025,
    backgroundColor: theme.colors.secondary,
    borderRadius: width * 0.005,
    marginRight: width * 0.03,
  },

  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.bold,
    color: theme.colors.primary,
  },

  descriptionText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.medium,
    color: theme.colors.textSecondary || '#555555',
    lineHeight: height * 0.032,
    marginBottom: height * 0.04,
  },

  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: height * 0.04,
  },

  areaTag: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.012,
    borderRadius: width * 0.04,
    marginRight: width * 0.03,
    marginBottom: height * 0.015,
    borderWidth: 1,
    borderColor: theme.colors.border || '#E8E8E8',
  },

  areaTagText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.primary,
  },

  instructionStep: {
    flexDirection: 'row',
    marginBottom: height * 0.005,
  },

  stepNumberContainer: {
    alignItems: 'center',
    width: width * 0.12,
  },

  stepGradient: {
    width: width * 0.09,
    height: width * 0.09,
    borderRadius: width * 0.045,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  stepNumberText: {
    color: theme.colors.white,
    fontFamily: theme.typography.bold,
    fontSize: theme.typography.fontSize.sm,
  },

  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.border || '#E0E0E0',
    marginVertical: height * 0.008,
  },

  stepContent: {
    flex: 1,
    paddingLeft: width * 0.04,
    paddingBottom: height * 0.04,
    paddingTop: height * 0.005,
  },

  stepDescription: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.medium,
    color: theme.colors.primary,
    lineHeight: height * 0.03,
  },

  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: width * 0.05,
    borderRadius: width * 0.05,
    marginBottom: height * 0.02,
    borderWidth: 1,
    borderColor: theme.colors.border || '#F0F0F0',
  },

  benefitText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.textPrimary || '#444',
    marginLeft: width * 0.04,
  },

  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.02,
    paddingBottom: Platform.OS === 'ios' ? height * 0.05 : height * 0.03,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },

  primaryActionButton: {
    borderRadius: width * 0.06,
    overflow: 'hidden',
    ...theme.elevation.depth4,
  },

  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.02,
  },

  actionButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.bold,
    marginLeft: width * 0.03,
  },
});
