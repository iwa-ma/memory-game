import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { motion } from 'framer-motion';
import '../App.css'

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

  const handleNumberClick = (number: number) => {
    setInputHistory(prev => [number, ...prev]);
  };

  /** ゲームスタートボタンクリック動作 */
  const handleStartGame = () => {
    setGameMode('question');
    // 出題モードの処理は後で実装
  };

  const recentInputs = inputHistory.slice(0, 5);
  const olderInputs = inputHistory.slice(5);

  return (
    <div className="App">
      <header className="game-header">
        <h1>Memory Game</h1>
        <p>Test your memory with this fun card matching game!</p>
        {gameMode === 'waiting' && (
          <motion.button
            className="start-button"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [1, 0.8, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            onClick={handleStartGame}
          >
            ゲームスタート
          </motion.button>
        )}
      </header>
      
      <div className="game-area">
        {/* モードに応じて表示を切り替え */}
        {gameMode !== 'waiting' && (
          <>
            <div className="game-status">
              <p>Level: 1</p>
              <p>Score: 0</p>
            </div>

            <div className="input-history">
              <h3>入力履歴</h3>
              <div className="recent-inputs">
                {recentInputs.map((num, idx) => (
                  <span key={idx} className="input-number">{num}</span>
                ))}
              </div>
              {inputHistory.length > 5 && (
                <>
                  <button 
                    className="show-more-button"
                    onClick={() => setShowAllHistory(!showAllHistory)}
                  >
                    {showAllHistory ? '履歴を隠す' : 'すべての履歴を表示'}
                  </button>
                  {showAllHistory && (
                    <div className="all-inputs">
                      {olderInputs.map((num, idx) => (
                        <span key={idx} className="input-number">{num}</span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="number-grid">
              {numbers.map((number) => (
                <button
                  key={number}
                  className="number-button"
                  onClick={() => handleNumberClick(number)}
                >
                  {number}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
