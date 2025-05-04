/** 最終レベル */
export const FINAL_LEVEL = 10;
/** ゲームモードの型 */ 
export type GameMode = 'waiting' | 'question' | 'answer';
/** 難易度設定の型 */
export type DifficultySettings = {
  /** ボタン数 */
  buttonCount: number;
  /** 最大数字 */
  maxNumber: number;
}

/** ライフ数取得関数 */
export function getInitialLives(difficultyLevel: string): number {
    switch (difficultyLevel) {
      case 'practice':
        return 999;
      case 'easy':
        return 20;
      case 'normal':
        return 15;
      case 'hard':
        return 10;
      default:
        return 15;
    }
  };

/** 難易度に応じたボタン数と最大数字を取得する関数 */
export function getDifficultySettings(difficulty: string): DifficultySettings {
  switch (difficulty) {
    case 'practice':
      return { buttonCount: 4, maxNumber: 3 };
    case 'easy':
      return { buttonCount: 4, maxNumber: 3 };
    case 'normal':
      return { buttonCount: 5, maxNumber: 4 };
    case 'hard':
      return { buttonCount: 6, maxNumber: 5 };
    default:
      return { buttonCount: 4, maxNumber: 3 };
  }
}; 