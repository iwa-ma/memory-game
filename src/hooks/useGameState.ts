import { useState, useEffect } from 'react';
import { generateSequence } from '@/utils/gameUtils';

/** ゲームフェーズ型 */
type GamePhase = 'preparing' | 'ready' | 'showing' | 'answering' | 'result';

/** 基本ゲームステート型 */
type GameState = {
  /** 問題の数字配列 */
  sequence: number[];
  /** 現在光らせているボタンのインデックス */
  currentIndex: number;
  /** 出題フェーズの状態管理 */
  phase: GamePhase;
  /** カウントダウン */
  countdown: number | 'Start';
};

/** ゲームステートのフック型 */
type UseGameStateProps = {
  /** 数字ボタンの表示数設定 */
  numbers: number[];
  /** 現在のレベル */
  level: number;
};

/** ゲームステートのフック */
export const useGameState = ({
  numbers,
  level
}: UseGameStateProps) => {
  const [state, setState] = useState<GameState>({
    sequence: [],
    currentIndex: -1,
    phase: 'ready',
    countdown: 3
  });

  /** 問題の数字配列を生成 */
  const handleGenerateSequence = () => {
    const newSequence = generateSequence(level, numbers.length);
    setState(prev => ({ ...prev, sequence: newSequence }));
    return newSequence;
  };

  /** フェーズを変更 */
  const setPhase = (newPhase: GamePhase) => {
    setState(prev => ({ ...prev, phase: newPhase }));
  };

  /** カウントダウンを更新 */
  const setCountdown = (value: number | 'Start') => {
    setState(prev => ({ ...prev, countdown: value }));
  };

  /** 現在のインデックスを更新 */
  const setCurrentIndex = (index: number) => {
    setState(prev => ({ ...prev, currentIndex: index }));
  };

  /** シーケンスをリセット */
  const resetSequence = () => {
    setState(prev => ({ ...prev, sequence: [] }));
  };

  // 初回マウント時の問題生成
  useEffect(() => {
    if (state.phase === 'ready' && state.sequence.length === 0) {
      handleGenerateSequence();
    }
  }, []);

  // levelが変更されたときに問題を生成
  useEffect(() => {
    if (state.phase === 'ready') {
      handleGenerateSequence();
    }
  }, [level]);

  return {
    state,
    setState,
    handleGenerateSequence,
    setPhase,
    setCountdown,
    setCurrentIndex,
    resetSequence
  };
}; 