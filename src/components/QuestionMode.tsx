import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { GameStatus } from '@/components/question/GameStatus';
import { CountdownModal } from '@/components/question/CountdownModal';
import { NumberPad } from '@/components/question/NumberPad';
import { InputHistory } from '@/components/question/InputHistory';
import { ResultModal } from '@/components/question/ResultModal';
import { generateSequence } from '@/utils/gameUtils';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useSoundLoader } from '@/hooks/useSoundLoader';

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
  onGameEnd
}: QuestionModeProps) => {
  /** 音声の種類 */
  const questionVoice = useSelector((state: RootState) => state.settings.questionVoice);
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
  /** 音声ファイルの読み込み状態(このコンポーネント内で管理) */
  const [isSoundLoaded, setIsSoundLoaded] = useState(false);

  /** 音声ローダー(実際の読み込み状態を表す) */
  const { playSound, isLoading } = useSoundLoader();

  // 音声ファイルの読み込み状態を監視
  useEffect(() => {
    if (!isLoading) {
      setIsSoundLoaded(true);
    }
  }, [isLoading]);

  // 初回マウント時の問題生成
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

  /** 解答を検証する関数 */
  const validateAnswer = (input: number) => {
    const currentAnswerIndex = inputHistory.length;
    const isAnswerCorrect = input === sequence[currentAnswerIndex];

    // 押したボタンの音声を再生
    if (questionVoice === 'animal1') {
      switch (input) {
        case 0:
          playSound('cat1');
          break;
        case 1:
          playSound('cat2');
          break;
        case 2:
          playSound('cat3');
          break;
        case 3:
          playSound('cat4');
          break;
      }
    } else {
      playSound(`num${input}`);
    }

    if (!isAnswerCorrect) {
      // 不正解の場合
      playSound('incorrect');
      setIsCorrect(false);
      setShowResult(true);
      setPhase('result');
      return;
    }

    // 正解の場合
    playSound('correct');
    
    // すべて正解した場合
    if (currentAnswerIndex === sequence.length - 1) {
      setIsCorrect(true);
      setShowResult(true);
      setPhase('result');
      onScoreUpdate(score + level * 100);
    }
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

        try {
          for (let i = 0; i < sequence.length; i++) {
            // ボタンを光らせる動作はmotion.buttonのanimateプロパティで行う、
            // setCurrentIndexで指定した添え字の数字が対象。
            setCurrentIndex(i);  // ボタンを光らせる(NumberPad.tsxで該当Indexのボタン色変更)
            
            // animal1の場合で、iが2の時(音声が長い：ニャウ～ン)は表示時間を長くする
            const extraShowDuration = (questionVoice === 'animal1' && i === 2) ? 5000 : 0;
            
            // 音声を再生
            if (questionVoice === 'animal1') {
              switch (sequence[i]) {
                case 0:
                  playSound('cat1');
                  break;
                case 1:
                  playSound('cat2');
                  break;
                case 2:
                  playSound('cat3');
                  break;
                case 3:
                  playSound('cat4');
                  break;
              }
            } else {
              playSound(`num${sequence[i]}`);
            }
            
            // 表示時間を待機
            await new Promise(resolve => setTimeout(resolve, showDuration + extraShowDuration));
            
            // ボタンを消灯
            setCurrentIndex(-1);
            
            // 次の数字まで待機（最後の数字の場合は待機しない）
            if (i < sequence.length - 1) {
              await new Promise(resolve => setTimeout(resolve, intervalDuration));
            }
          }
        } catch (error) {
          console.error('シーケンス表示中にエラーが発生しました:', error);
        } finally {
          // エラーが発生しても次のフェーズに進む
          setPhase('answering');
        }
      };
      showSequence();
    }
  }, [phase, sequence]);

  // 初回マウントとリセット時のカウントダウン処理を統一
  useEffect(() => {
    let timers: number[] = [];

    // 音声ファイルの読み込みが完了した場合に実行
    if (phase === 'ready' && isSoundLoaded) {
      // 問題生成（初回マウント時のみ）
      if (sequence.length === 0) {
        handleGenerateSequence();
      }

      // 出題前のカウントダウン処理
      const countdownDuration = 1000; // 1秒間隔
      const initialDelay = 500; // 開始前の待機時間

      const startCountdown = async () => {
        try {
          setCountdown(3);
          await playSound('3');
          // 再生完了後、Promiseを使って、1秒待機
          await new Promise(resolve => setTimeout(resolve, countdownDuration));

          setCountdown(2);
          await playSound('2');
          await new Promise(resolve => setTimeout(resolve, countdownDuration));

          setCountdown(1);
          await playSound('1');
          await new Promise(resolve => setTimeout(resolve, countdownDuration));

          setCountdown(0);
          await playSound('0');
          await new Promise(resolve => setTimeout(resolve, countdownDuration));

          setCountdown('Start');
          await playSound('start');
          await new Promise(resolve => setTimeout(resolve, countdownDuration));

          setPhase('showing');
          setCountdown(3);
        } catch (error) {
          console.error('カウントダウン中にエラーが発生しました:', error);
          // エラーが発生しても次のフェーズに進む
          setPhase('showing');
        }
      };

      // 初期待機時間を設定(3秒)
      const initialTimer = window.setTimeout(startCountdown, initialDelay);
      timers.push(initialTimer);

      // クリーンアップ関数
      return () => {
        // タイマーをクリア
        timers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [phase, sequence.length, isSoundLoaded]);

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

  // 解答フェーズで、数字クリック時の処理
  const handleNumberClick = (number: number) => {
    if (phase === 'answering') {
      // 数字クリック動作関数を実行
      onNumberClick(number);
      // 解答を検証
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

      {/* 解答フェーズの表示 */}
      {phase === 'answering' && (
        <Instruction>
          <h3>このレベルの出題数は{sequence.length}個です</h3>
          <h3>{questionVoice === 'animal1' ? '光った順番に鳴き声を押してください' : '光った順番に数字を押してください'}</h3>
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