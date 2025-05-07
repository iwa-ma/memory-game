import { useState, useCallback } from 'react';

/** useGameScoreフックの戻り値の型 */
export type UseGameScoreReturn = {
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
  /** スコア更新完了時のコールバック */
  onScoreUpdateComplete: (callback: () => void) => void;
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
  /** スコア更新完了時のコールバック */
  const [scoreUpdateCallback, setScoreUpdateCallback] = useState<(() => void) | null>(null);

  /** 問題のスコアを設定 */
  const setQuestionScore = useCallback((score: number) => {
    setCurrentQuestionScore(score);
    // スコア更新完了時のコールバックを実行
    if (scoreUpdateCallback) {
      scoreUpdateCallback();
      setScoreUpdateCallback(null);
    }
  }, [scoreUpdateCallback]);

  /** コンボ数を更新 */
  const updateCombo = useCallback((isCorrect: boolean) => {
    if (isCorrect) {
      setComboCount(prev => prev + 1);
    } else {
      setComboCount(0);
    }
  }, []);

  /** 解答開始時間を設定 */
  const setStartTime = useCallback((time: number) => {
    setAnswerStartTime(time);
  }, []);

  /** レベル内でのミスを設定 */
  const setMistake = (hasMistake: boolean) => {
    setHasMistakeInLevel(hasMistake);
  };

  /** スコア状態をリセット */
  const resetScore = useCallback(() => {
    setCurrentQuestionScore(0);
    setComboCount(0);
    setAnswerStartTime(0);
    setHasMistakeInLevel(false);
    setScoreUpdateCallback(null);
  }, []);

  /** スコア更新完了時のコールバックを設定する関数 */
  const onScoreUpdateComplete = useCallback((callback: () => void) => {
    setScoreUpdateCallback(() => callback);
  }, []);

  return {
    currentQuestionScore,
    comboCount,
    answerStartTime,
    hasMistakeInLevel,
    setQuestionScore,
    updateCombo,
    setStartTime,
    setMistake,
    resetScore,
    onScoreUpdateComplete
  };
}; 