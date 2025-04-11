import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import '../App.css'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const numbers = Array.from({ length: 10 }, (_, i) => i);
  const [inputHistory, setInputHistory] = useState<number[]>([]);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const handleNumberClick = (number: number) => {
    setInputHistory(prev => [number, ...prev]);
  };

  const recentInputs = inputHistory.slice(0, 5);
  const olderInputs = inputHistory.slice(5);

  return (
    <div className="App">
      <header className="game-header">
        <h1>Memory Game</h1>
        <p>Test your memory with this fun card matching game!</p>
      </header>
      
      <div className="game-area">
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
      </div>
    </div>
  )
}
