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

/** 音声ファイルの読み込み状態を管理するフック */
export const useSoundLoader = () => {
  /** 音声ファイルの読み込み状態 */
  const [localIsLoading, setLocalIsLoading] = useState(isLoading);
  const [localSoundFiles, setLocalSoundFiles] = useState<SoundFiles>(globalSoundFiles);
  const [localError, setLocalError] = useState<string | null>(error);
  const isFirstRender = useRef(true);

  /** 音声の有効状態 */
  const soundEnabled = useSelector((state: RootState) => state.settings.soundEnabled);
  /** 問題の音声 */
  const questionVoice = useSelector((state: RootState) => state.settings.questionVoice);

  useEffect(() => {
    // Strict Mode の二重実行を防ぐ
    if (!isFirstRender.current) {
      return;
    }
    isFirstRender.current = false;

    // 呼び出し元のコンポーネントを特定
    console.log('useSoundLoaderが呼び出されました');
    console.trace('呼び出し元のスタックトレース:');

    // より詳細なデバッグ情報を出力
    const debugInfo = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isLoaded,
      isLoading,
      soundEnabled,
      questionVoice
    };
    console.log('デバッグ情報:', debugInfo);

    const loadSounds = async () => {
      // すでに読み込みが完了している場合は何もしない
      if (isLoaded || !soundEnabled) {
        isLoading = false;
        setLocalIsLoading(false);
        return;
      }

      try {
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
                console.log(`${key}の音声ファイルを読み込みます`);
                
                // 読み込み開始
                sound.load();
                
                // 読み込み完了を待機
                const handleCanPlayThrough = () => {
                  console.log(`${key}の音声ファイルが読み込まれました`);
                  // 音声の長さが0より大きいことを確認
                  if (sound.duration > 0) {
                    console.log(`${key}の音声ファイルの長さ: ${sound.duration}秒`);
                    sound.removeEventListener('canplaythrough', handleCanPlayThrough);
                    clearTimeout(timeout); // タイムアウトタイマーをクリア
                    resolve(true);
                  } else {
                    console.log(`${key}の音声ファイルの長さが0です`);
                  }
                };
                
                sound.addEventListener('canplaythrough', handleCanPlayThrough);
                
                // エラー処理
                sound.addEventListener('error', (e) => {
                  console.error(`${key}の音声ファイルの読み込みに失敗しました:`, e);
                  clearTimeout(timeout); // タイムアウトタイマーをクリア
                  resolve(false);
                });

                // タイムアウト処理
                const timeout = setTimeout(() => {
                  console.error(`${key}の音声ファイルの読み込みがタイムアウトしました`);
                  sound.removeEventListener('canplaythrough', handleCanPlayThrough); // イベントリスナーを削除
                  resolve(false);
                }, 10000); // 10秒でタイムアウト

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
          globalSoundFiles = sounds;
          isLoading = false;
          isLoaded = true;
          setLocalSoundFiles(sounds);
          setLocalIsLoading(false);
        } else {
          console.error('一部の音声ファイルの読み込みに失敗しました');
          error = '一部の音声ファイルの読み込みに失敗しました';
          isLoading = false;
          setLocalError('一部の音声ファイルの読み込みに失敗しました');
          setLocalIsLoading(false);
        }
      } catch (err) { 
        console.error('音声ファイルの読み込みに失敗しました:', err);
        error = '音声ファイルの読み込みに失敗しました';
        isLoading = false;
        setLocalError('音声ファイルの読み込みに失敗しました');
        setLocalIsLoading(false);
      }
    };

    // 音声ファイルの読み込みを開始 
    loadSounds();
  }, []); // 依存配列を空にして、初回マウント時のみ実行

  /** 音声ファイルを再生する関数 */
  const playSound = (key: string) => {
    if (!soundEnabled) return;

    const sound = localSoundFiles[key];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(error => {
        console.error('音声の再生に失敗しました:', error);
      });
    }
  };

  return {
    isLoading: localIsLoading,
    error: localError,
    playSound,
    soundFiles: localSoundFiles
  };
}; 