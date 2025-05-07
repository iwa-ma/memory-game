import { useState } from 'react';

type UseGameScoreReturn = {
  /** 現在の問題のスコア */
  currentQuestionScore: number;
  /** コンボ数 */
  comboCount: number;
  /** 解答開始時間 */
  answerStartTime: number;
  /** レベル内でのミス */
  hasMistakeInLevel: boolean;
  /** 問題のスコアを設定 */
  setQuestionScore: (score: number) => void;
  /** コンボ数を更新 */
  updateCombo: (isCorrect: boolean) => void;
  /** 解答開始時間を設定 */
  setStartTime: (time: number) => void;
  /** レベル内でのミスを設定 */
  setMistake: (hasMistake: boolean) => void;
  /** スコア状態をリセット */
  resetScore: () => void;
};

/**
 * ゲームのスコア状態を管理するフック
 */
export const useGameScore = (): UseGameScoreReturn => {
  /** 現在の問題のスコア */
  const [currentQuestionScore, setCurrentQuestionScore] = useState(0);
  /** コンボ数 */
  const [comboCount, setComboCount] = useState(0);
  /** 解答開始時間 */
  const [answerStartTime, setAnswerStartTime] = useState<number>(0);
  /** レベル内でのミス */
  const [hasMistakeInLevel, setHasMistakeInLevel] = useState(false);

  /** 問題のスコアを設定 */
  const setQuestionScore = (score: number) => {
    setCurrentQuestionScore(score);
  };

  /** コンボ数を更新 */
  const updateCombo = (isCorrect: boolean) => {
    if (isCorrect) {
      setComboCount(prev => prev + 1);
    } else {
      setComboCount(0);
    }
  };

  /** 解答開始時間を設定 */
  const setStartTime = (time: number) => {
    setAnswerStartTime(time);
  };

  /** レベル内でのミスを設定 */
  const setMistake = (hasMistake: boolean) => {
    setHasMistakeInLevel(hasMistake);
  };

  /** スコア状態をリセット */
  const resetScore = () => {
    setCurrentQuestionScore(0);
    setComboCount(0);
    setAnswerStartTime(0);
    setHasMistakeInLevel(false);
  };

  return {
    currentQuestionScore,
    comboCount,
    answerStartTime,
    hasMistakeInLevel,
    setQuestionScore,
    updateCombo,
    setStartTime,
    setMistake,
    resetScore
  };
}; 