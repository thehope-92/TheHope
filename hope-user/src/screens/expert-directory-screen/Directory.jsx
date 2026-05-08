/**
 * @file Directory.jsx
 * @module Screens/Directory
 * @description Emergency Help & Expert Directory with Nested Accordions (Pakistan Numbers)
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../styles/Themes';
import Header from '../../utilities/custom-components/header/header/Header';

const { width, height } = Dimensions.get('window');

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ==================== STATIC DATA ====================
const EMERGENCIES = [
  {
    id: '1',
    title: 'Emergency Numbers',
    icon: 'phone-alert',
    color: '#EF4444',
    subText: 'فوری مدد کے لیے',
    isEmergency: true,
    subItems: [
      {
        id: 'e1',
        title: '1122 - Rescue & Emergency',
        number: '1122',
        details: 'Ambulance • Rescue • Fire Brigade\nAll over Pakistan',
      },
      {
        id: 'e2',
        title: '15 - Police Emergency',
        number: '15',
        details: 'Police Help • Crime Reporting',
      },
      {
        id: 'e3',
        title: '16 - Fire Brigade',
        number: '16',
        details: 'Fire Emergency Services',
      },
      {
        id: 'e4',
        title: '115 - Edhi Ambulance',
        number: '115',
        details: 'Edhi Foundation Ambulance Service',
      },
      {
        id: 'e5',
        title: 'Psychological Helpline',
        number: '1166',
        details: 'Mental Health Support Helpline',
      },
    ],
  },
];

const EXPERTS = [
  {
    id: '3',
    title: 'Crisis Counselors',
    icon: 'account-tie-voice',
    color: '#6366F1',
    subText: 'فوری ذہنی صحت کی مدد',
    subItems: [
      {
        id: 'c1',
        title: 'National Mental Health Helpline',
        number: '1166',
        details: '24/7 Free Psychological Support',
      },
      {
        id: 'c2',
        title: 'Kiran Helpline (Women & Children)',
        number: '0800-20000',
        details: 'Domestic Violence & Crisis Support',
      },
    ],
  },
  {
    id: '4',
    title: 'Therapists & Psychologists',
    icon: 'doctor',
    color: '#EC4899',
    subText: 'پیشہ ور مشاورت',
    subItems: [
      {
        id: 't1',
        title: 'Anxiety & Depression Specialists',
        details: 'Licensed Therapists across Pakistan',
      },
      {
        id: 't2',
        title: 'Trauma & Family Counseling',
        details: 'Professional Mental Health Experts',
      },
    ],
  },
  {
    id: '5',
    title: 'Support Groups',
    icon: 'account-group',
    color: '#F59E0B',
    subText: 'پیر سپورٹ گروپس',
    subItems: [
      {
        id: 'g1',
        title: 'Anxiety & Stress Support',
        details: 'Weekly Peer Support Sessions',
      },
      {
        id: 'g2',
        title: 'Grief & Loss Support Group',
        details: 'Emotional Healing Community',
      },
    ],
  },
];

// ==================== MAIN COMPONENT ====================
const Directory = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height * 0.04)).current;

  const [expandedMain, setExpandedMain] = useState(new Set());
  const [expandedSub, setExpandedSub] = useState(new Set());

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

  const toggleMain = id => {
    const newSet = new Set(expandedMain);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedMain(newSet);
  };

  const toggleSub = id => {
    const newSet = new Set(expandedSub);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSub(newSet);
  };

  const MainAccordion = ({ item }) => {
    const isMainExpanded = expandedMain.has(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => toggleMain(item.id)}
        style={[styles.card, item.isEmergency && styles.emergencyBorder]}
      >
        <View style={styles.mainHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: item.color + '15' },
            ]}
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

          <MaterialCommunityIcons
            name={isMainExpanded ? 'chevron-up' : 'chevron-down'}
            size={width * 0.06}
            color={theme.colors.gray}
          />
        </View>

        {isMainExpanded && (
          <View style={styles.subItemsContainer}>
            {item.subItems.map(sub => {
              const isSubExpanded = expandedSub.has(sub.id);
              return (
                <View key={sub.id} style={styles.subItemWrapper}>
                  <TouchableOpacity
                    style={styles.subItem}
                    onPress={() => toggleSub(sub.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.subItemInfo}>
                      <Text style={styles.subItemTitle}>{sub.title}</Text>
                      {sub.number && (
                        <Text style={styles.subItemNumber}>{sub.number}</Text>
                      )}
                    </View>
                    <MaterialCommunityIcons
                      name={isSubExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#64748B"
                    />
                  </TouchableOpacity>

                  {isSubExpanded && (
                    <View style={styles.deepDetails}>
                      <Text style={styles.detailsText}>{sub.details}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </TouchableOpacity>
    );
  };

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
          {/* Emergencies Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Emergencies</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>SOS</Text>
              </View>
            </View>
            {EMERGENCIES.map(item => (
              <MainAccordion key={item.id} item={item} />
            ))}
          </View>

          {/* Expert Directory */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Expert Directory</Text>
            </View>
            {EXPERTS.map(item => (
              <MainAccordion key={item.id} item={item} />
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
    borderTopLeftRadius: width * 0.09,
    borderTopRightRadius: width * 0.09,
    marginTop: -height * 0.025,
    overflow: 'hidden',
  },

  scrollPadding: {
    padding: width * 0.06,
    paddingBottom: height * 0.08,
  },

  section: {
    marginBottom: height * 0.04,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.025,
    marginBottom: height * 0.025,
    marginTop: height * 0.015,
  },

  sectionLabel: {
    fontSize: width * 0.045,
    fontFamily: theme.typography.bold,
    color: '#1E293B',
  },

  badge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.004,
    borderRadius: width * 0.02,
  },

  badgeText: {
    color: '#EF4444',
    fontSize: width * 0.025,
    fontFamily: theme.typography.bold,
  },

  card: {
    backgroundColor: theme.colors.white,
    padding: width * 0.045,
    borderRadius: width * 0.06,
    marginBottom: height * 0.018,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },

  emergencyBorder: {
    borderColor: 'rgba(239, 68, 68, 0.2)',
    backgroundColor: '#FFFBFB',
  },

  mainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconContainer: {
    width: width * 0.13,
    height: width * 0.13,
    borderRadius: width * 0.035,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardInfo: {
    flex: 1,
    marginLeft: width * 0.04,
  },

  cardTitle: {
    fontSize: width * 0.042,
    fontFamily: theme.typography.bold,
    color: '#1E293B',
  },

  cardSubText: {
    fontSize: width * 0.032,
    fontFamily: theme.typography.regular,
    color: '#64748B',
    marginTop: height * 0.006,
  },

  subItemsContainer: {
    marginTop: height * 0.025,
    paddingLeft: width * 0.01,
  },

  subItemWrapper: {
    marginBottom: height * 0.012,
  },

  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: width * 0.035,
    borderRadius: width * 0.04,
  },

  subItemInfo: {
    flex: 1,
  },

  subItemTitle: {
    fontSize: width * 0.037,
    fontFamily: theme.typography.medium,
    color: '#1E293B',
  },

  subItemNumber: {
    fontSize: width * 0.04,
    fontFamily: theme.typography.bold,
    color: '#EF4444',
    marginTop: height * 0.005,
  },

  deepDetails: {
    marginTop: height * 0.015,
    marginLeft: width * 0.03,
    padding: width * 0.035,
    backgroundColor: '#F1F5F9',
    borderRadius: width * 0.035,
  },

  detailsText: {
    fontSize: width * 0.033,
    lineHeight: width * 0.048,
    fontFamily: theme.typography.regular,
    color: '#475569',
  },
});
