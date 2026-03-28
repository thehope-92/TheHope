/**
 * @file AboutUs.jsx
 * @module Screens/AboutUs
 * @description
 * An ultra-enhanced promotional screen for NiDrip Central Electronics.
 * * Responsibilities:
 * - Communicates brand mission and "Heart of the Home" philosophy.
 * - Displays core values in a high-performance grid layout.
 * - Highlights authorized brand partnerships with premium styling.
 * * Features:
 * - Dynamic scaling using screen dimensions and theme-based typography.
 * - Animatable entry transitions for a modern, fluid user experience.
 * - Clean, card-based UI optimized for readability and interaction.
 */

import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { theme } from '../../../styles/Themes';
import * as Animatable from 'react-native-animatable';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../../utilities/custom-components/header/header/Header';

const { width, height } = Dimensions.get('window');

const AboutUs = () => {
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setTranslucent(true)
    StatusBar.setBackgroundColor('transparent');
  }, []);
  const coreValues = [
    {
      icon: 'clock-fast',
      title: 'Time Efficient',
      text: 'Modern appliances designed to perform tasks faster and more efficiently',
    },
    {
      icon: 'leaf',
      title: 'Energy Saving',
      text: 'Features like programmable settings and energy efficiency make your routine smoother',
    },
    {
      icon: 'shield-check',
      title: 'Tested Quality',
      text: 'Every appliance is tested for performance and durability before reaching your home',
    },
    {
      icon: 'truck-delivery',
      title: 'Fast Delivery',
      text: 'Orders are delivered quickly and safely directly to your doorstep',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerContainer}>
        <Header
          logo={require('../../../assets/logo/logo.png')}
          title="About Our Store"
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animatable.View
          animation="fadeIn"
          duration={1200}
          style={styles.heroGradient}
        >
          <Text style={styles.heroTitle}>The Heart of Every Home</Text>
          <Text style={styles.heroSubtitle}>
            NiDrip Central Electronics is your go-to destination for
            high-quality kitchen appliances that combine efficiency, style, and
            affordability
          </Text>
        </Animatable.View>

        <View style={styles.contentWrapper}>
          <Animatable.View
            animation="fadeInUp"
            delay={200}
            style={styles.mainCard}
          >
            <View style={styles.badge}>
              <Text style={styles.badgeText}>OUR MISSION</Text>
            </View>
            <Text style={styles.sectionBody}>
              In today’s fast-paced world, having a well-equipped kitchen is
              more than just a luxury—it’s a necessity making daily life easier
              by providing tools that save time and enhance convenience.
            </Text>
          </Animatable.View>

          <Text style={styles.sectionLabel}>Why Choose NiDrip Central?</Text>

          <View style={styles.grid}>
            {coreValues.map((item, index) => (
              <Animatable.View
                key={index}
                animation="zoomIn"
                delay={300 + index * 100}
                style={styles.gridItem}
              >
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={width * 0.065}
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={styles.gridTitle}>{item.title}</Text>
                <Text style={styles.gridText}>{item.text}</Text>
              </Animatable.View>
            ))}
          </View>

          <Animatable.View
            animation="fadeInLeft"
            delay={700}
            style={styles.brandSection}
          >
            <Text style={styles.brandTitle}>Our Trusted Partners</Text>
            <View style={styles.brandRow}>
              {['Brenville', 'Sharp', 'Beko', 'Hotpoint', 'Indesit'].map(
                (brand, i) => (
                  <View key={i} style={styles.brandTag}>
                    <Text style={styles.brandTagText}>{brand}</Text>
                  </View>
                ),
              )}
            </View>
          </Animatable.View>

          <Animatable.View
            animation="fadeInUp"
            delay={900}
            style={styles.enhancedFooter}
          >
            <MaterialCommunityIcons
              name="star-face"
              size={width * 0.08}
              color={theme.colors.white}
            />
            <Text style={styles.footerTitle}>
              Shopping That Enhances Your Lifestyle
            </Text>
            <Text style={styles.footerDescription}>
              From small kitchen gadgets to large appliances, we provide
              everything under one roof at prices that suit every budget.
            </Text>
            <TouchableOpacity style={styles.shopNowBtn} activeOpacity={0.9}>
              <Text style={styles.shopNowText}>Start Shopping</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={width * 0.05}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AboutUs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },  

  scrollContent: {
    paddingBottom: height * 0.04,
  },

  heroGradient: {
    backgroundColor: theme.colors.primary,
    paddingTop: height * 0.06,
    paddingBottom: height * 0.08,
    paddingHorizontal: width * 0.06,
    borderBottomLeftRadius: theme.borderRadius.circle,
    borderBottomRightRadius: theme.borderRadius.circle,
    alignItems: 'center',
  },

  heroTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.bold,
    color: theme.colors.white,
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  heroSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.regular,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginTop: height * 0.015,
    lineHeight: height * 0.028,
  },

  contentWrapper: {
    paddingHorizontal: width * 0.05,
    marginTop: -height * 0.05,
  },

  mainCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.large,
    padding: width * 0.06,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: height * 0.03,
  },

  badge: {
    backgroundColor: `${theme.colors.primary}15`,
    alignSelf: 'flex-start',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.006,
    borderRadius: theme.borderRadius.medium,
    marginBottom: height * 0.015,
  },

  badgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.bold,
    color: theme.colors.primary,
    letterSpacing: 1.2,
  },

  sectionBody: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.regular,
    color: '#334155',
    lineHeight: height * 0.028,
    textAlign: 'justify',
  },

  sectionLabel: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.bold,
    color: '#0F172A',
    marginBottom: height * 0.02,
    paddingLeft: width * 0.01,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  gridItem: {
    backgroundColor: theme.colors.white,
    width: (width - width * 0.15) / 2,
    borderRadius: theme.borderRadius.large,
    padding: width * 0.04,
    marginBottom: height * 0.02,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },

  iconCircle: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: (width * 0.12) / 2,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.015,
  },

  gridTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.bold,
    color: '#1E293B',
    marginBottom: height * 0.008,
  },

  gridText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.regular,
    color: '#64748B',
    lineHeight: height * 0.022,
  },

  brandSection: {
    marginVertical: height * 0.02,
  },

  brandTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.bold,
    color: '#0F172A',
    marginBottom: height * 0.015,
  },

  brandRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  brandTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
    borderRadius: theme.borderRadius.medium,
    marginRight: width * 0.025,
    marginBottom: height * 0.012,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },

  brandTagText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.primary,
  },

  enhancedFooter: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.large,
    padding: width * 0.08,
    alignItems: 'center',
    marginTop: height * 0.02,
  },

  footerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.bold,
    color: theme.colors.white,
    textAlign: 'center',
    marginTop: height * 0.015,
  },

  footerDescription: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.regular,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: height * 0.01,
    lineHeight: height * 0.025,
    marginBottom: height * 0.03,
  },

  shopNowBtn: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.018,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    elevation: 4,
  },

  shopNowText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.bold,
    color: theme.colors.primary,
    marginRight: width * 0.02,
  },
});
