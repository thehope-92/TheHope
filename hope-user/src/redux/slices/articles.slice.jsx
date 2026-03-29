/**
 * @file articles.slice.js
 * @module Redux/Slices/Articles
 * @description
 * Redux Toolkit slice for managing article fetching in React Native.
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
 * @function getAllArticles
 * @description Fetches all available articles.
 */
export const getAllArticles = createAsyncThunk(
  'articles/getAllArticles',
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.get(
        `${BACKEND_API_URL}/library/get-all-articles`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const { allArticles, message, success } = response.data;

      if (!success) {
        throw new Error(message || 'Failed to fetch articles');
      }

      return {
        allArticles: allArticles || [],
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
 * @function getArticleById
 * @description Fetches details of a specific article by its ID.
 */
export const getArticleById = createAsyncThunk(
  'articles/getArticleById',
  async (articleId, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.get(
        `${BACKEND_API_URL}/library/get-article-by-id/${articleId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const { article, message, success } = response.data;

      if (!success) {
        throw new Error(message);
      }

      return {
        article: article || response.data,
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

/**
 * @function getArticleBySlug
 * @description Fetches single article by slug + automatically increments viewCount
 */
export const getArticleBySlug = createAsyncThunk(
  'articles/getArticleBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.get(
        `${BACKEND_API_URL}/library/read/${slug}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const { article, message, success } = response.data;

      if (!success) {
        throw new Error(message || 'Failed to fetch article');
      }

      return {
        article: article || response.data,
        message,
        success: true,
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

const initialState = {
  allArticles: [],
  selectedArticle: null,
  loading: false,
  error: null,
  message: null,
  success: null,
};

const articlesSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {
    clearArticleError: state => {
      state.error = null;
      state.message = null;
    },
    clearSelectedArticle: state => {
      state.selectedArticle = null;
    },
  },
  extraReducers: builder => {
    builder
      // --- GET ALL ARTICLES ---
      .addCase(getAllArticles.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.allArticles = action.payload.allArticles;
        state.success = action.payload.success;
      })
      .addCase(getAllArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      })

      // --- GET ARTICLE BY ID ---
      .addCase(getArticleById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getArticleById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedArticle = action.payload.article;
        state.success = action.payload.success;
      })
      .addCase(getArticleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      })

      // --- GET ARTICLE BY SLUG (increments viewCount) ---
      .addCase(getArticleBySlug.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getArticleBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedArticle = action.payload.article;
        state.success = action.payload.success;
      })
      .addCase(getArticleBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      });
  },
});

export const { clearArticleError, clearSelectedArticle } =
  articlesSlice.actions;
export default articlesSlice.reducer;
