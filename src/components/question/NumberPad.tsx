import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

/** 数字ボタン枠のスタイル */
const NumberGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* デフォルトで5列 */
  gap: 10px;
  max-width: 500px;
  margin: 0 auto;
  padding: 0 10px;

  @media (max-width: 480px) { /* スマートフォンサイズで3列に変更 */
    grid-template-columns: repeat(3, 1fr);
  }
`;

/** 数字ボタンのスタイル */
const NumberButton = styled(motion.button)`
  background-color: #61dafb;
  border: none;
  border-radius: 8px;
  color: #282c34;
  font-size: 24px;
  padding: 15px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  aspect-ratio: 1;

  @media (max-width: 480px) {
    font-size: 20px; /* スマートフォンサイズで文字サイズを少し小さく */
  }

  &:hover {
    background-color: #4fa8c6;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

/** QuestionMode.tsxから受け取るProps型 */
type NumberPadProps = {
  /** 数字ボタンの表示数設定 */
  numbers: number[];
  /** 現在光らせているボタンのインデックス */
  currentIndex: number;
  /** 問題の数字配列 */
  sequence: number[];
  /** 出題フェーズの状態管理 */
  phase: string;
  /** 数字クリック動作関数 */
  onNumberClick: (number: number) => void;
};

/** 数字ボタンコンポーネント */
export const NumberPad = ({ 
  numbers, 
  currentIndex, 
  sequence, 
  phase, 
  onNumberClick 
}: NumberPadProps) => {
  /** 音声の有効状態 */
  const soundEnabled = useSelector((state: RootState) => state.settings.soundEnabled);
  /** 音声の種類 */
  const questionVoice = useSelector((state: RootState) => state.settings.questionVoice);
  /** 音声オブジェクトの参照 */
  const soundsRef = useRef<{ [key: number]: HTMLAudioElement }>({});
  // クリックされたボタンのインデックスを保持
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);

  // 音声オブジェクトを初期化する関数
  const initializeSounds = () => {
    if (soundEnabled) {
      const voicePath = questionVoice === 'human1' ? 'human1' : 'human2';
      soundsRef.current = {
        0: new Audio(`/sounds/${voicePath}/0.mp3`),
        1: new Audio(`/sounds/${voicePath}/1.mp3`),
        2: new Audio(`/sounds/${voicePath}/2.mp3`),
        3: new Audio(`/sounds/${voicePath}/3.mp3`),
        4: new Audio(`/sounds/${voicePath}/4.mp3`),
        5: new Audio(`/sounds/${voicePath}/5.mp3`),
        6: new Audio(`/sounds/${voicePath}/6.mp3`),
        7: new Audio(`/sounds/${voicePath}/7.mp3`),
        8: new Audio(`/sounds/${voicePath}/8.mp3`),
        9: new Audio(`/sounds/${voicePath}/9.mp3`),
      };
    } else {
      soundsRef.current = {};
    }
  };

  // soundEnabledまたはquestionVoiceが変更されたときに音声オブジェクトを初期化
  useEffect(() => {
    initializeSounds();
  }, [soundEnabled, questionVoice]);

  // コンポーネントのアンマウント時に音声をクリーンアップ
  useEffect(() => {
    return () => {
      Object.values(soundsRef.current).forEach(sound => {
        sound.pause();
        sound.currentTime = 0;
      });
    };
  }, []);

  // 音声再生のuseEffect
  useEffect(() => {
    if (currentIndex >= 0 && sequence[currentIndex] !== undefined) {
      const sound = soundsRef.current[sequence[currentIndex]];
      if (sound) {
        sound.currentTime = 0; // 音声を最初から再生
        sound.play();
        console.log(`Playing sound for number: ${sequence[currentIndex]}`); // デバッグ用
      }
    }
  }, [currentIndex, sequence]);

  // クリック時のハンドラー
  const handleClick = (number: number, index: number) => {
    if (phase === 'answering') {
      setClickedIndex(index);
      // 0.3秒後に光を消す
      setTimeout(() => setClickedIndex(null), 300);
      handleNumberClick(number);
    }
  };

  /** 数字クリック動作関数 */
  const handleNumberClick = (number: number) => {
    // 音声がオンの場合は音声を再生
    if (soundEnabled) {
      const sound = soundsRef.current[number];
      if (sound) {
        sound.currentTime = 0;
        sound.play();
      }
    }
    onNumberClick(number);
  };

  return (
    <NumberGrid>
      {numbers.map((number, index) => (
        <NumberButton
          key={number}
          animate={{
            backgroundColor: 
              (currentIndex >= 0 && sequence[currentIndex] === index) || clickedIndex === index
                ? '#61dafb' 
                : '#4a90e2'
          }}
          onClick={() => handleClick(number, index)}
          disabled={phase !== 'answering'}
        >
          {number}
        </NumberButton>
      ))}
    </NumberGrid>
  );
};