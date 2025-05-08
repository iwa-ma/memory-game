import { useState, useRef, useEffect } from 'react';
import { useSoundLoader } from './useSoundLoader';

type CountdownValue = number | 'Start';

/** カウントダウン処理を管理するカスタムフック */
export const useGameCountdown = (
  isSoundEnabled: boolean,
  isSoundLoaded: boolean,
  isAudioReady: boolean,
  onCountdownComplete: () => void,
  phase: string
) => {
  /** カウントダウンの値 */
  const [countdown, setCountdown] = useState<CountdownValue>(3);
  /** カウントダウン実行中かどうかの参照 */
  const countdownRef = useRef<{ isRunning: boolean }>({ isRunning: false });
  /** 音声ローダー */
  const { playSound } = useSoundLoader();

  /** カウントダウン音声を再生する関数 */
  const playCountdownSound = async (value: CountdownValue) => {
    if (isSoundEnabled) {
      try {
        const soundName = value === 'Start' ? 'start' : value.toString();
        await playSound(soundName);
      } catch (error) {
        console.warn('カウントダウン音声の再生に失敗しました:', error);
      }
    }
  };

  /** カウントダウンを開始する関数 */
  const startCountdown = () => {
    if (countdownRef.current.isRunning) return;

    // カウントダウン開始フラグを設定
    countdownRef.current.isRunning = true;

    // カウントダウン開始
    const countdownValues: CountdownValue[] = [3, 2, 1, 0, 'Start'];
    let currentIndex = 0;

    // カウントダウンを処理する関数
    const processCountdown = async () => {
      if (!countdownRef.current.isRunning) return;

      // カウントダウンの値が存在する場合
      if (currentIndex < countdownValues.length) {
        const currentValue = countdownValues[currentIndex];
        // カウントダウンの値を設定
        setCountdown(currentValue);
        
        if (isSoundEnabled) {
          // 音声が有効な場合は音声再生を待機
          await playCountdownSound(currentValue);
        } else {
          // 音声が無効な場合は1秒待機
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // カウントダウンインデックスをインクリメント
        currentIndex++;
        // 次のカウントダウンを処理
        processCountdown();
      } else {
        // カウントダウン終了後、コールバックを実行
        onCountdownComplete();
        // カウントダウン開始フラグをリセット
        countdownRef.current.isRunning = false;
      }
    };

    // カウントダウン開始
    processCountdown();
  };

  /** カウントダウンをリセットする関数 */
  const resetCountdown = () => {
    setCountdown(3);
    countdownRef.current.isRunning = false;
  };

  /** カウントダウンを停止する関数 */
  const stopCountdown = () => {
    countdownRef.current.isRunning = false;
  };

  /** 音声の準備ができたらカウントダウンを開始 */
  useEffect(() => {
    // カウントダウンが開始されていない場合
    const isReadyToStart = phase === 'ready' && !countdownRef.current.isRunning;
    // 音声が無効な場合は、音声の準備状態に関係なくカウントダウンを開始
    const isSoundReady = isSoundEnabled ? (isSoundLoaded && isAudioReady) : true;

    if (isReadyToStart && isSoundReady) {
      startCountdown();
    }
  }, [phase, isSoundLoaded, isAudioReady, isSoundEnabled, onCountdownComplete, startCountdown]);

  return {
    countdown,
    startCountdown,
    resetCountdown,
    stopCountdown
  };
}; 