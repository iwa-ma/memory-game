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

  /** タイムボーナスを計算する処理 */
  const calculateTimeBonus = (answerTime: number): number => {
    if (answerTime <= 2) {
      return 30;  // 2秒以内: +30点
    } else if (answerTime <= 3) {
      return 15;  // 3秒以内: +15点
    }
    return 0;
  };

  /** コンボボーナスを計算する処理 */
  const calculateComboBonus = (isCorrect: boolean): number => {
    if (isCorrect) {
      const newComboCount = comboCount + 1;
      if (newComboCount >= 2) {
        return newComboCount * 10; // コンボ数 × 10点のボーナス
      }
    }
    return 0;
  };

  /** ノーミスクリアボーナスを計算する処理 */
  const calculateNoMistakeBonus = (level: number): number => {
    return !hasMistakeInLevel ? level * 500 : 0;
  };

  /** 問題のスコアを計算する処理 */
  const calculateQuestionScore = (isCorrect: boolean, answerTime: number): number => {
    const baseScore = isCorrect ? 50 : -20;
    const timeBonus = calculateTimeBonus(answerTime);
    const comboBonus = calculateComboBonus(isCorrect);
    return baseScore + timeBonus + comboBonus;
  };

  /** レベルクリア時のスコアを計算する処理 */
  const calculateLevelClearScore = (level: number): number => {
    return level * 100 + calculateNoMistakeBonus(level);
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
    resetScore,
    calculateQuestionScore,
    calculateLevelClearScore
  };
}; 