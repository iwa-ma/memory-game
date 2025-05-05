import { useState, useEffect } from 'react';

/** ゲームのスコア状態を管理するカスタムフック */
export const useGameScore = () => {
  /** レベル内でのミスを管理する状態変数 */
  const [hasMistakeInLevel, setHasMistakeInLevel] = useState(false);
  /** 現在の問題のスコアを管理する状態変数 */
  const [currentQuestionScore, setCurrentQuestionScore] = useState(0);
  /** コンボ数を管理する状態変数 */
  const [comboCount, setComboCount] = useState(0);
  /** 解答開始時間を管理する状態変数 */
  const [answerStartTime, setAnswerStartTime] = useState<number>(0);

  /** レベルが変更されたときのリセット処理 */
  useEffect(() => {
    setHasMistakeInLevel(false);
    setCurrentQuestionScore(0);
    setComboCount(0);
    setAnswerStartTime(0);
  }, []);

  /** ミス状態を設定する処理 */
  const setMistake = (hasMistake: boolean) => {
    setHasMistakeInLevel(hasMistake);
  };

  /** 問題スコアを設定する処理 */
  const setQuestionScore = (score: number) => {
    setCurrentQuestionScore(score);
  };

  /** コンボ数を更新する処理 */
  const updateCombo = (isCorrect: boolean) => {
    if (isCorrect) {
      setComboCount(prev => prev + 1);
    } else {
      setComboCount(0);
    }
  };

  /** 解答開始時間を設定する処理 */
  const setStartTime = (time: number) => {
    setAnswerStartTime(time);
  };

  /** スコア状態をリセットする処理 */
  const resetScore = () => {
    setHasMistakeInLevel(false);
    setCurrentQuestionScore(0);
    setComboCount(0);
    setAnswerStartTime(0);
  };

  return {
    hasMistakeInLevel,
    currentQuestionScore,
    comboCount,
    answerStartTime,
    setMistake,
    setQuestionScore,
    updateCombo,
    setStartTime,
    resetScore
  };
}; 