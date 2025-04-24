import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { getAudioDuration } from '@/utils/audioUtils';

type SoundFiles = {
  [key: string]: HTMLAudioElement;
};

type SoundDurations = {
  [key: string]: number;
};

// グローバルな状態管理
let globalSoundFiles: SoundFiles = {};
let globalSoundDurations: SoundDurations = {};
let isLoading = true;
let isLoaded = false;
let error: string | null = null;
let currentLoadingVoice: string | null = null;
let hasInitialized = false;

/** 音声ファイルの読み込み状態を管理するフック */
export const useSoundLoader = () => {
  /** 音声ファイルの読み込み状態 */
  const [localIsLoading, setLocalIsLoading] = useState(isLoading);
  /** 音声ファイル */ 
  const [localSoundFiles, setLocalSoundFiles] = useState<SoundFiles>(globalSoundFiles);
  /** 音声の長さ */
  const [localSoundDurations, setLocalSoundDurations] = useState<SoundDurations>(globalSoundDurations);
  /** エラー */
  const [localError, setLocalError] = useState<string | null>(error);
  /** 初回マウント */
  const isFirstMount = useRef(true);
  /** 前の音声 */
  const previousVoice = useRef<string | null>(null);
  /** 読み込み中のPromise */
  const loadingPromise = useRef<Promise<void> | null>(null);

  /** 音声の有効状態 */
  const soundEnabled = useSelector((state: RootState) => state.settings.soundEnabled);
  /** 問題の音声 */
  const questionVoice = useSelector((state: RootState) => state.settings.questionVoice);

  /** 状態を更新する関数 */
  const updateState = (loading: boolean, soundFiles: SoundFiles = {}, durations: SoundDurations = {}, err: string | null = null) => {
    isLoading = loading;
    isLoaded = !loading && err === null;
    error = err;
    globalSoundFiles = soundFiles;
    globalSoundDurations = durations;
    
    // ローカルな状態を更新
    /** 読み込み中    */
    setLocalIsLoading(loading);
    /** 音声ファイル */
    setLocalSoundFiles(soundFiles);
    /** 音声の長さ */
    setLocalSoundDurations(durations);
    /** エラー */
    setLocalError(err);

    if (!loading) {
      currentLoadingVoice = null;
      loadingPromise.current = null;
    }
  };

  const loadSounds = async () => {
    // 音声が無効な場合は何もしない
    if (!soundEnabled) {
      updateState(false);
      return;
    }

    // 既に同じ音声タイプの読み込みが進行中の場合は中断
    if (currentLoadingVoice === questionVoice || loadingPromise.current) {
      console.log('音声ファイルの読み込みが既に進行中です');
      return;
    }

    // 読み込み開始を記録
    currentLoadingVoice = questionVoice;
    
    const promise = (async () => {
      try {
        updateState(true);
        const sounds: SoundFiles = {};
        const durations: SoundDurations = {};
        
        // カウントダウンと開始音声
        if (questionVoice === 'animal1') {
          sounds['3'] = new Audio('/sounds/animal1/cat1.mp3');
          sounds['2'] = new Audio('/sounds/animal1/cat1.mp3');
          sounds['1'] = new Audio('/sounds/animal1/cat1.mp3');
          sounds['0'] = new Audio('/sounds/animal1/cat1.mp3');
          sounds['start'] = new Audio('/sounds/animal1/cat2.mp3');
        } else {
          const voicePath = questionVoice === 'human1' ? 'human1' : 'human2';
          sounds['3'] = new Audio(`/sounds/${voicePath}/3.mp3`);
          sounds['2'] = new Audio(`/sounds/${voicePath}/2.mp3`);
          sounds['1'] = new Audio(`/sounds/${voicePath}/1.mp3`);
          sounds['0'] = new Audio(`/sounds/${voicePath}/0.mp3`);
          sounds['start'] = new Audio(`/sounds/${voicePath}/start.mp3`);
        }

        // 正解・不正解の音声
        sounds['correct'] = new Audio('/sounds/correct.mp3');
        sounds['incorrect'] = new Audio('/sounds/incorrect.mp3');

        // 数字の音声
        if (questionVoice === 'animal1') {
          sounds['cat1'] = new Audio('/sounds/animal1/cat1.mp3');
          sounds['cat2'] = new Audio('/sounds/animal1/cat2.mp3');
          sounds['cat3'] = new Audio('/sounds/animal1/cat3.mp3');
          sounds['cat4'] = new Audio('/sounds/animal1/cat4.mp3');
        } else {
          const voicePath = questionVoice === 'human1' ? 'human1' : 'human2';
          for (let i = 0; i < 10; i++) {
            sounds[`num${i}`] = new Audio(`/sounds/${voicePath}/${i}.mp3`);
          }
        }

        console.log('音声ファイルの読み込みを開始します');

        // 音声ファイルを事前に読み込む
        const loadResults = await Promise.all(
          Object.entries(sounds).map(
            async ([key, sound]) => {
              try {
                // 音声ファイルの長さを取得
                const duration = await getAudioDuration(sound.src);
                durations[key] = duration;
                return true;
              } catch (error) {
                console.error(`${key}の音声ファイルの長さ取得に失敗しました:`, error);
                return false;
              }
            }
          )
        );

        // すべての音声ファイルが正常に読み込まれたか確認
        const allLoaded = loadResults.every(result => result === true);
        
        if (allLoaded) {
          console.log('すべての音声ファイルの読み込みが完了しました');
          updateState(false, sounds, durations);
        } else {
          console.error('一部の音声ファイルの読み込みに失敗しました');
          updateState(false, {}, {}, '一部の音声ファイルの読み込みに失敗しました');
        }
      } catch (err) { 
        console.error('音声ファイルの読み込みに失敗しました:', err);
        updateState(false, {}, {}, '音声ファイルの読み込みに失敗しました');
      }
    })();

    loadingPromise.current = promise;
    await promise;
  };

  // 初回マウント時の処理
  useEffect(() => {
    if (!isFirstMount.current || hasInitialized) {
      return;
    }
    isFirstMount.current = false;
    hasInitialized = true;

    // 音声ファイルの読み込みを開始 
    loadSounds();

    // クリーンアップ関数
    return () => {
      // コンポーネントのアンマウント時に進行中の読み込みをキャンセル
      currentLoadingVoice = null;
      loadingPromise.current = null;
    };
  }, []); // 初回マウント時のみ実行

  // 音声の種類が変更された時の処理
  useEffect(() => {
    if (isFirstMount.current) {
      return;
    }

    // 音声の種類が実際に変更された場合のみ再読み込み
    if (previousVoice.current !== questionVoice) {
      console.log('音声の種類が変更されました');
      previousVoice.current = questionVoice;
      loadSounds();
    }
  }, [questionVoice]);

  const playSound = async (soundName: string): Promise<{ duration: number }> => {
    // 音声ファイルが読み込まれていない場合はエラー
    if (!isLoaded) {
      console.warn('音声ファイルが読み込まれていません');
      return { duration: 0 };
    }

    const sound = localSoundFiles[soundName];
    if (!sound) {
      console.warn(`音声ファイルが見つかりません: ${soundName}`);
      return { duration: 0 };
    }

    const duration = localSoundDurations[soundName] || 0;

    return new Promise((resolve) => {
      sound.currentTime = 0;
      sound.play();
      sound.onended = () => resolve({ duration });
    });
  };

  // 音声の長さを取得する関数
  const getSoundDuration = (soundName: string): number => {
    return localSoundDurations[soundName] || 0;
  };

  return {
    isLoading: localIsLoading,
    isLoaded,
    error: localError,
    playSound,
    getSoundDuration,
    soundFiles: localSoundFiles
  };
}; 