import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import authReducer from '../slices/auth.slice';
import userReducer from '../slices/user.slice';
import moodReducer from '../slices/mood.slice';
import articleReducer from '../slices/articles.slice';
import yogaReducer from '../slices/yoga.slice';
import habitReducer from '../slices/habit.slice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  mood: moodReducer,
  article: articleReducer,
  yoga: yogaReducer,
  habit: habitReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

const persistor = persistStore(store);

export { store, persistor };
