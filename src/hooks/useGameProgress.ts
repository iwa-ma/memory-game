import { useState } from 'react';

type UseGameProgressProps = {
  /** 初期ライフ数 */
  initialLives: number;
};

type UseGameProgressReturn = {
  /** 残りライフ */
  remainingLives: number;
  /** 残りライフを更新する関数 */
  setRemainingLives: React.Dispatch<React.SetStateAction<number>>;
  /** 正解した数字の数 */
  correctCount: number;
  /** 各入力の正誤結果 */
  answerResults: boolean[];
  /** レベル内でのミス */
  hasMistakeInLevel: boolean;
  /** 正解数をインクリメント */
  incrementCorrectCount: () => void;
  /** 入力の正誤結果を追加 */
  addAnswerResult: (isCorrect: boolean) => void;
  /** レベル内でのミスを設定 */
  setMistake: (hasMistake: boolean) => void;
  /** 進行状態をリセット */
  resetProgress: () => void;
};

/**
 * ゲームの進行状態を管理するフック
 */
export const useGameProgress = ({ initialLives }: UseGameProgressProps): UseGameProgressReturn => {
  /** 残りライフ */
  const [remainingLives, setRemainingLives] = useState(initialLives);
  /** 正解した数字の数 */
  const [correctCount, setCorrectCount] = useState(0);
  /** 各入力の正誤を管理する状態変数 */
  const [answerResults, setAnswerResults] = useState<boolean[]>([]);
  /** レベル内でのミスを管理する状態変数 */
  const [hasMistakeInLevel, setHasMistakeInLevel] = useState(false);

  /** 正解数をインクリメント */
  const incrementCorrectCount = () => {
    setCorrectCount(prev => prev + 1);
  };

  /** 入力の正誤結果を追加 */
  const addAnswerResult = (isCorrect: boolean) => {
    setAnswerResults(prev => [...prev, isCorrect]);
  };

  /** レベル内でのミスを設定 */
  const setMistake = (hasMistake: boolean) => {
    setHasMistakeInLevel(hasMistake);
  };

  /** 進行状態をリセット */
  const resetProgress = () => {
    setCorrectCount(0);
    setAnswerResults([]);
    setHasMistakeInLevel(false);
  };

  return {
    remainingLives,
    setRemainingLives,
    correctCount,
    answerResults,
    hasMistakeInLevel,
    incrementCorrectCount,
    addAnswerResult,
    setMistake,
    resetProgress
  };
}; 