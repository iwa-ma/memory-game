import styled from 'styled-components';
import { motion } from 'framer-motion';

/** 数字ボタン枠のスタイル */
const NumberGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  max-width: 500px;
  margin: 0 auto;
`;

/** 数字ボタンのスタイル */
const NumberButton = styled(motion.button)`
  background-color: #61dafb;
  border: none;
  border-radius: 8px;
  color: #282c34;
  font-size: 24px;
  padding: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  aspect-ratio: 1;

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
}: NumberPadProps) => (
  <NumberGrid>
    {numbers.map((number, index) => (
      <NumberButton
        key={number}
        animate={{
          backgroundColor: currentIndex >= 0 && sequence[currentIndex] === index 
            ? '#61dafb' 
            : '#4a90e2'
        }}
        onClick={() => phase === 'answering' && onNumberClick(number)}
        disabled={phase !== 'answering'}
      >
        {number}
      </NumberButton>
    ))}
  </NumberGrid>
);