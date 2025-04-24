import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

type SoundFiles = {
  [key: string]: HTMLAudioElement;
};

/** 音声ファイルの読み込み状態を管理するフック */
export const useSoundLoader = () => {
  /** 音声ファイルの読み込み状態 */
  const [isLoading, setIsLoading] = useState(true);
  const [soundFiles, setSoundFiles] = useState<SoundFiles>({});
  const [error, setError] = useState<string | null>(null);

  /** 音声の有効状態 */
  const soundEnabled = useSelector((state: RootState) => state.settings.soundEnabled);
  /** 問題の音声 */
  const questionVoice = useSelector((state: RootState) => state.settings.questionVoice);

  useEffect(() => {
    const loadSounds = async () => {
      if (!soundEnabled) {
        setIsLoading(false);
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

        // 音声ファイルを事前に読み込む
        await Promise.all(
          Object.values(sounds).map(
            sound =>
              new Promise((resolve) => {
                sound.addEventListener('canplaythrough', resolve, { once: true });
                sound.load();
              })
          )
        );

        // 音声ファイルをセット
        setSoundFiles(sounds);
        // 音声ファイルの読み込み状態をfalseにする
        setIsLoading(false);
      } catch (err) { 
        // 音声ファイルの読み込みに失敗した場合
        setError('音声ファイルの読み込みに失敗しました');
        // 音声ファイルの読み込み状態をfalseにする
        setIsLoading(false);
      }
    };

    // 音声ファイルの読み込みを開始 
    loadSounds();
  }, [soundEnabled, questionVoice]);

  /** 音声ファイルを再生する関数 */
  const playSound = (key: string) => {
    if (!soundEnabled) return;

    const sound = soundFiles[key];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(error => {
        console.error('音声の再生に失敗しました:', error);
      });
    }
  };

  return {
    isLoading,
    error,
    playSound,
    soundFiles
  };
}; 