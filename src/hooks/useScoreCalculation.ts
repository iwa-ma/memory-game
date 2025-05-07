type ScoreCalculationParams = {
  /** 正解かどうか */
  isCorrect: boolean;
  /** 解答時間（秒） */
  answerTime: number;
  /** 現在のコンボ数 */
  comboCount: number;
  /** 現在のレベル */
  level: number;
  /** レベル内でミスをしたかどうか */
  hasMistakeInLevel: boolean;
};

/**
 * スコア計算ロジックを提供するフック
 */
export const useScoreCalculation = () => {
  /**
   * タイムボーナスを計算
   */
  const calculateTimeBonus = (answerTime: number): number => {
    if (answerTime <= 2) {
      return 30;  // 2秒以内: +30点
    } else if (answerTime <= 3) {
      return 15;  // 3秒以内: +15点
    }
    return 0;
  };

  /**
   * コンボボーナスを計算
   */
  const calculateComboBonus = (comboCount: number): number => {
    return comboCount >= 2 ? comboCount * 10 : 0;
  };

  /**
   * 問題のスコアを計算
   */
  const calculateQuestionScore = (isCorrect: boolean, answerTime: number, comboCount: number): number => {
    if (!isCorrect) {
      return -20; // 不正解の場合は固定で-20点
    }
    // 正解の場合のみボーナスを計算
    const baseScore = 50;
    const timeBonus = calculateTimeBonus(answerTime);
    const comboBonus = calculateComboBonus(comboCount);
    return baseScore + timeBonus + comboBonus;
  };

  /**
   * レベルクリア時のスコアを計算
   */
  const calculateLevelClearScore = ({
    level,
    hasMistakeInLevel
  }: Pick<ScoreCalculationParams, 'level' | 'hasMistakeInLevel'>): number => {
    // レベルクリア基本スコア
    const baseScore = level * 100;
    // ノーミスクリアボーナス
    const noMistakeBonus = !hasMistakeInLevel ? level * 500 : 0;

    return baseScore + noMistakeBonus;
  };

  return {
    calculateQuestionScore,
    calculateLevelClearScore
  };
}; 