import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import '@/App.css'
import { WaitingMode } from '@/components/WaitingMode';
import { QuestionMode } from '@/components/QuestionMode';

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  /** 数字ボタンの表示数設定 */
  const numbers = Array.from({ length: 10 }, (_, i) => i);
  /** 入力履歴の表示状態 */
  const [inputHistory, setInputHistory] = useState<number[]>([]);
  /** 入力履歴(すべて)の表示状態 */
  const [showAllHistory, setShowAllHistory] = useState(false);
  /** ゲームモード管理(初期値:waiting) */
  const [gameMode, setGameMode] = useState<'waiting' | 'question' | 'answer'>('waiting');
  /** レベル管理 */
  const [level, setLevel] = useState(1);
  /** スコア管理 */
  const [score, setScore] = useState(0);

  /** 数字クリック動作 */
  const handleNumberClick = (number: number) => {
    setInputHistory(prev => [number, ...prev]);
  };

  /** 
   * ゲームスタートボタンがクリックされたときに呼び出される関数
   * 出題モートに移行する。
  */
  const handleStartGame = () => {
    setGameMode('question');
  };

  return (
    <div className="App">
      <header className={`game-header ${gameMode === 'waiting' ? 'with-margin' : ''}`}>
        <h1>Memory Game</h1>
        <p>Test your memory with this fun card matching game!</p>
        {/* スタートボタン waitingモードで表示 */}
        {gameMode === 'waiting' && (
          <WaitingMode 
            onStart={handleStartGame} 
            level={level}
          />
        )}
      </header>
      
      {/* ゲームエリア waitingモード以外で表示 */}
      <div className="game-area">
        {gameMode !== 'waiting' && (
          <QuestionMode
            numbers={numbers}
            inputHistory={inputHistory}
            showAllHistory={showAllHistory}
            level={level}
            score={score}
            onNumberClick={handleNumberClick}
            onToggleHistory={() => setShowAllHistory(!showAllHistory)}
          />
        )}
      </div>
    </div>
  );
}
