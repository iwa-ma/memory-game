import { createFileRoute } from '@tanstack/react-router'
import { Provider } from 'react-redux'
import { store } from '@/store/store'
import '@/App.css'
import { WaitingMode } from '@/components/WaitingMode';
import { QuestionMode } from '@/components/QuestionMode';
import { useSoundLoader } from '@/hooks/useSoundLoader';
import { useGameLogic } from '@/hooks/useGameLogic';
import { FINAL_LEVEL } from '@/constants/gameConstants';
import { LoadingContainer, LoadingText, LoadingSpinner } from '@/styles/LoadingStyles';
import { SoundNotice } from '@/styles/NoticeStyles';

/** ルート */
export const Route = createFileRoute('/')({
  component: () => (
    <Provider store={store}>
      <App />
    </Provider>
  ),
})

/** アプリケーション（ルートコンポーネント） */
function App() {
  /** 音声ファイル読み込み中の表示 */
  const { isLoading, error } = useSoundLoader();
  /** ゲームロジック */
  const {
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
  } = useGameLogic();

  /** 音声ファイル読み込み中の表示 */
  if (isLoading) {
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
    <div className={`App${gameMode !== 'waiting' ? ' not-waiting' : ''}`}>
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
