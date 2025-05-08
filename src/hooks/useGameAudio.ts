import { useState, useEffect, useRef } from 'react';
import { useSoundLoader } from './useSoundLoader';
import { isMobileDevice } from '@/utils/deviceUtils';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

/** 音声再生の準備を行う関数 */
export const useGameAudio = (numbers: number[]) => {
  /** 音声の種類 */
  const questionVoice = useSelector((state: RootState) => state.settings.questionVoice);
  /** 音声オンオフ */
  const isSoundEnabled = useSelector((state: RootState) => state.settings.soundEnabled);
  /** 音声ファイルの読み込み状態 */
  const [isSoundLoaded, setIsSoundLoaded] = useState(false);
  /** 音声再生の準備状態 */
  const [isAudioReady, setIsAudioReady] = useState(false);
  /** 音声ファイルの参照を保持 */
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement[] }>({});

  /** 音声ローダー */
  const { playSound, getSoundDuration, isLoading } = useSoundLoader();

  // 音声ファイルの読み込み状態を監視
  useEffect(() => {
    if (!isLoading) {
      setIsSoundLoaded(true);
    }
  }, [isLoading]);

  // questionVoiceまたはnumbersが変更された時に音声を再準備
  useEffect(() => {
    prepareAudio();
    // クリーンアップ関数
    return () => {
      // 音声ファイルの参照をクリア
      Object.values(audioRefs.current).forEach(audios => {
        audios.forEach(audio => {
          audio.pause();
          audio.src = '';
        });
      });
      audioRefs.current = {};
    };
  }, [questionVoice, numbers.length]);

  /** 音声再生の準備を行う関数 */
  const prepareAudio = async () => {
    // 既存の音声ファイルをクリア
    Object.values(audioRefs.current).forEach(audios => {
      audios.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    });
    audioRefs.current = {};

    // モバイル端末の場合のみ音声の準備を行う
    if (isMobileDevice()) {
      try {
        // 音声ファイルの準備
        const sounds = {
          // 共通の音声
          common: ['correct', 'incorrect'],
          // カウントダウンと開始音声
          countdown: ['3', '2', '1', '0', 'start'],
          // 音声タイプ別の音声
          animal1: ['cat1', 'cat2', 'cat3', 'cat4'],
          human1: Array.from({ length: numbers.length }, (_, i) => `num${i}`),
          human2: Array.from({ length: numbers.length }, (_, i) => `num${i}`)
        };

        // 必要な音声ファイルを準備
        const requiredSounds = [
          ...sounds.common,
          ...sounds.countdown,
          ...(questionVoice === 'animal1' ? sounds.animal1 : sounds[questionVoice])
        ];

        console.log('音声ファイルの準備を開始:', JSON.stringify({
          preparation: {
            voiceType: questionVoice,
            totalSounds: requiredSounds.length,
            sounds: requiredSounds
          }
        }, null, 2));
        
        // 各音声ファイルに対してplay()とpause()を実行
        await Promise.all(requiredSounds.map(async (soundName) => {
          const audio = new Audio();
          audio.src = `/sounds/${questionVoice === 'animal1' ? 'animal1' : questionVoice}/${soundName}.mp3`;
          // 音声ファイルの参照を保持
          if (!audioRefs.current[soundName]) {
            audioRefs.current[soundName] = [];
          }
          audioRefs.current[soundName].push(audio);
          // iPhone SE2のNotAllowedError対策: 音声を鳴らさずにplay()→pause()を実行
          // これにより、後続の音声再生が正常に動作するようになる
          audio.play();
          audio.pause();
        }));

        console.log('音声の準備が完了しました');
        setIsAudioReady(true);
      } catch (error) {
        console.warn('音声の準備に失敗しました:', error);
        // エラーが発生しても準備完了として扱う
        setIsAudioReady(true);
      }
    } else {
      // モバイル端末以外の場合は準備完了として扱う
      setIsAudioReady(true);
    }
  };

  /** 問題の音声を再生する関数 */
  const playQuestionSound = async (number: number) => {
    if (!isSoundEnabled) return;

    try {
      let soundName = '';
      
      if (questionVoice === 'animal1') {
        switch (number) {
          case 0: soundName = 'cat1'; break;
          case 1: soundName = 'cat2'; break;
          case 2: soundName = 'cat3'; break;
          case 3: soundName = 'cat4'; break;
        }
      } else {
        soundName = `num${number}`;
      }

      // 音声の待機時間を計算
      const displayDuration = (getSoundDuration(soundName) * 1000) + (isMobileDevice() ? 500 : 300);

      // 音声の再生と表示時間の待機を同時に開始
      await Promise.all([
        playSound(soundName),
        new Promise(resolve => setTimeout(resolve, displayDuration))
      ]);
    } catch (error) {
      console.warn('音声の再生に失敗しました:', error);
      // エラー時は固定の待機時間を使用
      await new Promise(resolve => setTimeout(resolve, 1300));
    }
  };

  return {
    isSoundEnabled,
    isSoundLoaded,
    isAudioReady,
    prepareAudio,
    playQuestionSound,
    playSound,
    getSoundDuration
  };
}; 