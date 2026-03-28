/**
 * @file Home.jsx
 * @module Screens/Home
 * @description
 * Primary landing screen for the NiDrip Central application.
 * Responsibilities:
 * - Displays a curated list of electronic and appliance categories (Laptops, Smartphones, etc.).
 * - Handles real-time location detection and permission management to provide localized services.
 * - Integrates with Redux for fetching and filtering global product data.
 * - Provides search functionality to filter available categories dynamically.
 * Features:
 * - Automated Geolocation: Requests and updates user coordinates on component mount.
 * - Dynamic Category Extraction: Parses product metadata to count and display relevant categories.
 * - Responsive UI: Utilizes a dual-column FlatList for an elegant, modern shopping experience.
 * - Theme Integration: Uses global theme colors and typography for brand consistency.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, View, Dimensions, StatusBar } from 'react-native';
import Header from '../../utilities/custom-components/header/header/Header';
import { useDispatch, useSelector } from 'react-redux';
import { getUser } from '../../redux/slices/user.slice';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const Home = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const user = useSelector(state => state.auth.user);
  const profile = useSelector(state => state.user.user);

  console.log(profile);

  useEffect(() => {
    if (user?.id) {
      dispatch(getUser(user.id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent');
  }, []);

  return (
    <View style={styles.container}>
      <Header
        userName={profile?.userName || 'User'}
        userAvatar={profile?.profilePicture}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
