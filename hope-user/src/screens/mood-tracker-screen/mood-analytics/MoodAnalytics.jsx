/**
 * @file MoodAnalytics.jsx
 * @module Components/MoodAnalytics
 * @description
 * Ultra-enhanced Mood Analytics component with beautiful animations and professional data visualization.
 * Displays mood trends, insights, emotional patterns, and statistical analysis.
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getMoodAnalytics } from '../../../redux/slices/mood.slice';
import * as Animatable from 'react-native-animatable';
import { theme } from '../../../styles/Themes';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

// Custom Progress Bar Component
const ProgressBar = ({ value, maxValue = 10, color, label, icon }) => {
  const percentage = (value / maxValue) * 100;

  return (
    <Animatable.View
      animation="fadeInRight"
      duration={800}
      style={styles.progressContainer}
    >
      <View style={styles.progressHeader}>
        <View style={styles.progressLabelContainer}>
          <MaterialCommunityIcons name={icon} size={20} color={color} />
          <Text style={styles.progressLabel}>{label}</Text>
        </View>
        <Text style={styles.progressValue}>{value.toFixed(1)}/10</Text>
      </View>
      <View style={styles.progressBarBackground}>
        <Animatable.View
          animation="slideInLeft"
          duration={1000}
          delay={200}
          style={[
            styles.progressBarFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        >
          <LinearGradient
            colors={[color, color + 'CC']}
            style={styles.progressGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animatable.View>
      </View>
    </Animatable.View>
  );
};

// Mood Distribution Card
const MoodDistribution = ({ distribution }) => {
  const moodColors = {
    OVERJOYED: '#FFD93D',
    HAPPY: '#6BCB77',
    NEUTRAL: '#4D96FF',
    SAD: '#9B5DE5',
    DEPRESSED: '#F15BB5',
    STRESSED: '#FF6B6B',
    CALM: '#00BBF9',
    ANGRY: '#E15554',
    ANXIOUS: '#FF9F1C',
  };

  const getMoodIcon = mood => {
    const icons = {
      OVERJOYED: 'emoticon-excited-outline',
      HAPPY: 'emoticon-happy-outline',
      NEUTRAL: 'emoticon-neutral-outline',
      SAD: 'emoticon-sad-outline',
      DEPRESSED: 'emoticon-cry-outline',
      STRESSED: 'emoticon-angry-outline',
      CALM: 'emoticon-cool-outline',
      ANGRY: 'emoticon-angry-outline',
      ANXIOUS: 'emoticon-frown-outline',
    };
    return icons[mood] || 'emoticon-outline';
  };

  // Sort distribution by count (highest first)
  const sortedDistribution = Object.entries(distribution).sort(
    (a, b) => b[1] - a[1],
  );
  const maxCount = Math.max(...Object.values(distribution));

  return (
    <Animatable.View
      animation="fadeInUp"
      duration={800}
      delay={400}
      style={styles.distributionCard}
    >
      <Text style={styles.cardTitle}>Mood Distribution</Text>
      <Text style={styles.cardSubtitle}>
        Your emotional landscape over time
      </Text>

      {sortedDistribution.map(([mood, count], index) => (
        <Animatable.View
          key={mood}
          animation="fadeInLeft"
          duration={600}
          delay={500 + index * 100}
          style={styles.distributionItem}
        >
          <View style={styles.distributionLeft}>
            <MaterialCommunityIcons
              name={getMoodIcon(mood)}
              size={24}
              color={moodColors[mood] || theme.colors.primary}
            />
            <Text style={styles.distributionLabel}>{mood}</Text>
          </View>
          <View style={styles.distributionRight}>
            <Text style={styles.distributionCount}>{count}</Text>
            <View style={styles.distributionBarContainer}>
              <View
                style={[
                  styles.distributionBar,
                  {
                    width: `${(count / maxCount) * 100}%`,
                    backgroundColor: moodColors[mood] || theme.colors.primary,
                  },
                ]}
              />
            </View>
          </View>
        </Animatable.View>
      ))}
    </Animatable.View>
  );
};

// Insight Card Component
const InsightCard = ({ icon, title, description, color, delay }) => (
  <Animatable.View
    animation="fadeInUp"
    duration={800}
    delay={delay}
    style={styles.insightCard}
  >
    <LinearGradient
      colors={[color + '20', color + '08']}
      style={styles.insightGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View
        style={[styles.insightIconContainer, { backgroundColor: color + '20' }]}
      >
        <MaterialCommunityIcons name={icon} size={28} color={color} />
      </View>
      <View style={styles.insightContent}>
        <Text style={styles.insightTitle}>{title}</Text>
        <Text style={styles.insightDescription}>{description}</Text>
      </View>
    </LinearGradient>
  </Animatable.View>
);

// Main Component
const MoodAnalytics = () => {
  const dispatch = useDispatch();
  const { analytics, loading, error } = useSelector(state => state.mood);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    await dispatch(getMoodAnalytics());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  // Process analytics data from backend
  const processedData = useMemo(() => {
    if (!analytics || !Array.isArray(analytics) || analytics.length === 0) {
      return null;
    }

    // Calculate total entries
    const totalEntries = analytics.reduce((sum, item) => sum + item.count, 0);

    // Calculate average intensity
    const totalIntensity = analytics.reduce(
      (sum, item) => sum + item.avgIntensity * item.count,
      0,
    );
    const avgIntensity = totalEntries > 0 ? totalIntensity / totalEntries : 0;

    // Calculate average sleep (if available)
    const totalSleep = analytics.reduce(
      (sum, item) => sum + item.avgSleep * item.count,
      0,
    );
    const avgSleep = totalEntries > 0 ? totalSleep / totalEntries : 0;

    // Create mood distribution object
    const moodDistribution = {};
    analytics.forEach(item => {
      moodDistribution[item._id] = item.count;
    });

    // Determine trend (simple logic based on most frequent mood)
    const mostFrequentMood = analytics.reduce((prev, current) =>
      prev.count > current.count ? prev : current,
    );

    let overallTrend = 'stable';
    if (
      mostFrequentMood._id === 'OVERJOYED' ||
      mostFrequentMood._id === 'HAPPY'
    ) {
      overallTrend = 'improving';
    } else if (
      mostFrequentMood._id === 'DEPRESSED' ||
      mostFrequentMood._id === 'SAD' ||
      mostFrequentMood._id === 'STRESSED'
    ) {
      overallTrend = 'declining';
    }

    // Generate insights based on data
    const insights = [];

    if (avgIntensity > 7) {
      insights.push({
        icon: 'emoticon-excited-outline',
        title: 'High Energy Pattern',
        description:
          "You're experiencing high emotional intensity. Consider channeling this energy into creative activities.",
        color: '#FFD93D',
      });
    } else if (avgIntensity < 4) {
      insights.push({
        icon: 'emoticon-neutral-outline',
        title: 'Low Energy Pattern',
        description:
          'Your mood intensity has been low. Try engaging in activities that bring you joy.',
        color: '#9B5DE5',
      });
    }

    if (mostFrequentMood._id === 'HAPPY') {
      insights.push({
        icon: 'emoticon-happy-outline',
        title: 'Positive Trend',
        description:
          'Happiness is your most common mood. Keep up the great work!',
        color: '#6BCB77',
      });
    } else if (mostFrequentMood._id === 'STRESSED') {
      insights.push({
        icon: 'meditation',
        title: 'Stress Management',
        description:
          'Stress appears frequently. Consider incorporating mindfulness exercises into your routine.',
        color: '#FF6B6B',
      });
    }

    // Generate patterns
    const patterns = [];
    if (analytics.length > 0) {
      patterns.push(`Your most frequent mood is ${mostFrequentMood._id}`);
      patterns.push(
        `Average mood intensity is ${avgIntensity.toFixed(1)} out of 10`,
      );
      if (avgSleep > 0) {
        patterns.push(
          `Average sleep quality is ${avgSleep.toFixed(1)} out of 10`,
        );
      }
    }

    // Generate recommendations
    const recommendations = [];
    if (avgIntensity < 5) {
      recommendations.push(
        'Try mood-boosting activities like exercise or listening to uplifting music',
      );
    }
    if (
      mostFrequentMood._id === 'STRESSED' ||
      mostFrequentMood._id === 'ANXIOUS'
    ) {
      recommendations.push(
        'Practice deep breathing exercises for 5 minutes daily',
      );
    }
    if (mostFrequentMood._id === 'HAPPY') {
      recommendations.push(
        'Share your positive energy with others - it can boost your mood even more',
      );
    }
    recommendations.push(
      'Continue tracking your mood daily to see patterns and improvements',
    );

    return {
      totalEntries,
      averageMetrics: {
        averageIntensity: avgIntensity,
        averageEnergy: avgSleep || avgIntensity,
      },
      trends: {
        overallTrend,
      },
      moodDistribution,
      insights,
      patterns,
      recommendations,
    };
  }, [analytics]);

  if (loading && !processedData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Analyzing your mood patterns...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <Animatable.View
        animation="fadeIn"
        duration={600}
        style={styles.errorContainer}
      >
        <MaterialCommunityIcons
          name="cloud-off-outline"
          size={80}
          color="#FFFFFF"
        />
        <Text style={styles.errorTitle}>Unable to Load Analytics</Text>
        <Text style={styles.errorText}>
          {error.message ||
            "We're having trouble fetching your mood insights. Pull down to try again."}
        </Text>
      </Animatable.View>
    );
  }

  if (!processedData || processedData.totalEntries === 0) {
    return (
      <Animatable.View
        animation="fadeInUp"
        duration={600}
        style={styles.emptyContainer}
      >
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={2000}
          style={styles.emptyIconWrapper}
        >
          <MaterialCommunityIcons
            name="chart-line"
            size={width * 0.2}
            color="#FFFFFF"
          />
        </Animatable.View>
        <Text style={styles.emptyTitle}>No Data Yet</Text>
        <Text style={styles.emptyDescription}>
          Start tracking your mood to see beautiful insights and patterns
          emerge.
        </Text>
      </Animatable.View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#FFFFFF"
        />
      }
    >
      {/* Header Section */}
      <Animatable.View
        animation="fadeInDown"
        duration={800}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Mood Analytics</Text>
        <Text style={styles.headerSubtitle}>
          {processedData.totalEntries} entries • Based on your tracking
        </Text>
      </Animatable.View>

      {/* Key Metrics Cards */}
      <View style={styles.metricsGrid}>
        <Animatable.View
          animation="zoomIn"
          duration={600}
          delay={200}
          style={styles.metricCard}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
            style={styles.metricGradient}
          >
            <MaterialCommunityIcons
              name="emoticon-happy-outline"
              size={32}
              color="#FFD93D"
            />
            <Text style={styles.metricValue}>
              {processedData.averageMetrics.averageIntensity.toFixed(1)}
            </Text>
            <Text style={styles.metricLabel}>Avg. Mood Intensity</Text>
          </LinearGradient>
        </Animatable.View>

        <Animatable.View
          animation="zoomIn"
          duration={600}
          delay={300}
          style={styles.metricCard}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
            style={styles.metricGradient}
          >
            <MaterialCommunityIcons
              name="flash-outline"
              size={32}
              color="#6BCB77"
            />
            <Text style={styles.metricValue}>
              {processedData.averageMetrics.averageEnergy.toFixed(1)}
            </Text>
            <Text style={styles.metricLabel}>Avg. Energy Level</Text>
          </LinearGradient>
        </Animatable.View>

        <Animatable.View
          animation="zoomIn"
          duration={600}
          delay={400}
          style={styles.metricCard}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
            style={styles.metricGradient}
          >
            <MaterialCommunityIcons
              name={
                processedData.trends.overallTrend === 'improving'
                  ? 'trending-up'
                  : processedData.trends.overallTrend === 'declining'
                  ? 'trending-down'
                  : 'trending-neutral'
              }
              size={32}
              color={
                processedData.trends.overallTrend === 'improving'
                  ? '#6BCB77'
                  : processedData.trends.overallTrend === 'declining'
                  ? '#FF6B6B'
                  : '#FFD93D'
              }
            />
            <Text
              style={[
                styles.metricValue,
                {
                  color:
                    processedData.trends.overallTrend === 'improving'
                      ? '#6BCB77'
                      : processedData.trends.overallTrend === 'declining'
                      ? '#FF6B6B'
                      : '#FFD93D',
                },
              ]}
            >
              {processedData.trends.overallTrend === 'improving'
                ? '↑'
                : processedData.trends.overallTrend === 'declining'
                ? '↓'
                : '→'}
            </Text>
            <Text style={styles.metricLabel}>Overall Trend</Text>
          </LinearGradient>
        </Animatable.View>
      </View>

      {/* Average Metrics Section */}
      <Animatable.View
        animation="fadeInUp"
        duration={800}
        delay={500}
        style={styles.section}
      >
        <Text style={styles.sectionTitle}>Average Metrics</Text>
        <View style={styles.metricsContainer}>
          <ProgressBar
            value={processedData.averageMetrics.averageIntensity}
            maxValue={10}
            color="#FFD93D"
            label="Mood Intensity"
            icon="emoticon-happy-outline"
          />
          <ProgressBar
            value={processedData.averageMetrics.averageEnergy}
            maxValue={10}
            color="#6BCB77"
            label="Energy Level"
            icon="flash-outline"
          />
        </View>
      </Animatable.View>

      {/* AI-Powered Insights */}
      {processedData.insights && processedData.insights.length > 0 && (
        <Animatable.View
          animation="fadeInUp"
          duration={800}
          delay={600}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>✨ AI Insights</Text>
          <View style={styles.insightsContainer}>
            {processedData.insights.map((insight, index) => (
              <InsightCard
                key={index}
                icon={insight.icon}
                title={insight.title}
                description={insight.description}
                color={insight.color}
                delay={700 + index * 100}
              />
            ))}
          </View>
        </Animatable.View>
      )}

      {/* Mood Distribution */}
      {processedData.moodDistribution &&
        Object.keys(processedData.moodDistribution).length > 0 && (
          <MoodDistribution distribution={processedData.moodDistribution} />
        )}

      {/* Emotional Pattern Analysis */}
      {processedData.patterns && processedData.patterns.length > 0 && (
        <Animatable.View
          animation="fadeInUp"
          duration={800}
          delay={800}
          style={styles.patternsCard}
        >
          <Text style={styles.cardTitle}>🔄 Emotional Patterns</Text>
          {processedData.patterns.map((pattern, index) => (
            <Animatable.View
              key={index}
              animation="fadeInLeft"
              duration={600}
              delay={900 + index * 100}
              style={styles.patternItem}
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={20}
                color="#FFD93D"
              />
              <Text style={styles.patternText}>{pattern}</Text>
            </Animatable.View>
          ))}
        </Animatable.View>
      )}

      {/* Recommendation Section */}
      {processedData.recommendations &&
        processedData.recommendations.length > 0 && (
          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={1000}
            style={styles.recommendationsCard}
          >
            <Text style={styles.cardTitle}>💡 Recommendations</Text>
            {processedData.recommendations.map((recommendation, index) => (
              <Animatable.View
                key={index}
                animation="fadeInLeft"
                duration={600}
                delay={1100 + index * 100}
                style={styles.recommendationItem}
              >
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={20}
                  color="#6BCB77"
                />
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </Animatable.View>
            ))}
          </Animatable.View>
        )}
    </ScrollView>
  );
};

export default MoodAnalytics;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: height * 0.25,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.2,
  },

  loadingText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.regular,
    color: '#FFFFFF',
    marginTop: height * 0.02,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.2,
    paddingHorizontal: width * 0.1,
  },

  errorTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.bold,
    color: '#FFFFFF',
    marginTop: height * 0.02,
    marginBottom: height * 0.01,
  },

  errorText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.regular,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },

  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.15,
  },

  emptyIconWrapper: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: width * 0.125,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: height * 0.03,
  },

  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.bold,
    color: '#FFFFFF',
    marginBottom: height * 0.01,
  },

  emptyDescription: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.regular,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    paddingHorizontal: width * 0.1,
  },

  header: {
    marginBottom: height * 0.03,
    marginTop: height * 0.02,
  },

  headerTitle: {
    fontSize: theme.typography.fontSize.xxl,
    fontFamily: theme.typography.bold,
    color: '#FFFFFF',
    marginBottom: height * 0.005,
  },

  headerSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.regular,
    color: 'rgba(255,255,255,0.75)',
  },

  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.025,
    gap: width * 0.03,
  },

  metricCard: {
    flex: 1,
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  metricGradient: {
    padding: height * 0.02,
    alignItems: 'center',
  },

  metricValue: {
    fontSize: theme.typography.fontSize.xxxl,
    fontFamily: theme.typography.bold,
    color: '#FFFFFF',
    marginTop: height * 0.01,
  },

  metricLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.medium,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: height * 0.005,
  },

  section: {
    marginBottom: height * 0.03,
  },

  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.semiBold,
    color: '#FFFFFF',
    marginBottom: height * 0.015,
  },

  metricsContainer: {
    gap: height * 0.02,
  },

  progressContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.borderRadius.medium,
    padding: height * 0.015,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.01,
  },

  progressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.02,
  },

  progressLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.medium,
    color: '#FFFFFF',
  },

  progressValue: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.bold,
    color: '#FFFFFF',
  },

  progressBarBackground: {
    height: height * 0.008,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: theme.borderRadius.circle,
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    borderRadius: theme.borderRadius.circle,
    overflow: 'hidden',
  },

  progressGradient: {
    flex: 1,
  },

  insightsContainer: {
    gap: height * 0.015,
  },

  insightCard: {
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
  },

  insightGradient: {
    padding: height * 0.02,
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.04,
  },

  insightIconContainer: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
  },

  insightContent: {
    flex: 1,
  },

  insightTitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.semiBold,
    color: '#FFFFFF',
    marginBottom: height * 0.005,
  },

  insightDescription: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.regular,
    color: 'rgba(255,255,255,0.85)',
  },

  distributionCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.borderRadius.large,
    padding: height * 0.02,
    marginBottom: height * 0.025,
  },

  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.semiBold,
    color: '#FFFFFF',
    marginBottom: height * 0.005,
  },

  cardSubtitle: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.regular,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: height * 0.02,
  },

  distributionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.015,
  },

  distributionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.03,
    width: '35%',
  },

  distributionLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.medium,
    color: '#FFFFFF',
  },

  distributionRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.03,
  },

  distributionCount: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.bold,
    color: '#FFFFFF',
    minWidth: width * 0.08,
  },

  distributionBarContainer: {
    flex: 1,
    height: height * 0.008,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: theme.borderRadius.circle,
    overflow: 'hidden',
  },

  distributionBar: {
    height: '100%',
    borderRadius: theme.borderRadius.circle,
  },

  patternsCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.borderRadius.large,
    padding: height * 0.02,
    marginBottom: height * 0.025,
  },

  patternItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.03,
    marginBottom: height * 0.012,
  },

  patternText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.regular,
    color: '#FFFFFF',
  },

  recommendationsCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.borderRadius.large,
    padding: height * 0.02,
  },

  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.03,
    marginBottom: height * 0.012,
  },

  recommendationText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.regular,
    color: '#FFFFFF',
  },
});
