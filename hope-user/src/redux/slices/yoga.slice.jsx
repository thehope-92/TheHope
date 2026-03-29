/**
 * @file yoga.slice.js
 * @module Redux/Slices/Yoga
 * @description
 * Redux Toolkit slice for managing Yoga Guide fetching in React Native.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../config/Config';

const { BACKEND_API_URL } = CONFIG;

// Helper function to get token from AsyncStorage
const getToken = async rejectWithValue => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) throw new Error('User is not authenticated');
    return token;
  } catch (error) {
    return rejectWithValue({
      message: error.message || 'Failed to retrieve authentication token',
    });
  }
};

/**
 * @function getAllYogaGuides
 * @description Fetches all available yoga guides.
 */
export const getAllYogaGuides = createAsyncThunk(
  'yoga/getAllYogaGuides',
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.get(
        `${BACKEND_API_URL}/yoga/get-all-yoga-guides`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const { allYogaGuides, message, success } = response.data;

      if (!success) {
        throw new Error(message || 'Failed to fetch yoga guides');
      }

      return {
        allGuides: allYogaGuides || [],
        message,
        success,
      };
    } catch (error) {
      const backendError = error.response?.data;
      return rejectWithValue({
        message:
          backendError?.message || error.message || 'Network error occurred',
        success: false,
        status: error.response?.status || 0,
      });
    }
  },
);

/**
 * @function getYogaGuideById
 * @description Fetches details of a specific yoga guide by its ID.
 */
export const getYogaGuideById = createAsyncThunk(
  'yoga/getYogaGuideById',
  async (yogaId, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.get(
        `${BACKEND_API_URL}/yoga/get-yoga-guide-by-id/${yogaId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const { yogaGuide, message, success } = response.data;

      if (!success) {
        throw new Error(message || 'Failed to fetch yoga guide');
      }

      return {
        yogaGuide: yogaGuide || response.data,
        message,
        success: true,
      };
    } catch (error) {
      const backendError = error.response?.data;
      return rejectWithValue({
        message: backendError?.message || error.message,
        success: false,
        status: error.response?.status || 0,
      });
    }
  },
);

const initialState = {
  allGuides: [],
  selectedYogaGuide: null,
  loading: false,
  error: null,
  message: null,
  success: null,
};

const yogaSlice = createSlice({
  name: 'yoga',
  initialState,
  reducers: {
    clearYogaError: state => {
      state.error = null;
      state.message = null;
    },
    clearSelectedYogaGuide: state => {
      state.selectedYogaGuide = null;
    },
  },
  extraReducers: builder => {
    builder
      // --- GET ALL YOGA GUIDES ---
      .addCase(getAllYogaGuides.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllYogaGuides.fulfilled, (state, action) => {
        state.loading = false;
        state.allGuides = action.payload.allGuides;
        state.success = action.payload.success;
      })
      .addCase(getAllYogaGuides.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      })

      // --- GET YOGA GUIDE BY ID ---
      .addCase(getYogaGuideById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getYogaGuideById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedYogaGuide = action.payload.yogaGuide;
        state.success = action.payload.success;
      })
      .addCase(getYogaGuideById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      });
  },
});

export const { clearYogaError, clearSelectedYogaGuide } = yogaSlice.actions;
export default yogaSlice.reducer;
