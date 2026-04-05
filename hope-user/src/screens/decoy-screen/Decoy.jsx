/**
 * @file Decoy.jsx
 * @module Screens/Decoy
 * @description
 * Ultra-premium social media decoy. Features smooth mounting animations,
 * interactive story carousels, and hidden long-press logic to escape stealth mode.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  RefreshControl,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { verifyStealthPIN } from '../../redux/slices/user.slice';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../styles/Themes';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

// ==================== MOCK DATA ====================

const FAKE_STORIES = [
  {
    id: '1',
    name: 'Your Story',
    image: 'https://picsum.photos/id/1011/150',
    isYour: true,
  },
  { id: '2', name: 'Sara', image: 'https://picsum.photos/id/64/150' },
  { id: '3', name: 'Alex', image: 'https://picsum.photos/id/201/150' },
  { id: '4', name: 'Mia', image: 'https://picsum.photos/id/1005/150' },
  { id: '5', name: 'Jordan', image: 'https://picsum.photos/id/1009/150' },
  { id: '6', name: 'Luna', image: 'https://picsum.photos/id/1025/150' },
];

const FAKE_POSTS = [
  {
    id: '1',
    user: 'TravelWithMia',
    avatar: 'https://picsum.photos/id/1009/100',
    image: 'https://picsum.photos/id/1015/800/1000',
    caption: 'Sunsets never disappoint 🌅 #travel #vibes',
    likes: 12480,
    time: '2h ago',
    location: 'Bali, Indonesia',
  },
  {
    id: '2',
    user: 'UrbanVibes',
    avatar: 'https://picsum.photos/id/201/100',
    image: 'https://picsum.photos/id/133/800/1000',
    caption: 'City lights hit different at night ✨',
    likes: 8750,
    time: '5h ago',
  },
];

// ==================== MAIN COMPONENT ====================

const Decoy = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // States
  const [refreshing, setRefreshing] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const heartAnims = useRef({}).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // --- Handlers ---

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleDoubleTap = useCallback(postId => {
    if (!heartAnims[postId]) heartAnims[postId] = new Animated.Value(0);

    Animated.sequence([
      Animated.spring(heartAnims[postId], {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(heartAnims[postId], {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setLikedPosts(prev => ({ ...prev, [postId]: true }));
  }, []);

  const handleUnlock = () => {
    Alert.prompt(
      'Security Access',
      'Enter authorization code to proceed',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify',
          onPress: async pin => {
            if (!pin) return;
            try {
              await dispatch(verifyStealthPIN(pin)).unwrap();
              navigation.replace('MainTab');
            } catch (err) {
              Alert.alert(
                'Access Denied',
                err?.message || 'Invalid Credentials',
              );
            }
          },
        },
      ],
      'secure-text',
      '',
      'numeric',
    );
  };

  // --- Sub-Renderers ---

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity activeOpacity={0.9} onLongPress={handleUnlock}>
        <Text style={styles.logo}>LUME</Text>
      </TouchableOpacity>
      <View style={styles.headerRight}>
        <Ionicons
          name="add-circle-outline"
          size={28}
          color="#000"
          style={styles.headerIcon}
        />
        <Ionicons
          name="heart-outline"
          size={28}
          color="#000"
          style={styles.headerIcon}
        />
        <Ionicons name="chatbubble-ellipses-outline" size={26} color="#000" />
      </View>
    </View>
  );

  const renderStory = ({ item }) => (
    <View style={styles.storyItem}>
      <LinearGradient
        colors={['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.storyRing}
      >
        <View style={styles.storyInnerRing}>
          <Image source={{ uri: item.image }} style={styles.storyImage} />
        </View>
      </LinearGradient>
      <Text style={styles.storyName} numberOfLines={1}>
        {item.isYour ? 'Your Story' : item.name}
      </Text>
    </View>
  );

  const renderPost = ({ item }) => {
    const isLiked = likedPosts[item.id];
    const isSaved = savedPosts[item.id];
    const heartScale = heartAnims[item.id] || new Animated.Value(0);

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <Image source={{ uri: item.avatar }} style={styles.postAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.postUsername}>{item.user}</Text>
            {item.location && (
              <Text style={styles.postLocation}>{item.location}</Text>
            )}
          </View>
          <Ionicons name="ellipsis-vertical" size={20} color="#666" />
        </View>

        <TouchableWithoutFeedback onPress={() => handleDoubleTap(item.id)}>
          <View>
            <Image source={{ uri: item.image }} style={styles.postImage} />
            <Animated.View
              style={[
                styles.heartOverlay,
                { transform: [{ scale: heartScale }] },
              ]}
            >
              <Ionicons name="heart" size={100} color="#FFF" />
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>

        <View style={styles.postActions}>
          <View style={styles.actionLeft}>
            <TouchableOpacity
              onPress={() =>
                setLikedPosts(p => ({ ...p, [item.id]: !p[item.id] }))
              }
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={28}
                color={isLiked ? '#FF3B30' : '#000'}
              />
            </TouchableOpacity>
            <Ionicons
              name="chatbubble-outline"
              size={26}
              color="#000"
              style={styles.actionIcon}
            />
            <Ionicons
              name="paper-plane-outline"
              size={26}
              color="#000"
              style={styles.actionIcon}
            />
          </View>
          <TouchableOpacity
            onPress={() =>
              setSavedPosts(p => ({ ...p, [item.id]: !p[item.id] }))
            }
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={26}
              color="#000"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.postContent}>
          <Text style={styles.likesText}>
            {item.likes.toLocaleString()} likes
          </Text>
          <Text style={styles.captionText}>
            <Text style={styles.boldText}>{item.user} </Text>
            {item.caption}
          </Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {renderHeader()}

      <FlatList
        data={FAKE_POSTS}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        ListHeaderComponent={() => (
          <FlatList
            horizontal
            data={FAKE_STORIES}
            keyExtractor={s => s.id}
            renderItem={renderStory}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storyList}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#CC2366"
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* BOTTOM NAV BAR */}
      <View style={styles.navBar}>
        <Ionicons name="home" size={28} color="#000" />
        <Ionicons name="search" size={28} color="#666" />
        <Ionicons name="play-circle-outline" size={28} color="#666" />
        <Ionicons name="cart-outline" size={28} color="#666" />
        <View style={styles.navAvatar} />
      </View>
    </Animated.View>
  );
};

export default Decoy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 60,
    borderBottomWidth: 0.3,
    borderBottomColor: '#DBDBDB',
  },
  logo: {
    fontSize: 26,
    fontFamily: theme.typography.bold,
    letterSpacing: -1,
    color: '#000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 18,
  },

  // Story Styles
  storyList: {
    paddingVertical: 12,
    paddingLeft: 10,
    borderBottomWidth: 0.3,
    borderBottomColor: '#DBDBDB',
  },
  storyItem: {
    alignItems: 'center',
    width: 85,
  },
  storyRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyInnerRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyImage: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  storyName: {
    fontSize: 11,
    marginTop: 5,
    color: '#262626',
    width: '90%',
    textAlign: 'center',
  },

  // Post Card Styles
  postCard: {
    backgroundColor: '#FFF',
    marginBottom: 10,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  postAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
  },
  postUsername: {
    fontWeight: '700',
    fontSize: 13,
    color: '#262626',
  },
  postLocation: {
    fontSize: 11,
    color: '#262626',
  },
  postImage: {
    width: width,
    height: width * 1.1,
    resizeMode: 'cover',
  },
  heartOverlay: {
    position: 'absolute',
    top: '40%',
    left: '38%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },

  // Post Action Styles
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginLeft: 15,
  },

  // Content Styles
  postContent: {
    paddingHorizontal: 12,
  },
  likesText: {
    fontWeight: '700',
    marginBottom: 5,
    color: '#262626',
  },
  captionText: {
    lineHeight: 18,
    color: '#262626',
  },
  boldText: {
    fontWeight: '700',
  },
  timeText: {
    fontSize: 11,
    color: '#8E8E8E',
    marginTop: 6,
    marginBottom: 10,
  },

  // Bottom Nav Styles
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 55,
    borderTopWidth: 0.3,
    borderTopColor: '#DBDBDB',
    backgroundColor: '#FFF',
  },
  navAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EEE',
    borderWidth: 1,
    borderColor: '#DBDBDB',
  },
});
