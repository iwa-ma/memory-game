import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { getInitialLives, getDifficultySettings } from '@/constants/gameConstants';
import type { GameMode } from '@/constants/gameConstants';

/** ゲームロジックの返り値の型 */
type GameLogicResult = {
  /** 出題に使う数値リスト */
  numbers: number[];
  /** 入力履歴 */
  inputHistory: number[];
  /** 全履歴表示フラグ */
  showAllHistory: boolean;
  /** 現在のゲームモード */
  gameMode: GameMode;
  /** 現在のレベル */
  level: number;
  /** 現在のスコア */
  score: number;
  /** 残りライフ */
  lives: number;
  /** 設定画面の開閉状態 */
  isSettingsOpen: boolean;
  /** 数字クリック時の処理 */
  handleNumberClick: (number: number) => void;
  /** レベルアップ処理 */
  handleLevelUp: () => void;
  /** スコア更新処理 */
  handleScoreUpdate: (newScore: number) => void;
  /** ゲーム終了処理 */
  handleGameEnd: () => void;
  /** ゲーム開始処理 */
  handleStartGame: () => void;
  /** 全履歴表示切り替え */
  setShowAllHistory: Dispatch<SetStateAction<boolean>>;
  /** 設定画面表示切り替え */
  setIsSettingsOpen: Dispatch<SetStateAction<boolean>>;
};

/** ゲームロジック */
export const useGameLogic = (): GameLogicResult => {
  /** 開始レベル */
  const startLevel = useSelector((state: RootState) => state.settings.startLevel);
  /** 音声の種類 */
  const questionVoice = useSelector((state: RootState) => state.settings.questionVoice);
  /** 難易度 */
  const difficultyLevel = useSelector((state: RootState) => state.settings.difficultyLevel);

  /** 難易度に応じたボタン数を取得 */
  const { buttonCount } = getDifficultySettings(difficultyLevel);

  /** ボタン数に応じて数字配列を生成 */
  const numbers = Array.from(
    { length: questionVoice === 'animal1' ? 4 : buttonCount },
    (_, i) => i
  );

  /** 入力履歴 */
  const [inputHistory, setInputHistory] = useState<number[]>([]);
  /** 全履歴表示有効化状態 */
  const [showAllHistory, setShowAllHistory] = useState(false);
  /** ゲームモード(waiting: 待機, question: 出題, answer: 解答  ) */
  const [gameMode, setGameMode] = useState<GameMode>('waiting');
  /** レベル */
  const [level, setLevel] = useState(startLevel);
  /** スコア */
  const [score, setScore] = useState(0);
  /** ライフ(難易度に応じたライフ数) */
  const [lives, setLives] = useState(() => getInitialLives(difficultyLevel));
  /** 設定画面表示 */
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  /** レベルの初期化 */
  useEffect(() => {
    /** 待機モードの場合、開始レベルを設定 */
    if (gameMode === 'waiting') {
      setLevel(startLevel);
    }
  }, [startLevel, gameMode]);

  /** 数字クリック時の処理 */   
  const handleNumberClick = (number: number) => {
    setInputHistory(prev => [number, ...prev]);
  };

  /** レベルアップ時の処理 */
  const handleLevelUp = () => { 
    /** レベルを1上げる */
    setLevel(prev => prev + 1);
    /** 入力履歴を空にする */
    setInputHistory([]);
  };

  /** スコア更新時の処理 */ 
  const handleScoreUpdate = (newScore: number) => {
    /** スコアを更新する */
    setScore(newScore);
  };

  /** ゲーム終了時の処理 */
  const handleGameEnd = () => {
    /** 待機モードに戻る */
    setGameMode('waiting');
    /** 入力履歴を空にする */
    setInputHistory([]);
    /** レベルを開始レベルに戻す */
    setLevel(startLevel);
    /** スコアを0にする */
    setScore(0);
    /** ライフを初期化する */
    setLives(() => getInitialLives(difficultyLevel));
  };

  /** ゲームスタート時の処理 */
  const handleStartGame = () => {   
    /** 出題モードに遷移 */
    setGameMode('question');
    /** 入力履歴を空にする */
    setInputHistory([]);
    /** レベルを開始レベルにする */
    setLevel(startLevel);
    /** スコアを0にする */
    setScore(0);
    /** ライフを初期化する */
    setLives(() => getInitialLives(difficultyLevel));
  };

  return {
    numbers,
    inputHistory,
    showAllHistory,
    gameMode,
    level,
    score,
    lives,
    isSettingsOpen,
    handleNumberClick,
    handleLevelUp,
    handleScoreUpdate,
    handleGameEnd,
    handleStartGame,
    setShowAllHistory,
    setIsSettingsOpen,
  };
}; 