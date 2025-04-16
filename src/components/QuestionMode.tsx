import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { GameStatus } from './question/GameStatus';
import { CountdownModal } from './question/CountdownModal';
import { NumberPad } from './question/NumberPad';
import { InputHistory } from './question/InputHistory';
import { generateSequence } from '../utils/gameUtils';

/** メッセージ枠のスタイル */
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
  /** 入力履歴管理配列 */
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
  const [phase, setPhase] = useState<'preparing' | 'ready' | 'showing' | 'answering'>('ready'); // 初期値をreadyに変更
  /** カウントダウン用の状態を修正 */
  const [countdown, setCountdown] = useState<number | 'Start'>(3);

  /** 音声オブジェクトの参照を保持 */
  const audioRef = useRef<{ [key: string]: HTMLAudioElement }>({
    3: new Audio('/sounds/3.mp3'),
    2: new Audio('/sounds/2.mp3'),
    1: new Audio('/sounds/1.mp3'),
    0: new Audio('/sounds/0.mp3'),
    start: new Audio('/sounds/start.mp3')
  });

  /** 音声を再生する関数 */
  const playSound = (key: number | 'Start') => {
    const soundKey = key.toString().toLowerCase();
    const audio = audioRef.current[soundKey];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.error('音声の再生に失敗しました:', error);
      });
    }
  };

  // 初期マウント時の問題生成
  useEffect(() => {
    if (phase === 'ready' && sequence.length === 0) {
      handleGenerateSequence();
    }
  }, []);

  /** デバッグ用：ゲームをリセットする処理 */
  const handleReset = () => {
    setPhase('preparing');
    setCurrentIndex(-1);
    setSequence([]);
    setCountdown(3);
    handleGenerateSequence();
    setPhase('ready');
  };

  /** 問題生成処理 */
  const handleGenerateSequence = () => {
    const newSequence = generateSequence(level, numbers.length);
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
          setCurrentIndex(i);  // ボタンを光らせる(NumberPad.tsxで該当Indexのボタン色変更)
          await new Promise(resolve => setTimeout(resolve, showDuration));  // 表示時間を待つ
          setCurrentIndex(-1);  // ボタンを消灯消す(NumberPad.tsxで該当Indexのボタン色変更)
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

  // 初回マウントとリセット時のカウントダウン処理を統一
  useEffect(() => {
    if (phase === 'ready') {
      // 問題生成（初回マウント時のみ）
      if (sequence.length === 0) {
        handleGenerateSequence();
      }

      // カウントダウン処理
      setCountdown(3);
      playSound(3);

      const timer1 = setTimeout(() => {
        setCountdown(2);
        playSound(2);
        
        const timer2 = setTimeout(() => {
          setCountdown(1);
          playSound(1);
          
          const timer3 = setTimeout(() => {
            setCountdown(0);
            playSound(0);
            
            const timer4 = setTimeout(() => {
              setCountdown('Start');
              playSound('Start');
              
              const timer5 = setTimeout(() => {
                setPhase('showing');
                setCountdown(3);
              }, 1000);
              
              return () => clearTimeout(timer5);
            }, 1000);
            
            return () => clearTimeout(timer4);
          }, 1000);
          
          return () => clearTimeout(timer3);
        }, 1000);
        
        return () => clearTimeout(timer2);
      }, 1000);

      // クリーンアップ関数
      return () => {
        clearTimeout(timer1);
        // 音声をクリーンアップ
        Object.values(audioRef.current).forEach(audio => {
          audio.pause();
          audio.currentTime = 0;
        });
      };
    }
  }, [phase, sequence.length]);

  return (
    <>
      <GameStatus level={level} score={score} onReset={handleReset} />

      {phase === 'ready' && (
        <CountdownModal level={level} countdown={countdown} />
      )}

      {phase === 'showing' && (
        <Instruction>
          <h3>数字をよく見ていてください</h3>
        </Instruction>
      )}

      {phase === 'answering' && (
        <Instruction>
          <h3>このレベルの出題数は{sequence.length}個です</h3>
          <h3>光った順番に数字を押してください</h3>
        </Instruction>
      )}

      <NumberPad
        numbers={numbers}
        currentIndex={currentIndex}
        sequence={sequence}
        phase={phase}
        onNumberClick={onNumberClick}
      />

      <InputHistory
        inputHistory={inputHistory}
        showAllHistory={showAllHistory}
        onToggleHistory={onToggleHistory}
      />
    </>
  );
};