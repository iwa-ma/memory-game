import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

/** 設定値の型定義 */
interface SettingsState {
  /** 音声の種類 */
  questionVoice: 'human1' | 'human2' | 'animal1';
  /** 出題音声のオン/オフ */
  questionSoundEnabled: boolean;
  /** ボタンタッチ効果音のオン/オフ */
  buttonSoundEnabled: boolean;
  /** 開始レベル */
  startLevel: number;
  /** 難易度 */
  difficultyLevel: 'easy' | 'normal' | 'hard';
}

/** 初期状態 */
const initialState: SettingsState = {
  questionVoice: 'human1',
  questionSoundEnabled: true,
  buttonSoundEnabled: true,
  startLevel: 1,
  difficultyLevel: 'normal',
};

/** 設定値管理用のスライス */
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    /** 音声の種類を設定 */
    setQuestionVoice: (state, action: PayloadAction<SettingsState['questionVoice']>) => {
      state.questionVoice = action.payload;
    },
    /** 出題音声のオン/オフを設定 */
    setQuestionSoundEnabled: (state, action: PayloadAction<boolean>) => {
      state.questionSoundEnabled = action.payload;
    },
    /** ボタンタッチ効果音のオン/オフを設定 */
    setButtonSoundEnabled: (state, action: PayloadAction<boolean>) => {
      state.buttonSoundEnabled = action.payload;
    },
    /** 開始レベルを設定 */
    setStartLevel: (state, action: PayloadAction<number>) => {
      state.startLevel = action.payload;
    },
    /** 難易度を設定 */
    setDifficultyLevel: (state, action: PayloadAction<SettingsState['difficultyLevel']>) => {
      state.difficultyLevel = action.payload;
    },
  },
});

export const {
  setQuestionVoice,
  setQuestionSoundEnabled,
  setButtonSoundEnabled,
  setStartLevel,
  setDifficultyLevel,
} = settingsSlice.actions;

export default settingsSlice.reducer; 