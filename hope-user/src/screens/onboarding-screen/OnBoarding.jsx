/**
 * @file OnBoarding.js
 * @module OnBoarding
 * @description
 * Ultra-enhanced, modern onboarding screen for the Mental Health & Wellness app.
 * Features dynamic color-changing background, domed bottom card UI, custom typography highlighting,
 * smooth scroll interpolations, animated pagination dots, dynamic action button that expands on the final slide,
 * skip functionality, and enhanced visual effects with shadows and refined animations.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Dimensions,
  Animated,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../styles/Themes';
import Button from '../../utilities/custom-components/button/Button.utility';

const { width, height } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: '1',
    titlePart1: 'Personalize Your Mental\n',
    titleHighlight: 'Health State',
    highlightColor: '#87B07D',
    bgColor: '#E6EFE1',
    animation: require('../../assets/onboarding/onboard-1.json'),
  },
  {
    id: '2',
    titleHighlight: 'Track',
    titlePart2: ' Your Mood\n& Insights',
    highlightColor: '#E98741',
    bgColor: '#FDE4CC',
    animation: require('../../assets/onboarding/onboard-2.json'),
  },
  {
    id: '3',
    titlePart1: 'Mindful ',
    titleHighlight: 'Resources',
    titlePart2: ' That\nMakes You Happy',
    highlightColor: '#F5BE40',
    bgColor: '#FFF5D6',
    animation: require('../../assets/onboarding/onboard-3.json'),
  },
];

const OnBoarding = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const isLastSlide = currentIndex === ONBOARDING_DATA.length - 1;

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent');
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({
        animated: true,
        index: currentIndex + 1,
      });
    } else {
      navigation.replace('Signin');
    }
  };

  const renderItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [50, 0, -50],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slide}>
        <Animated.View
          style={[
            styles.animationWrapper,
            { opacity, transform: [{ scale }, { translateY }] },
          ]}
        >
          <LottieView
            source={item.animation}
            autoPlay
            loop
            style={styles.lottie}
            resizeMode="contain"
          />
        </Animated.View>

        <View style={styles.whiteDome}>
          <Animated.View
            style={[
              styles.textContainer,
              { opacity, transform: [{ translateY }] },
            ]}
          >
            <Text style={styles.title}>
              {item.titlePart1}
              <Text style={{ color: item.highlightColor }}>
                {item.titleHighlight}
              </Text>
              {item.titlePart2}
            </Text>
          </Animated.View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {ONBOARDING_DATA.map((item, index) => {
        const inputRange = [
          (index - 1) * width,
          index * width,
          (index + 1) * width,
        ];
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0, 1, 0],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={item.id}
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: item.bgColor, opacity },
            ]}
          />
        );
      })}

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        keyExtractor={item => item.id}
      />

      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.replace('Signin')}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.staticBottomControls} pointerEvents="box-none">
        <View style={styles.dotsContainer}>
          {ONBOARDING_DATA.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.8, 1.4, 0.8],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 1, 0.4],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    opacity,
                    transform: [{ scale }],
                    backgroundColor:
                      currentIndex === index ? '#8B7355' : '#b1ada8',
                  },
                ]}
              />
            );
          })}
        </View>

        {isLastSlide ? (
          <Button
            title="GET STARTED"
            width={width * 0.85}
            onPress={handleNext}
            backgroundColor="#3E322A"
            textColor={theme.colors.white}
          />
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.actionButton}
            onPress={handleNext}
          >
            <Text style={styles.actionButtonArrow}>→</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default OnBoarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },

  slide: {
    width,
    height,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  animationWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.08,
  },

  lottie: {
    width: width * 1.2,
    height: width * 1.2,
  },

  whiteDome: {
    width: width,
    height: height * 0.45,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: width * 0.25,
    borderTopRightRadius: width * 0.25,
    alignItems: 'center',
    paddingTop: height * 0.06,
    paddingHorizontal: width * 0.1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 15,
  },

  textContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: height * 0.04,
  },

  title: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.bold,
    color: theme.colors.primary,
    textAlign: 'center',
    lineHeight: theme.gap(4.5),
  },

  staticBottomControls: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: height * 0.45,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: height * 0.12,
  },

  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.05,
  },

  dot: {
    width: width * 0.02,
    height: height * 0.011,
    borderRadius: theme.borderRadius.circle,
    marginHorizontal: width * 0.012,
  },

  actionButton: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.075,
    backgroundColor: '#3E322A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },

  actionButtonArrow: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xl,
    marginBottom: height * 0.007,
    fontFamily: theme.typography.bold,
  },

  getStartedButton: {
    width: width * 0.75,
    height: height * 0.06,
    borderRadius: height * 0.03,
    backgroundColor: '#3E322A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },

  getStartedText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  skipButton: {
    position: 'absolute',
    top: height * 0.07,
    right: width * 0.06,
    zIndex: 30,
  },

  skipText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.bold,
    color: theme.colors.tertiary,
  },
});
