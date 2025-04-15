import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

// スタイル定義
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #282c34;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  border: 2px solid #61dafb;
  box-shadow: 0 0 20px rgba(97, 218, 251, 0.3);
  min-width: 300px;

  h2 {
    color: #61dafb;
    margin: 0 0 1rem 0;
    font-size: 2rem;
  }

  h3 {
    color: white;
    margin: 0.5rem 0;
    font-size: 1.5rem;
  }

  p {
    color: #888;
    margin: 1rem 0 0 0;
  }
`;

const CountdownDisplay = styled(motion.div)`
  font-size: 4rem;
  color: #61dafb;
  margin: 1rem 0;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(97, 218, 251, 0.5);

  &.start {
    color: #4CAF50;
    font-size: 3.5rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
`;

const NumberGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  max-width: 500px;
  margin: 0 auto;
`;

const NumberButton = styled(motion.button)`
  background-color: #61dafb;
  border: none;
  border-radius: 8px;
  color: #282c34;
  font-size: 24px;
  padding: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  aspect-ratio: 1;

  &:hover {
    background-color: #4fa8c6;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const GameStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
`;

const Instruction = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background-color: rgba(97, 218, 251, 0.1);
  border-radius: 8px;
  text-align: center;

  h3 {
    margin: 0.5rem 0;
    color: #61dafb;
  }

  h3:first-child {
    margin-bottom: 0.25rem;
    font-size: 1.1em;
  }
`;

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
  /** カウントダウン用の状態を修正 */
  const [countdown, setCountdown] = useState<number | string>(3);

  /** デバッグ用：ゲームをリセットする処理 */
  const handleReset = () => {
    setPhase('preparing');
    setCurrentIndex(-1);
    setSequence([]);
    setCountdown(3);
    generateSequence();
    setPhase('ready');
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
    // カウントダウンタイマーを開始
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (typeof prev === 'number' && prev <= 1) {
          clearInterval(countdownTimer);
          setPhase('showing');
          return 3; // カウントダウンをリセット
        }
        return typeof prev === 'number' ? prev - 1 : prev;
      });
    }, 1000);

    return () => {
      clearInterval(countdownTimer);
    };
  }, []);

  // カウントダウン用のuseEffect
  useEffect(() => {
    if (phase === 'ready') {
      const countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            clearInterval(countdownTimer);
            // 0を表示
            setCountdown(0);
            // 1秒後にStartを表示してshowingフェーズへ
            setTimeout(() => {
              setCountdown('Start');
              setTimeout(() => {
                setPhase('showing');
                setCountdown(3); // カウントダウンをリセット
              }, 1000);
            }, 1000);
            return 0;
          }
          return typeof prev === 'number' ? prev - 1 : prev;
        });
      }, 1000);
  
      return () => {
        clearInterval(countdownTimer);
      };
    }
  }, [phase]);

  // 最新の5件を表示用
  const recentInputs = inputHistory.slice(0, 5);
  // 6件目以降を折りたたみ表示用
  const olderInputs = inputHistory.slice(5);

  return (
    <>
      <GameStatus>
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
      </GameStatus>

      {/* readyフェーズ */}
      {phase === 'ready' && (
        <ModalOverlay>
          <ModalContent>
            <h2>Level {level}</h2>
            <h3>問題の表示を開始します</h3>
            <CountdownDisplay
              key={countdown}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className={countdown === 'Start' ? 'start' : ''}
            >
              {countdown}
            </CountdownDisplay>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* showingフェーズ */}
      {phase === 'showing' && (
        <Instruction>
          <h3>数字をよく見ていてください</h3>
        </Instruction>
      )}

      {/* answeringフェーズ */}
      {phase === 'answering' && (
        <Instruction>
          <h3>このレベルの出題数は{sequence.length}個です</h3>
          <h3>光った順番に数字を押してください</h3>
        </Instruction>
      )}

      {/* 数字ボタン answeringフェーズ以外は無効 */}
      <NumberGrid>
        {numbers.map((number, index) => (
          <NumberButton
            key={number}
            animate={{
              backgroundColor: currentIndex >= 0 && sequence[currentIndex] === index 
                ? '#61dafb' 
                : '#4a90e2'
            }}
            onClick={() => phase === 'answering' && onNumberClick(number)}
            disabled={phase !== 'answering'}
          >
            {number}
          </NumberButton>
        ))}
      </NumberGrid>

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