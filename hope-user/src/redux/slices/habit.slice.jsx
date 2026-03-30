/**
 * @file habitSlice.js
 * @module Redux/Slices/Habit
 * @description Redux Toolkit slice for managing user habit tracking operations.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../config/Config';

const { BACKEND_API_URL } = CONFIG;

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

export const createHabit = createAsyncThunk(
  'habit/createHabit',
  async (habitData, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.post(
        `${BACKEND_API_URL}/habit/create-habit`,
        habitData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to create habit' },
      );
    }
  },
);

export const getUserHabits = createAsyncThunk(
  'habit/getUserHabits',
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.get(
        `${BACKEND_API_URL}/habit/get-user-habits`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data; // Return full response
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to fetch habits' },
      );
    }
  },
);

export const getDailyDashboard = createAsyncThunk(
  'habit/getDailyDashboard',
  async (date, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.get(
        `${BACKEND_API_URL}/habit/get-daily-dashboard`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { date },
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to load dashboard' },
      );
    }
  },
);

export const toggleHabitStatus = createAsyncThunk(
  'habit/toggleHabitStatus',
  async (habitId, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.patch(
        `${BACKEND_API_URL}/habit/toggle-habit-status/${habitId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return { habitId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to toggle status' },
      );
    }
  },
);

export const deleteHabit = createAsyncThunk(
  'habit/deleteHabit',
  async (habitId, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.delete(
        `${BACKEND_API_URL}/habit/delete-habit/${habitId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return { habitId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Delete operation failed' },
      );
    }
  },
);

const initialState = {
  habits: [],
  dashboard: {
    habits: [],
    stats: { total: 0, completed: 0, percent: 0, label: '' },
    selectedDate: null,
  },
  loading: false,
  error: null,
  message: null,
};

const habitSlice = createSlice({
  name: 'habit',
  initialState,
  reducers: {
    clearHabitMessages: state => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: builder => {
    builder
      /* Create Habit */
      .addCase(createHabit.pending, state => {
        state.loading = true;
      })
      .addCase(createHabit.fulfilled, (state, action) => {
        state.loading = false;
        state.habits.unshift(action.payload.habit);
        state.message = action.payload.message;
      })
      .addCase(createHabit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      /* Get User Habits */
      .addCase(getUserHabits.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserHabits.fulfilled, (state, action) => {
        state.loading = false;
        state.habits = action.payload.allHabits || [];
      })
      .addCase(getUserHabits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load habits';
      })

      /* Daily Dashboard */

      .addCase(getDailyDashboard.pending, state => {
        state.loading = true;
        state.dashboard.habits = [];
        state.dashboard.stats = {
          total: 0,
          completed: 0,
          percent: 0,
          label: 'Loading...',
        };
      })

      .addCase(getDailyDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard.habits = action.payload.habits || [];
        state.dashboard.stats = action.payload.stats || {};
        state.dashboard.selectedDate = action.payload.selectedDate;
      });

    /* Toggle & Delete (unchanged) */
    builder
      .addCase(toggleHabitStatus.fulfilled, (state, action) => {
        const { habitId, date } = action.payload;

        const habit = state.dashboard.habits.find(h => h._id === habitId);

        if (habit) {
          const alreadyCompleted = habit.completedDates?.includes(date);

          if (alreadyCompleted) {
            habit.completedDates = habit.completedDates.filter(d => d !== date);
            habit.isCompleted = false;
          } else {
            habit.completedDates = [...(habit.completedDates || []), date];
            habit.isCompleted = true;
          }
        }
      })

      .addCase(deleteHabit.fulfilled, (state, action) => {
        state.habits = state.habits.filter(
          h => h._id !== action.payload.habitId,
        );
        state.dashboard.habits = state.dashboard.habits.filter(
          h => h._id !== action.payload.habitId,
        );
        state.message = action.payload.message;
      });
  },
});

export const { clearHabitMessages } = habitSlice.actions;
export default habitSlice.reducer;
