/**
 * @file moodSlice.js
 * @module Redux/Slices/Mood
 * @description
 * Redux Toolkit slice for managing user mood tracking operations. 
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../config/Config';

const { BACKEND_API_URL } = CONFIG;

// Helper function to get token
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

// 1. Create a new mood
export const createMood = createAsyncThunk(
  'mood/createMood',
  async (moodData, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.post(
        `${BACKEND_API_URL}/mood/create-mood`,
        moodData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const { mood, message, success } = response.data;
      if (!success) throw new Error(message);

      return { mood, message, success };
    } catch (error) {
      const backend = error.response?.data;
      return rejectWithValue({
        message: backend?.message || error.message || 'Failed to create mood',
        status: error.response?.status || 0,
      });
    }
  },
);

// 2. Get all moods for a user
export const getUserMoods = createAsyncThunk(
  'mood/getUserMoods',
  async ({ rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.get(
        `${BACKEND_API_URL}/mood/get-user-moods`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return {
        moods: response.data.moods,
        message: response.data.message,
        success: response.data.success,
      };
    } catch (error) {
      const backend = error.response?.data;
      return rejectWithValue({
        message: backend?.message || error.message || 'Failed to fetch moods',
        status: error.response?.status || 0,
      });
    }
  },
);

// 3. Update an existing mood
export const updateMood = createAsyncThunk(
  'mood/updateMood',
  async ({ moodId, moodData }, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.patch(
        `${BACKEND_API_URL}/mood/update-user-mood/${moodId}`,
        moodData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const { updatedMood, message, success } = response.data;
      if (!success) throw new Error(message);

      return { mood: updatedMood, message, success };
    } catch (error) {
      const backend = error.response?.data;
      return rejectWithValue({
        message: backend?.message || error.message || 'Failed to update mood',
        status: error.response?.status || 0,
      });
    }
  },
);

// 4. Delete a mood
export const deleteMood = createAsyncThunk(
  'mood/deleteMood',
  async (moodId, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.delete(
        `${BACKEND_API_URL}/mood/delete-mood/${moodId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return {
        moodId, // Return ID so we can filter it out of the state
        message: response.data.message,
        success: response.data.success,
      };
    } catch (error) {
      const backend = error.response?.data;
      return rejectWithValue({
        message: backend?.message || error.message || 'Failed to delete mood',
        status: error.response?.status || 0,
      });
    }
  },
);

// 5. Get Mood Analytics
export const getMoodAnalytics = createAsyncThunk(
  'mood/getMoodAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.get(
        `${BACKEND_API_URL}/mood/get-mood-analytics`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const { analytics, message, success } = response.data;

      if (!success) throw new Error(message);

      return { analytics, message, success };
    } catch (error) {
      const backend = error.response?.data;
      return rejectWithValue({
        message:
          backend?.message || error.message || 'Failed to fetch analytics',
        status: error.response?.status || 0,
      });
    }
  },
);

const initialState = {
  moods: [], // Changed from 'user: null' to an array to hold multiple moods
  analytics: [],
  loading: false,
  error: null,
  message: null,
};

const moodSlice = createSlice({
  name: 'mood',
  initialState,
  reducers: {
    clearMoods: state => {
      state.moods = [];
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: builder => {
    builder
      // --- CREATE MOOD ---
      .addCase(createMood.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createMood.fulfilled, (state, action) => {
        state.loading = false;
        // Add the newly created mood to the top of the list
        if (action.payload.mood) {
          state.moods.unshift(action.payload.mood);
        }
        state.message = action.payload.message;
      })
      .addCase(createMood.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      })

      // --- GET USER MOODS ---
      .addCase(getUserMoods.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getUserMoods.fulfilled, (state, action) => {
        state.loading = false;
        state.moods = action.payload.moods || [];
        state.message = action.payload.message;
      })
      .addCase(getUserMoods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      })

      // --- UPDATE MOOD ---
      .addCase(updateMood.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateMood.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;

        // Find the mood in the array and update it
        if (action.payload.mood) {
          const index = state.moods.findIndex(
            m =>
              m._id === action.payload.mood._id ||
              m.id === action.payload.mood.id,
          );
          if (index !== -1) {
            state.moods[index] = action.payload.mood;
          }
        }
      })
      .addCase(updateMood.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      })

      // --- DELETE MOOD ---
      .addCase(deleteMood.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(deleteMood.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;

        // Remove the deleted mood from the local state
        state.moods = state.moods.filter(
          m =>
            m._id !== action.payload.moodId && m.id !== action.payload.moodId,
        );
      })
      .addCase(deleteMood.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      })

      .addCase(getMoodAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload.analytics || [];
        state.message = action.payload.message;
      })
      .addCase(getMoodAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      });
  },
});

export const { clearMoods } = moodSlice.actions;
export default moodSlice.reducer;
