import { useState, useEffect } from 'react';

/** ゲームの進行状態を管理するカスタムフック */
export const useGameProgress = (initialLives: number) => {
  /** 残りライフ */
  const [remainingLives, setRemainingLives] = useState(initialLives);
  /** 正解した数字の数 */
  const [correctCount, setCorrectCount] = useState(0);
  /** 各入力の正誤 */
  const [answerResults, setAnswerResults] = useState<boolean[]>([]);

  /** レベルが変更されたときのリセット処理 */
  useEffect(() => {
    setCorrectCount(0);
    setAnswerResults([]);
  }, []);

  /** ライフを減らす処理 */
  const decreaseLife = () => {
    setRemainingLives(prev => Math.max(0, prev - 1));
  };

  /** 正解数を増やす処理 */
  const incrementCorrectCount = () => {
    setCorrectCount(prev => prev + 1);
  };

  /** 解答結果を追加する処理 */
  const addAnswerResult = (isCorrect: boolean) => {
    setAnswerResults(prev => [...prev, isCorrect]);
  };

  /** ゲームの進行状態をリセットする処理 */
  const resetProgress = () => {
    setCorrectCount(0);
    setAnswerResults([]);
  };

  return {
    remainingLives,
    correctCount,
    answerResults,
    decreaseLife,
    incrementCorrectCount,
    addAnswerResult,
    resetProgress
  };
}; 