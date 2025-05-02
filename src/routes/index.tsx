import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Provider, useSelector } from 'react-redux'
import { store } from '@/store/store'
import type { RootState } from '@/store/store'
import '@/App.css'
import { WaitingMode } from '@/components/WaitingMode';
import { QuestionMode } from '@/components/QuestionMode';
import { useSoundLoader } from '@/hooks/useSoundLoader';
import { isMobileDevice } from '@/utils/deviceUtils';
import styled from 'styled-components';

export const Route = createFileRoute('/')({
  component: () => (
    <Provider store={store}>
      <App />
    </Provider>
  ),
})

/** 音声ファイル読み込み中のスタイル */
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #282c34;
  color: #61dafb;
`;

/** 音声ファイル読み込み中のテキスト */
const LoadingText = styled.h2`
  margin: 1rem 0;
`;

/** 音声ファイル読み込み中のスピナー */
const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid #61dafb;
  border-top: 5px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

/** 音声に関する注意書き */
const SoundNotice = styled.p`
  font-size: 0.9em;
  color: #61dafb;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
`;

/** 難易度に応じた初期ライフ数を取得する関数 */
const getInitialLives = (difficultyLevel: string): number => {
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

/** 最終レベル */
const FINAL_LEVEL = 10;

function App() {
  /** 開始レベル */
  const startLevel = useSelector((state: RootState) => state.settings.startLevel);
  /** 音声の種類 */
  const questionVoice = useSelector((state: RootState) => state.settings.questionVoice);
  /** 難易度 */
  const difficultyLevel = useSelector((state: RootState) => state.settings.difficultyLevel);
  /** 音声の有効/無効 */
  const soundEnabled = useSelector((state: RootState) => state.settings.soundEnabled);
  /** 数字ボタンの表示数設定(animal1の場合は4、それ以外の場合は10)  */
  const numbers = Array.from({ length: questionVoice === 'animal1' ? 4 : 9 }, (_, i) => i);

  /** 入力履歴の表示状態 */
  const [inputHistory, setInputHistory] = useState<number[]>([]);
  /** 入力履歴(すべて)の表示状態 */
  const [showAllHistory, setShowAllHistory] = useState(false);
  /** ゲームモード管理(初期値:waiting) */
  const [gameMode, setGameMode] = useState<'waiting' | 'question' | 'answer'>('waiting');
  /** レベル管理 */
  const [level, setLevel] = useState(startLevel);
  /** スコア管理 */
  const [score, setScore] = useState(0);
  /** ライフ管理 */
  const [lives, setLives] = useState(() => getInitialLives(difficultyLevel));
  /** 設定モーダルの表示状態 */
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  /** 初回読み込みフラグ */
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { isLoading, error } = useSoundLoader();

  // 初回読み込み完了時にフラグを更新
  useEffect(() => {
    if (!isLoading && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [isLoading]);

  /** 音声再生の準備を行う関数 */
  const prepareAudio = async () => {
    // 音声が有効の場合のみ音声の準備を行う
    if (!soundEnabled) return;
    // モバイル端末の場合のみ音声の準備を行う
    if (isMobileDevice()) {
      try {
      // 音声の準備（実際には再生せず、準備だけ行う）
      const audio = new Audio();
      audio.src = '/sounds/3.mp3';
      await audio.load();
      } catch (error) {
        console.warn('音声の準備に失敗しました:', error);
      }
    }
  };

  // startLevelが変更されたときにlevelを更新
  useEffect(() => {
    if (gameMode === 'waiting') {
      setLevel(startLevel);
    }
  }, [startLevel, gameMode]);

  /** 数字クリック動作 */
  const handleNumberClick = (number: number) => {
    setInputHistory(prev => [number, ...prev]);
  };

  /** レベルアップ処理 */
  const handleLevelUp = () => {
    setLevel((prev: number) => prev + 1);
    setInputHistory([]);
  };

  /** スコア更新処理 */
  const handleScoreUpdate = (newScore: number) => {
    setScore(newScore);
  };

  /** ゲーム終了処理 */
  const handleGameEnd = () => {
    setGameMode('waiting');
    setInputHistory([]);
    setLevel(startLevel);  // レベルをstartLevelにリセット
    setScore(0);  // スコアリセット
    // ライフリセット
    setLives(() => getInitialLives(difficultyLevel));
  };

  /** 
   * ゲームスタートボタンがクリックされたときに呼び出される関数
   * 出題モートに移行する。
  */
  const handleStartGame = async () => {
    // 音声の準備を行う
    try {
      await prepareAudio();
    } catch (error) {
      console.warn('音声の準備に失敗しました:', error);
    }
    setGameMode('question');
    setInputHistory([]);
    setLevel(startLevel);  // レベルをstartLevelにリセット
    setScore(0);  // スコアもリセット
    // ライフリセット
    setLives(() => getInitialLives(difficultyLevel));
  };

  /** 音声ファイル読み込み中の表示 */
  if (isLoading && isInitialLoad) {
    return (
      <LoadingContainer>
        <LoadingText>音声ファイルを読み込み中...</LoadingText>
        <LoadingSpinner />
      </LoadingContainer>
    );
  }

  /** 音声ファイル読み込みに失敗した場合の表示 */
  if (error) {
    return (
      <LoadingContainer>
        <LoadingText>{error}</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <div className="App">
      <header className={`game-header ${gameMode === 'waiting' ? 'with-margin' : ''}`}>
        {/* スタート待機モードのみで表示 */}
        {gameMode === 'waiting' && (
          <>
            <h1>記憶ゲーム</h1>
            <p>一緒に記憶力を試してみましょう！</p>
            <SoundNotice>
              ゲーム中音声が流れます。設定変更で音声がでないようにできます。
            </SoundNotice>
          </>
        )}
        {/* スタートボタン waitingモードで表示 */}
        {gameMode === 'waiting' && (
          <WaitingMode 
            onStart={handleStartGame} 
            isSettingsOpen={isSettingsOpen}
            onSettingsOpen={() => setIsSettingsOpen(true)}
            onSettingsClose={() => setIsSettingsOpen(false)}
          />
        )}
      </header>
      
      {/* ゲームエリア waitingモード以外で表示 */}
      <div className="game-area">
        {gameMode !== 'waiting' && (
          <QuestionMode
            lives={lives}
            numbers={numbers}
            inputHistory={inputHistory}
            showAllHistory={showAllHistory}
            level={level}
            score={score}
            onNumberClick={handleNumberClick}
            onToggleHistory={() => setShowAllHistory(!showAllHistory)}
            onLevelUp={handleLevelUp}
            onScoreUpdate={handleScoreUpdate}
            onGameEnd={handleGameEnd}
            finalLevel={FINAL_LEVEL}
          />
        )}
      </div>
    </div>
  );
}
