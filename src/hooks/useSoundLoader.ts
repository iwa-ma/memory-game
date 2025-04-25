import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { getAudioDuration } from '@/utils/audioUtils';
import { isMobileDevice } from '@/utils/deviceUtils';

type SoundFiles = {
  [key: string]: HTMLAudioElement[];  // 音声ファイルのプール
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

const POOL_SIZE = 3; // 各音声ファイルのプールサイズ

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

  /** 音声ファイルをプールから取得する関数 */
  const getAvailableSound = (soundName: string): HTMLAudioElement => {
    const soundPool = localSoundFiles[soundName];
    if (!soundPool) {
      throw new Error(`音声ファイルが見つかりません: ${soundName}`);
    }

    // 再生可能な音声ファイルを探す
    const availableSound = soundPool.find(sound => 
      sound.paused || sound.ended || sound.currentTime === 0
    );

    if (!availableSound) {
      console.warn(`利用可能な音声ファイルがありません: ${soundName}、最初のファイルを再利用します`);
      return soundPool[0];
    }

    return availableSound;
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
          sounds['3'] = Array(POOL_SIZE).fill(null).map(() => new Audio('/sounds/animal1/cat1.mp3'));
          sounds['2'] = Array(POOL_SIZE).fill(null).map(() => new Audio('/sounds/animal1/cat1.mp3'));
          sounds['1'] = Array(POOL_SIZE).fill(null).map(() => new Audio('/sounds/animal1/cat1.mp3'));
          sounds['0'] = Array(POOL_SIZE).fill(null).map(() => new Audio('/sounds/animal1/cat1.mp3'));
          sounds['start'] = Array(POOL_SIZE).fill(null).map(() => new Audio('/sounds/animal1/cat2.mp3'));
        } else {
          const voicePath = questionVoice === 'human1' ? 'human1' : 'human2';
          sounds['3'] = Array(POOL_SIZE).fill(null).map(() => new Audio(`/sounds/${voicePath}/3.mp3`));
          sounds['2'] = Array(POOL_SIZE).fill(null).map(() => new Audio(`/sounds/${voicePath}/2.mp3`));
          sounds['1'] = Array(POOL_SIZE).fill(null).map(() => new Audio(`/sounds/${voicePath}/1.mp3`));
          sounds['0'] = Array(POOL_SIZE).fill(null).map(() => new Audio(`/sounds/${voicePath}/0.mp3`));
          sounds['start'] = Array(POOL_SIZE).fill(null).map(() => new Audio(`/sounds/${voicePath}/start.mp3`));
        }

        // 正解・不正解の音声
        sounds['correct'] = Array(POOL_SIZE).fill(null).map(() => new Audio('/sounds/correct.mp3'));
        sounds['incorrect'] = Array(POOL_SIZE).fill(null).map(() => new Audio('/sounds/incorrect.mp3'));

        // 数字の音声
        if (questionVoice === 'animal1') {
          sounds['cat1'] = Array(POOL_SIZE).fill(null).map(() => new Audio('/sounds/animal1/cat1.mp3'));
          sounds['cat2'] = Array(POOL_SIZE).fill(null).map(() => new Audio('/sounds/animal1/cat2.mp3'));
          sounds['cat3'] = Array(POOL_SIZE).fill(null).map(() => new Audio('/sounds/animal1/cat3.mp3'));
          sounds['cat4'] = Array(POOL_SIZE).fill(null).map(() => new Audio('/sounds/animal1/cat4.mp3'));
        } else {
          const voicePath = questionVoice === 'human1' ? 'human1' : 'human2';
          for (let i = 0; i < 10; i++) {
            sounds[`num${i}`] = Array(POOL_SIZE).fill(null).map(() => new Audio(`/sounds/${voicePath}/${i}.mp3`));
          }
        }

        console.log('音声ファイルの読み込みを開始します');

        // 音声ファイルを事前に読み込む
        const loadResults = await Promise.all(
          Object.entries(sounds).flatMap(([key, soundArray]) =>
            soundArray.map(async (sound) => {
              try {
                // 音声ファイルの長さを取得
                const duration = await getAudioDuration(sound.src);
                durations[key] = duration;
                return true;
              } catch (error) {
                console.error(`${key}の音声ファイルの長さ取得に失敗しました:`, error);
                return false;
              }
            })
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
      throw new Error('音声ファイルが読み込まれていません');
    }

    // プールから利用可能な音声ファイルを取得
    const sound = getAvailableSound(soundName);
    
    console.log(`音声再生を開始: ${soundName}`, JSON.stringify({
      // 音声ファイルの状態
      soundState: sound.readyState,
      // 音声ファイルの状態のテキスト
      readyStateText: ['HAVE_NOTHING', 'HAVE_METADATA', 'HAVE_CURRENT_DATA', 'HAVE_FUTURE_DATA', 'HAVE_ENOUGH_DATA'][sound.readyState],
      // 音声ファイルの再生位置
      currentTime: sound.currentTime,
      // 音声ファイルの長さ
      duration: sound.duration,
      // 音声ファイルのエラー
      soundError: sound.error,
      // 音声ファイルが読み込まれたかどうか 
      loaded: sound.readyState === 4,
      // 音声ファイルが一時停止しているかどうか
      paused: sound.paused,
      // 音声ファイルが終了したかどうか
      ended: sound.ended,
      // 音声ファイルのソース
      src: sound.src,
      // 音声ファイルのネットワーク状態
      networkState: sound.networkState,
      // 音声ファイルのネットワーク状態のテキスト
      networkStateText: ['EMPTY', 'IDLE', 'LOADING', 'NO_SOURCE'][sound.networkState]
    }, null, 2));

    // 音声ファイルの長さ
    const duration = localSoundDurations[soundName] || 0;

    // 音声ファイルの再生を待機処理（リトライ付き）
    return new Promise((resolve, reject) => {
      const waitForLoad = () => {
        // 最大リトライ回数
        const maxRetries = 3;
        // リトライ回数
        let retryCount = 0;

        // 音声ファイルの読み込みを再試行
        const tryLoad = () => {
          // 音声ファイルが再生可能な場合
          if (sound.readyState >= 3) { // HAVE_FUTURE_DATA以上なら再生可能
            return Promise.resolve();
          }

          // リトライ回数が最大リトライ回数を超えた場合
          if (retryCount >= maxRetries) {
            console.error(`音声ファイルの読み込みが${maxRetries}回失敗しました: ${soundName}`);
            return Promise.reject(new Error(`音声ファイルの読み込みが${maxRetries}回失敗しました`));
          }

          // 再試行が必要な場合のみログを出力
          if (retryCount > 0) {
            console.log(`音声ファイルの読み込みを再試行 (${retryCount}/${maxRetries}): ${soundName}`);
          }

          // リトライ回数をインクリメント
          retryCount++;

          // 音声を再読み込み
          sound.load();

          // 音声ファイルの読み込みが完了した場合
          return new Promise<void>((resolve) => {
            const handleCanPlay = () => {
              // 再試行が必要だった場合のみログを出力
              if (retryCount > 1) {
                console.log(`音声ファイルの読み込みが完了: ${soundName}`, JSON.stringify({
                  readyState: sound.readyState,
                  readyStateText: ['HAVE_NOTHING', 'HAVE_METADATA', 'HAVE_CURRENT_DATA', 'HAVE_FUTURE_DATA', 'HAVE_ENOUGH_DATA'][sound.readyState],
                  loaded: sound.readyState === 4,
                  networkState: sound.networkState,
                  networkStateText: ['EMPTY', 'IDLE', 'LOADING', 'NO_SOURCE'][sound.networkState]
                }, null, 2));
              }
              sound.removeEventListener('canplay', handleCanPlay);
              resolve();
            };
            sound.addEventListener('canplay', handleCanPlay);

            // 1秒後にリトライ
            setTimeout(() => {
              sound.removeEventListener('canplay', handleCanPlay);
              tryLoad().then(resolve);
            }, 1000);
          });
        };

        return tryLoad();
      };

      // 音声再生の成功/失敗を検知するためのイベントリスナー
      const handleError = (error: Event) => {
        console.error(`音声の再生に失敗しました: ${soundName}`, JSON.stringify({
          // エラー 
          error: error.toString(),
          // 音声ファイルの状態
          soundState: sound.readyState,
          // 音声ファイルの状態のテキスト
          readyStateText: ['HAVE_NOTHING', 'HAVE_METADATA', 'HAVE_CURRENT_DATA', 'HAVE_FUTURE_DATA', 'HAVE_ENOUGH_DATA'][sound.readyState],
          currentTime: sound.currentTime,
          // 音声ファイルの長さ
          duration: sound.duration,
          // 音声ファイルのエラー
          soundError: sound.error,
          // 音声ファイルが読み込まれたかどうか
          loaded: sound.readyState === 4,
          // 音声ファイルが一時停止しているかどうか
          paused: sound.paused,
          // 音声ファイルが終了したかどうか
          ended: sound.ended,
          // 音声ファイルのソース
          src: sound.src, 
          // 音声ファイルのネットワーク状態
          networkState: sound.networkState,
          // 音声ファイルのネットワーク状態のテキスト
          networkStateText: ['EMPTY', 'IDLE', 'LOADING', 'NO_SOURCE'][sound.networkState]
        }, null, 2));
        sound.removeEventListener('error', handleError);
        sound.removeEventListener('ended', handleEnded);
        reject(error);
      };

      const handleEnded = () => {
        console.log(`音声再生が完了: ${soundName}`);
        sound.removeEventListener('error', handleError);
        sound.removeEventListener('ended', handleEnded);
        resolve({ duration });
      };

      // イベントリスナーを設定
      sound.addEventListener('error', handleError);
      sound.addEventListener('ended', handleEnded);

      // 音声を再生
      sound.currentTime = 0;
      
      // 音声ファイルの読み込みを待機してから再生を試みる
      waitForLoad().then(() => {
        // モバイルデバイスとPCで処理を分ける
        if (isMobileDevice()) {
          // モバイルデバイスの場合
          console.log('モバイルデバイスで音声を再生します');
          const playPromise = sound.play();
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.error('モバイルデバイスでの音声再生に失敗:', error);
              // NotAllowedErrorの場合、ユーザーに許可を求める
              if (error.name === 'NotAllowedError') {
                console.warn('音声再生の許可が必要です。ユーザーインタラクションを待機します。');
                // ユーザーインタラクションを待機
                document.addEventListener('click', function handleClick() {
                  console.log('ユーザーインタラクションを検出、音声再生を再試行');
                  document.removeEventListener('click', handleClick);
                  sound.play().catch(handleError);
                }, { once: true });
              } else {
                handleError(error);
              }
            });
          }
        } else {
          // PCの場合
          console.log('PCで音声を再生します');
          const playPromise = sound.play();
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.error('PCでの音声再生に失敗:', error);
              handleError(error);
            });
          }
        }
      }).catch(handleError);
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