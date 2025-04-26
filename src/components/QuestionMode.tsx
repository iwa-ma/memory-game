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
  const { playSound, getSoundDuration, isLoading } = useSoundLoader();

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

  // levelが変更されたときに問題を生成
  useEffect(() => {
    if (phase === 'preparing') {
      handleGenerateSequence();
    }
  }, [level]);

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
    // 現在のレベルを使用して問題を生成
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
        try {
          for (let i = 0; i < sequence.length; i++) {
            // ボタンを光らせる動作はmotion.buttonのanimateプロパティで行う、
            // setCurrentIndexで指定した添え字の数字が対象。
            setCurrentIndex(i);  // ボタンを光らせる(NumberPad.tsxで該当Indexのボタン色変更)
            
            // 音声を再生
            try {
              let soundName = '';
              
              if (questionVoice === 'animal1') {
                switch (sequence[i]) {
                  case 0:
                    soundName = 'cat1';
                    break;
                  case 1:
                    soundName = 'cat2';
                    break;
                  case 2:
                    soundName = 'cat3';
                    break;
                  case 3:
                    soundName = 'cat4';
                    break;
                }
              } else {
                soundName = `num${sequence[i]}`;
              }

              // 音声の待機時間を計算(音声の長さを1000倍してミリ秒に変換 + バッファで0.3秒)
              const displayDuration = (getSoundDuration(soundName) * 1000) + 300;

              // 音声の再生と表示時間の待機を同時に開始
              await Promise.all([
                playSound(soundName),
                new Promise(resolve => setTimeout(resolve, displayDuration))
              ]);
            } catch (error) {
              console.warn('音声の再生に失敗しました:', error);
            }
            
            // ボタンを消灯
            setCurrentIndex(-1);
            
            // 次の数字まで待機（最後の数字の場合は待機しない）
            if (i < sequence.length - 1) {
              // 次の音声の準備時間（0.3秒）
              await new Promise(resolve => setTimeout(resolve, 300));
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
    // 音声ファイルの読み込みが完了した場合に実行
    if (phase === 'ready' && isSoundLoaded) {
      // 問題生成（初回マウント時のみ）
      if (sequence.length === 0) {
        handleGenerateSequence();
      }

      // 出題前のカウントダウン処理
      const startCountdown = async () => {
        try {
          setCountdown(3);
          const duration3 = getSoundDuration('3');
          // 音声の再生と同時に待機を開始
          await Promise.all([
            playSound('3'),
            new Promise(resolve => setTimeout(resolve, duration3 * 1000))
          ]);

          setCountdown(2);
          const duration2 = getSoundDuration('2');
          await Promise.all([
            playSound('2'),
            new Promise(resolve => setTimeout(resolve, duration2 * 1000))
          ]);

          setCountdown(1);
          const duration1 = getSoundDuration('1');
          await Promise.all([
            playSound('1'),
            new Promise(resolve => setTimeout(resolve, duration1 * 1000))
          ]);

          setCountdown(0);
          const duration0 = getSoundDuration('0');
          await Promise.all([
            playSound('0'),
            new Promise(resolve => setTimeout(resolve, duration0 * 1000))
          ]);

          setCountdown('Start');
          const durationStart = getSoundDuration('start');
          await Promise.all([
            playSound('start'),
            new Promise(resolve => setTimeout(resolve, durationStart * 1000))
          ]);

          setPhase('showing');
          setCountdown(3);
        } catch (error) {
          console.error('カウントダウン中にエラーが発生しました:', error);
          // エラーが発生しても次のフェーズに進む
          setPhase('showing');
        }
      };

      // 音声ファイルの読み込みが完了したらすぐにカウントダウンを開始
      startCountdown();
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

      {/* 出題フェーズの表示（音声の種類で表示内容を変える） */}
      {phase === 'showing' && (
        <Instruction>
          <h3>{questionVoice === 'animal1' ? '光る鳴き声をよく見ていてください' : '光る数字をよく見ていてください'}</h3>
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