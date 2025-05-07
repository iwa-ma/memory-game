import type { GameState } from '@/types/game';

/** 解答の検証結果の型 */
export type ValidationResult = {
  isCorrect: boolean;
  expectedNumber: number;
  currentIndex: number;
  isLevelCleared: boolean;
}

/** 解答が正しいかどうかを判定する関数 */
export function isAnswerCorrect(input: number, expectedNumber: number): boolean {
  return input === expectedNumber;
}

/** 解答を検証する関数 */   
export function validateAnswer(
  input: number,
  gameState: GameState,
  currentIndex: number
): ValidationResult {
  // 期待される数字を取得
  const expectedNumber = gameState.sequence[currentIndex];
  // 解答が正しいかどうかを判定
  const isCorrect = isAnswerCorrect(input, expectedNumber);
  // レベルクリアかどうかを判定
  const isLevelCleared = currentIndex + 1 === gameState.sequence.length;

  return {
    isCorrect,
    expectedNumber,
    currentIndex,
    isLevelCleared
  };
} 