import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

/** 数字ボタン枠のスタイル */
const NumberGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* PCでも3列に統一 */
  gap: 10px;
  max-width: 400px; /* 3列なので最大幅を少し狭く */
  margin: 0 auto;
  padding: 0 10px;
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
  /** 音声の種類 */
  const questionVoice = useSelector((state: RootState) => state.settings.questionVoice);
  // クリックされたボタンのインデックスを保持
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);

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
          {/* 音声の種類がanimal1の場合、ボタンに表示する文字を変更 */}
          {questionVoice === 'animal1' ? (
            number === 0 ? 'ニャー' :
            number === 1 ? '甘え声' :
            number === 2 ? 'ニャウ～ン' :
            number === 3 ? 'ギニャー' :
            number
          ) : number}
        </NumberButton>
      ))}
    </NumberGrid>
  );
};