/** index.tsxから受け取るProps型 */
type QuestionModeProps = {
  /** 数字ボタンの表示数設定 */
  numbers: number[];
  /** 入力履歴の表示状態 */
  inputHistory: number[];
  /** 入力履歴(すべて)の表示状態 */
  showAllHistory: boolean;
  /** 数字クリック動作関数 */
  onNumberClick: (number: number) => void;
  /** 履歴表示クリック動作関数 */
  onToggleHistory: () => void;
};

/** 出題モードコンポーネント */
export const QuestionMode = ({
  numbers,
  inputHistory,
  showAllHistory,
  onNumberClick,
  onToggleHistory
}: QuestionModeProps) => {
  const recentInputs = inputHistory.slice(0, 5);
  const olderInputs = inputHistory.slice(5);

  return (
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
              onClick={onToggleHistory}
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
            onClick={() => onNumberClick(number)}
          >
            {number}
          </button>
        ))}
      </div>
    </>
  );
};