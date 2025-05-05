import { useState } from 'react';

/** 結果表示の状態型 */
export type ResultDisplayState = {
  /** 結果モーダルの表示状態 */
  showResult: boolean;
  /** 正解かどうかの状態 */
  isCorrect: boolean;
  /** 解答モードへの移行を示すモーダルの表示状態 */
  showAnswerMode: boolean;
};

/** 結果表示の状態を管理するカスタムフック */
export const useGameResult = () => {
  /** 結果表示の状態 */
  const [resultDisplay, setResultDisplay] = useState<ResultDisplayState>({
    showResult: false,
    isCorrect: false,
    showAnswerMode: false
  });

  /** 結果表示の状態を更新する関数 */
  const updateResultDisplay = (updates: Partial<ResultDisplayState>) => {
    setResultDisplay(prev => ({ ...prev, ...updates }));
  };

  /** 結果表示の状態をリセットする関数 */
  const resetResultDisplay = () => {
    setResultDisplay({
      showResult: false,
      isCorrect: false,
      showAnswerMode: false
    });
  };

  return {
    resultDisplay,
    updateResultDisplay,
    resetResultDisplay
  };
}; 