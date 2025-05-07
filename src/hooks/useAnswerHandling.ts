import { useSoundLoader } from './useSoundLoader';
import type { GamePhase } from '@/types/game';

/** 解答処理のprops */
type UseAnswerHandlingProps = {
  isSoundEnabled: boolean; // 音声有効/無効
  onResultDisplay: (isCorrect: boolean) => void; // 結果表示
  onMistake: () => void; // ミス状態
  onRemainingLivesUpdate: (callback: (prev: number) => number) => void; // ライフ更新
  onPhaseChange: (phase: GamePhase) => void; // フェーズ変更
  onCorrectCountIncrement: () => void; // 正解数増加
  onStartTimeUpdate: (time: number) => void; // 開始時間更新
  onLevelClear: (levelClearScore: number) => void; // レベルクリア
  onResetResultDisplay: () => void; // 結果表示リセット
  level: number; // 現在のレベル
  hasMistakeInLevel: boolean; // レベル内でミスをしたかどうか
};

/** 解答後処理のフック */
export const useAnswerHandling = ({
  isSoundEnabled,
  onResultDisplay,
  onMistake,
  onRemainingLivesUpdate,
  onPhaseChange,
  onCorrectCountIncrement,
  onStartTimeUpdate,
  onLevelClear,
  onResetResultDisplay,
  level,
  hasMistakeInLevel
}: UseAnswerHandlingProps) => {
  const { playSound, getSoundDuration } = useSoundLoader();

  /** 不正解時の処理 */
  const handleIncorrectAnswer = async () => {
    // 結果表示を更新
    onResultDisplay(false);
    // レベル内でミスがあったことを記録
    onMistake();

    // 音声再生
    if (isSoundEnabled) {
      // 不正解音声の再生時間を取得
      const soundDuration = getSoundDuration('incorrect');
      // 再生時間が0.1秒より短い場合は1.0秒として扱う
      const validDuration = soundDuration > 0.1 ? soundDuration : 1.0;
      // 不正解音声を再生し、再生時間が経過したら次の処理へ
      await Promise.all([
        playSound('incorrect'),
        new Promise(resolve => setTimeout(resolve, (validDuration * 1000)))
      ]);
    } else {
      // 音声無効時は1秒待機
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // ライフを1減らす処理
    onRemainingLivesUpdate(prev => {
      const newLives = Math.max(0, prev - 1);
      if (newLives === 0) {
        onPhaseChange('result');
        onResultDisplay(false);
      } else {
        onResetResultDisplay();
        onStartTimeUpdate(Date.now());
      }
      return newLives;
    });
  };

  /** 正解時の処理 */
  const handleCorrectAnswer = async (isLevelCleared: boolean) => {
    // 結果表示を更新
    onResultDisplay(true);

    // 音声再生
    if (isSoundEnabled) {
      // 音声の長さを取得
      const soundDuration = getSoundDuration('correct');
      // 音声の長さが異常な値の場合はデフォルト値を使用
      const validDuration = soundDuration > 0.1 ? soundDuration : 1.0;
      // 音声再生と同時に待機を開始
      await Promise.all([
        playSound('correct'),
        new Promise(resolve => setTimeout(resolve, (validDuration * 1000)))
      ]);
    } else {
      // 音声が無効な場合は固定の待機時間(1.0秒)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 正解数をインクリメント
    onCorrectCountIncrement();
    
    if (isLevelCleared) {
      // レベルクリア
      onPhaseChange('result');
      // レベルクリアスコアを計算（基本スコア + ノーミスクリアボーナス）
      const levelClearScore = level * 100 + (!hasMistakeInLevel ? level * 500 : 0);
      console.log('Level clear phase:', {
        phase: 'result',
        scoreUpdate: {
          levelClearScore,
          breakdown: {
            baseScore: level * 100,
            noMistakeBonus: !hasMistakeInLevel ? level * 500 : 0
          }
        }
      });
      onLevelClear(levelClearScore);
    } else {
      // 途中の正解の場合
      onResetResultDisplay();
      onStartTimeUpdate(Date.now());
    }
  };

  return {
    handleIncorrectAnswer,
    handleCorrectAnswer
  };
}; 