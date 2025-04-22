import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { GameStatus } from '@/components/question/GameStatus';
import { CountdownModal } from '@/components/question/CountdownModal';
import { NumberPad } from '@/components/question/NumberPad';
import { InputHistory } from '@/components/question/InputHistory';
import { ResultModal } from '@/components/question/ResultModal';
import { generateSequence } from '@/utils/gameUtils';

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
  /** レベル更新関数 */
  onLevelUp: () => void;
  /** スコア更新関数 */
  onScoreUpdate: (newScore: number) => void;
  /** ゲーム終了関数 */
  onGameEnd: () => void;
  /** 音声の有効状態 */
  soundEnabled: boolean;
};

/** 出題モードコンポーネント */
export const QuestionMode = ({
  numbers,
  inputHistory,
  showAllHistory,
  level,
  score,
  onNumberClick,
  onToggleHistory,
  onLevelUp,
  onScoreUpdate,
  onGameEnd,
  soundEnabled
}: QuestionModeProps) => {
  /** 問題の数字配列 */
  const [sequence, setSequence] = useState<number[]>([]);
  /** 現在光らせているボタンのインデックス */
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  /** 出題フェーズの状態管理 */
  const [phase, setPhase] = useState<'preparing' | 'ready' | 'showing' | 'answering' | 'result'>('ready');
  /** カウントダウン用の状態を修正 */
  const [countdown, setCountdown] = useState<number | 'Start'>(3);
  /** 結果モーダルの表示状態 */
  const [showResult, setShowResult] = useState(false);
  /** 正解かどうかの状態 */
  const [isCorrect, setIsCorrect] = useState(false);

  /** 音声オブジェクトの参照を保持 */
  const audioRef = useRef<{ [key: string]: HTMLAudioElement }>({});

  /** 音声オブジェクトを初期化する関数 */
  const initializeAudio = () => {
    if (soundEnabled) {
      audioRef.current = {
        // カウントダウンの音声
        3: new Audio('/sounds/3.mp3'),
        2: new Audio('/sounds/2.mp3'),
        1: new Audio('/sounds/1.mp3'),
        0: new Audio('/sounds/0.mp3'),
        start: new Audio('/sounds/start.mp3'),
        // 正解の音声
        correct: new Audio('/sounds/correct.mp3'),
        // 不正解の音声 
        incorrect: new Audio('/sounds/incorrect.mp3')
      };
    } else {
      audioRef.current = {};
    }
  };

  /** 音声を再生する関数 */
  const playSound = (key: number | 'Start' | 'correct' | 'incorrect') => {
    const soundKey = key.toString().toLowerCase();
    const audio = audioRef.current[soundKey];
    if (audio) {
      // 再生中の音声を停止
      audio.pause();
      audio.currentTime = 0;
      // 新しい再生を開始
      audio.play().catch(error => {
        // AbortErrorは無視（ユーザーがタブを切り替えた場合など）
        if (error.name !== 'AbortError') {
          console.error('音声の再生に失敗しました:', error);
        }
      });
    }
  };

  // soundEnabledが変更されたときに音声オブジェクトを初期化
  useEffect(() => {
    initializeAudio();
  }, [soundEnabled]);

  // コンポーネントのアンマウント時に音声をクリーンアップ
  useEffect(() => {
    return () => {
      Object.values(audioRef.current).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, []);

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
    let timers: number[] = [];

    if (phase === 'ready') {
      // 問題生成（初回マウント時のみ）
      if (sequence.length === 0) {
        handleGenerateSequence();
      }

      // 出題前のカウントダウン処理
      const countdownDuration = 1000; // 1秒間隔
      const initialDelay = 500; // 開始前の待機時間

      const startCountdown = () => {
        setCountdown(3);
        playSound(3);

        const timer1 = window.setTimeout(() => {
          setCountdown(2);
          playSound(2);
          
          const timer2 = window.setTimeout(() => {
            setCountdown(1);
            playSound(1);
            
            const timer3 = window.setTimeout(() => {
              setCountdown(0);
              playSound(0);
              
              const timer4 = window.setTimeout(() => {
                setCountdown('Start');
                playSound('Start');
                
                const timer5 = window.setTimeout(() => {
                  setPhase('showing');
                  setCountdown(3);
                }, countdownDuration);
                timers.push(timer5);
              }, countdownDuration);
              timers.push(timer4);
            }, countdownDuration);
            timers.push(timer3);
          }, countdownDuration);
          timers.push(timer2);
        }, countdownDuration);
        timers.push(timer1);
      };

      // 初期待機時間を設定(3秒)
      const initialTimer = window.setTimeout(startCountdown, initialDelay);
      timers.push(initialTimer);

      // クリーンアップ関数
      return () => {
        // タイマーをクリア
        timers.forEach(timer => clearTimeout(timer));
        // 音声をクリーンアップ
        Object.values(audioRef.current).forEach(audio => {
          audio.pause();
          audio.currentTime = 0;
        });
      };
    }
  }, [phase, sequence.length]);

  /** 回答を検証する関数 */
  const validateAnswer = (input: number) => {
    const currentAnswerIndex = inputHistory.length;
    const isAnswerCorrect = input === sequence[currentAnswerIndex];

    if (!isAnswerCorrect) {
      // 不正解の場合
      // 不正解の音声を再生
      playSound('incorrect');
      // 不正解の表示
      setIsCorrect(false);
      // 結果表示モーダーを表示
      setShowResult(true);
      // 結果表示モーダーを表示したら、resultフェーズに移行
      setPhase('result');
      return;
    }

    // 正解の場合、正解の音声を再生
    playSound('correct');
    
    // すべて正解した場合
    if (currentAnswerIndex === sequence.length - 1) {
      // 正解の表示
      setIsCorrect(true);
      // 結果表示モーダーを表示
      setShowResult(true);
      // 結果表示モーダーを表示したら、resultフェーズに移行
      setPhase('result');
      // スコア加算
      onScoreUpdate(score + level * 100); // レベルに応じたスコア加算
    }
  };

  /** 結果表示モーダルで「次のレベルへ」クリック処理 */
  const handleContinue = () => {
    // 結果表示モーダーを非表示
    setShowResult(false);
    // 出題準備フェーズに移行
    setPhase('preparing');
    // ボタンを消灯
    setCurrentIndex(-1);
    // 問題をリセット
    setSequence([]);
    // カウントダウンを3秒にリセット
    setCountdown(3);
    // レベルアップ
    onLevelUp();
    // 問題を生成
    handleGenerateSequence();
    // 出題準備フェーズに移行
    setPhase('ready');
  };

  /** 結果表示モーダルで「終了する」クリック処理 */
  const handleEndGame = () => {
    // 結果表示モーダーを非表示
    setShowResult(false);
    // ゲーム終了
    onGameEnd();
  };

  // 回答フェーズで、数字クリック時の処理
  const handleNumberClick = (number: number) => {
    if (phase === 'answering') {
      // 数字クリック動作関数を実行
      onNumberClick(number);
      // 回答を検証
      validateAnswer(number);
    }
  };

  return (
    <>
      {/* ゲームステータスコンポーネント */}
      <GameStatus level={level} score={score} onReset={handleReset} />

      {/* カウントダウンモーダル */}
      {phase === 'ready' && (
        <CountdownModal level={level} countdown={countdown} />
      )}

      {/* 出題フェーズの表示 */}
      {phase === 'showing' && (
        <Instruction>
          <h3>数字をよく見ていてください</h3>
        </Instruction>
      )}

      {/* 回答フェーズの表示 */}
      {phase === 'answering' && (
        <Instruction>
          <h3>このレベルの出題数は{sequence.length}個です</h3>
          <h3>光った順番に数字を押してください</h3>
        </Instruction>
      )}

      {/* 数字ボタンコンポーネント */}
      <NumberPad
        numbers={numbers}
        currentIndex={currentIndex}
        sequence={sequence}
        phase={phase}
        onNumberClick={handleNumberClick}
      />

      {/* 入力履歴コンポーネント */}
      <InputHistory
        inputHistory={inputHistory}
        showAllHistory={showAllHistory}
        onToggleHistory={onToggleHistory}
      />

      {/* 結果表示コンポーネント　showResultがtrueの場合に表示 */}
      {showResult && (
        <ResultModal
          isCorrect={isCorrect}
          level={level}
          score={score}
          onContinue={handleContinue}
          onEnd={handleEndGame}
        />
      )}
    </>
  );
};