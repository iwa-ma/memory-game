import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

type SoundFiles = {
  [key: string]: HTMLAudioElement;
};

// グローバルな状態管理
let globalSoundFiles: SoundFiles = {};
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
  const updateState = (loading: boolean, soundFiles: SoundFiles = {}, err: string | null = null) => {
    isLoading = loading;
    isLoaded = !loading && err === null;
    error = err;
    globalSoundFiles = soundFiles;
    
    setLocalIsLoading(loading);
    setLocalSoundFiles(soundFiles);
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
            ([key, sound]) =>
              new Promise<boolean>((resolve) => {
                // 既に読み込み済みの場合はスキップ
                if (sound.readyState === 4) {
                  resolve(true);
                  return;
                }

                console.log(`${key}の音声ファイルを読み込みます`);
                
                // 読み込み開始
                sound.load();
                
                // 読み込み完了を待機
                const handleCanPlayThrough = () => {
                  console.log(`${key}の音声ファイルが読み込まれました`);
                  if (sound.duration > 0) {
                    sound.removeEventListener('canplaythrough', handleCanPlayThrough);
                    clearTimeout(timeout);
                    resolve(true);
                  }
                };
                
                sound.addEventListener('canplaythrough', handleCanPlayThrough);
                
                // エラー処理
                sound.addEventListener('error', (e) => {
                  console.error(`${key}の音声ファイルの読み込みに失敗しました:`, e);
                  clearTimeout(timeout);
                  resolve(false);
                });

                // タイムアウト処理
                const timeout = setTimeout(() => {
                  console.error(`${key}の音声ファイルの読み込みがタイムアウトしました`);
                  sound.removeEventListener('canplaythrough', handleCanPlayThrough);
                  resolve(false);
                }, 10000);

                // クリーンアップ
                return () => {
                  clearTimeout(timeout);
                  sound.removeEventListener('canplaythrough', handleCanPlayThrough);
                };
              })
          )
        );

        // すべての音声ファイルが正常に読み込まれたか確認
        const allLoaded = loadResults.every(result => result === true);
        
        if (allLoaded) {
          console.log('すべての音声ファイルの読み込みが完了しました');
          updateState(false, sounds);
        } else {
          console.error('一部の音声ファイルの読み込みに失敗しました');
          updateState(false, {}, '一部の音声ファイルの読み込みに失敗しました');
        }
      } catch (err) { 
        console.error('音声ファイルの読み込みに失敗しました:', err);
        updateState(false, {}, '音声ファイルの読み込みに失敗しました');
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

  return {
    isLoading: localIsLoading,
    error: localError,
    playSound: (key: string) => {
      if (!soundEnabled) return;

      const sound = localSoundFiles[key];
      if (sound) {
        sound.currentTime = 0;
        sound.play().catch(error => {
          console.error('音声の再生に失敗しました:', error);
        });
      }
    },
    soundFiles: localSoundFiles
  };
}; 