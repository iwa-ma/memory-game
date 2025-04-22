import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '@/store/settingsSlice';

/** ストア */
export const store = configureStore({
  reducer: {
    settings: settingsReducer,
  },
});

/** ストアの型 */
export type RootState = ReturnType<typeof store.getState>;
/** ストアディスパッチの型 */
export type AppDispatch = typeof store.dispatch; 