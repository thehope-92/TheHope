/**
 * @file Directory.jsx
 * @module Screens/Directory
 * @description Renders the expert directory screen with emergency contacts and navigation options.
 */

import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../styles/Themes';
import Header from '../../utilities/custom-components/header/header/Header';

const { width, height } = Dimensions.get('window');

const EMERGENCIES = [
  {
    id: '1',
    title: 'Call 911',
    icon: 'phone-alert',
    color: '#EF4444',
    subText: 'Immediate medical help',
  },
  {
    id: '2',
    title: 'Text Support',
    icon: 'message-text',
    color: '#22C55E',
    subText: '24/7 Crisis text line',
  },
];

const EXPERTS = [
  {
    id: '3',
    title: 'Crisis Counselor',
    icon: 'account-tie-voice',
    color: '#6366F1',
    subText: 'Professional mental support',
  },
  {
    id: '4',
    title: 'Therapist',
    icon: 'doctor',
    color: '#EC4899',
    subText: 'Long-term session booking',
  },
  {
    id: '5',
    title: 'Support Group',
    icon: 'account-group',
    color: '#F59E0B',
    subText: 'Community peer support',
  },
];

const Directory = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height * 0.04)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const DirectoryCard = ({ item, isEmergency }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.card, isEmergency && styles.emergencyBorder]}
      onPress={() => console.log(`${item.title} pressed`)}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}
      >
        <MaterialCommunityIcons
          name={item.icon}
          size={width * 0.07}
          color={item.color}
        />
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubText}>{item.subText}</Text>
      </View>

      <View style={styles.chevronBox}>
        <MaterialCommunityIcons
          name="chevron-right"
          size={width * 0.05}
          color={theme.colors.gray}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      style={styles.container}
    >
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <View style={styles.headerContainer}>
        <Header
          showTopRow={false}
          showLogo={true}
          showAvatar={false}
          showGreeting={false}
          showTitle={true}
          showSearch={false}
          title="Emergency Help & Expert Directory"
          logo={require('../../assets/logo/logo.png')}
        />
      </View>

      <Animated.View
        style={[
          styles.mainContent,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollPadding}
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Emergencies</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>SOS</Text>
              </View>
            </View>
            {EMERGENCIES.map(item => (
              <DirectoryCard key={item.id} item={item} isEmergency={true} />
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Expert Directory</Text>
            </View>
            {EXPERTS.map(item => (
              <DirectoryCard key={item.id} item={item} />
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
};

export default Directory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  headerContainer: {
    zIndex: 10,
  },

  mainContent: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -height * 0.025,
    overflow: 'hidden',
  },

  scrollPadding: {
    padding: width * 0.06,
    paddingBottom: height * 0.05,
  },

  section: {
    marginBottom: height * 0.035,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: height * 0.02,
    marginTop: height * 0.024,
    paddingLeft: width * 0.01,
  },

  sectionLabel: {
    fontSize: width * 0.045,
    fontFamily: theme.typography.bold,
    color: '#1E293B',
  },

  badge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: width * 0.02,
    paddingVertical: height * 0.003,
    borderRadius: 8,
  },

  badgeText: {
    color: '#EF4444',
    fontSize: width * 0.025,
    fontFamily: theme.typography.bold,
  },

  card: {
    backgroundColor: theme.colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    padding: width * 0.04,
    borderRadius: 24,
    marginBottom: height * 0.015,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },

  emergencyBorder: {
    borderColor: 'rgba(239, 68, 68, 0.1)',
    backgroundColor: '#FFFBFB',
  },

  iconContainer: {
    width: width * 0.13,
    height: width * 0.13,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardInfo: {
    flex: 1,
    marginLeft: width * 0.04,
  },

  cardTitle: {
    fontSize: width * 0.04,
    fontFamily: theme.typography.bold,
    color: '#1E293B',
  },

  cardSubText: {
    fontSize: width * 0.03,
    fontFamily: theme.typography.medium,
    color: '#64748B',
    marginTop: 2,
  },

  chevronBox: {
    width: width * 0.08,
    height: width * 0.08,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
