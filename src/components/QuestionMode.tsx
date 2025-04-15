import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/** index.tsxから受け取るProps型 */
type QuestionModeProps = {
  /** 数字ボタンの表示数設定 */
  numbers: number[];
  /** 入力履歴の表示状態 */
  inputHistory: number[];
  /** 入力履歴(すべて)の表示状態 */
  showAllHistory: boolean;
  /** 現在のレベル */
  level: number;
  /** スコア */
  score: number;
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
  level,
  score,
  onNumberClick,
  onToggleHistory
}: QuestionModeProps) => {
  /** 問題の数字配列 */
  const [sequence, setSequence] = useState<number[]>([]);
  /** 現在光らせているボタンのインデックス */
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  /** 出題フェーズの状態管理 */
  const [phase, setPhase] = useState<'preparing' | 'ready' | 'showing' | 'answering'>('preparing');

  /** デバッグ用：ゲームをリセットする処理 */
  const handleReset = () => {
    setPhase('preparing');
    setCurrentIndex(-1);
    setSequence([]);
    generateSequence();

    setPhase('ready');
    // 2秒後に showing フェーズへ移行
    const timer = setTimeout(() => {
      setPhase('showing');
    }, 2000);
    return () => clearTimeout(timer);

  };

  /** 問題生成処理 */
  const generateSequence = () => {
    // 生成する数字の数(レベルに応じて数を増やす)
    const sequenceLength = level + 2;  
    
    // 出題の個数分数字を生成
    const newSequence = Array.from(
      { length: sequenceLength }, 
      () => Math.floor(Math.random() * numbers.length)
    );
    // 生成した数字配列で、問題の数字配列を更新
    setSequence(newSequence);
    return newSequence;
  };

  /** 数字を順番に光らせる処理 */
  useEffect(() => {
    // showingフェーズで、出題数字が存在する場合に実行
    if (phase === 'showing' && sequence.length > 0) {
      const showSequence = async () => {
        // 各数字の表示時間
        const showDuration = 800; // ミリ秒
        // 数字と数字の間の待機時間
        const intervalDuration = 400; // ミリ秒

        for (let i = 0; i < sequence.length; i++) {
          // ボタンを光らせる動作はmotion.buttonのanimateプロパティで行う、
          // setCurrentIndexで指定した添え字の数字が対象。
          setCurrentIndex(i);  // ボタンを光らせる
          await new Promise(resolve => setTimeout(resolve, showDuration));  // 表示時間を待つ
          setCurrentIndex(-1);  // ボタンを消灯消す
          // 次の数字まで待機（最後の数字の場合は待機しない）
          if (i < sequence.length - 1) {
            await new Promise(resolve => setTimeout(resolve, intervalDuration));
          }
        }
        setPhase('answering');
      };
      showSequence();
    }
  }, [phase, sequence]);

  // 初回マウント
  useEffect(() => {
    // 問題生成
    generateSequence();
    // フェーズreadyを開始
    setPhase('ready');
    // 2秒後に showing フェーズへ移行
    const timer = setTimeout(() => {
      setPhase('showing');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // 最新の5件を表示用
  const recentInputs = inputHistory.slice(0, 5);
  // 6件目以降を折りたたみ表示用
  const olderInputs = inputHistory.slice(5);

  return (
    <>
      <div className="game-status">
        <p>Level: {level}</p>
        <p>Score: {score}</p>
        <motion.button
          className="debug-button"
          onClick={handleReset}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          リセット
        </motion.button>
      </div>

      {/* readyフェーズ */}
      {phase === 'ready' && (
        <div className="instruction">
          <h3>問題の表示を開始します</h3>
        </div>
      )}

      {/* showingフェーズ */}
      {phase === 'showing' && (
        <div className="instruction">
          <h3>数字をよく見ていてください</h3>
        </div>
      )}

      {/* answeringフェーズ */}
      {phase === 'answering' && (
        <div className="instruction">
          <h3>このレベルの出題数は{sequence.length}個です</h3>
          <h3>光った順番に数字を押してください</h3>
        </div>
      )}

      {/* 数字ボタン answeringフェーズ以外は無効 */}
      <div className="number-grid">
        {numbers.map((number, index) => (
          <motion.button
            key={number}
            className="number-button"
            animate={{
              backgroundColor: currentIndex >= 0 && sequence[currentIndex] === index 
                ? '#61dafb' 
                : '#4a90e2'
            }}
            onClick={() => phase === 'answering' && onNumberClick(number)}
            disabled={phase !== 'answering'}
          >
            {number}
          </motion.button>
        ))}
      </div>

      {/* 回答入力履歴 */}
      <div className="input-history">
        <h3>入力履歴</h3>
        {/* 最新5件を常に表示 */}
        <div className="recent-inputs">
          {recentInputs.map((num, idx) => (
            <span key={idx} className="input-number">{num}</span>
          ))}
        </div>
        
        {/* 6件以上ある場合のみ表示 */}
        {inputHistory.length > 5 && (
          <>
            <button 
              className="show-more-button"
              onClick={onToggleHistory}
            >
              {showAllHistory ? '履歴を隠す' : 'すべての履歴を表示'}
            </button>
            {/* 折りたたみ部分 */}
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
    </>
  );
};