import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { GameStatus } from '@/components/question/GameStatus';
import { CountdownModal } from '@/components/question/CountdownModal';
import { AnswerStartModal } from '@/components/question/AnswerStartModal';
import { NumberPad } from '@/components/question/NumberPad';
import { InputHistory } from '@/components/question/InputHistory';
import { ResultModal } from '@/components/question/ResultModal';
import { LastResultModal } from '@/components/question/LastResultModal';
import { generateSequence } from '@/utils/gameUtils';
import { isMobileDevice } from '@/utils/deviceUtils';
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
  /** ライフ */
  lives: number;
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
  /** 最終レベル */
  finalLevel: number;
};

/** 出題モードコンポーネント */
export const QuestionMode = ({
  lives,
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
  finalLevel
}: QuestionModeProps) => {
  /** 音声の種類 */
  const questionVoice = useSelector((state: RootState) => state.settings.questionVoice);
  /** 音声オンオフ */
  const isSoundEnabled = useSelector((state: RootState) => state.settings.soundEnabled);
  /** 開始レベル */
  const startLevel = useSelector((state: RootState) => state.settings.startLevel);
  /** 難易度 */
  const difficulty = useSelector((state: RootState) => state.settings.difficultyLevel);
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
  /** 解答モードへの移行を示すモーダルの表示状態 */
  const [showAnswerMode, setShowAnswerMode] = useState(false);
  /** 音声ファイルの読み込み状態(このコンポーネント内で管理) */
  const [isSoundLoaded, setIsSoundLoaded] = useState(false);
  /** 音声再生の準備状態 */
  const [isAudioReady, setIsAudioReady] = useState(false);
  /** 残りライフ */
  const [remainingLives, setRemainingLives] = useState(lives);
  /** 正解した数字の数を管理する状態変数を追加 */
  const [correctCount, setCorrectCount] = useState(0);
  /** 各入力の正誤を管理する状態変数を追加 */
  const [answerResults, setAnswerResults] = useState<boolean[]>([]);

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
      prepareAudio();
    }
  }, []);

  // levelが変更されたときに問題を生成
  useEffect(() => {
    if (phase === 'preparing') {
      handleGenerateSequence();
    }
  }, [level]);

  /** 問題生成処理 */
  const handleGenerateSequence = () => {
    // 現在のレベルを使用して問題を生成
    const newSequence = generateSequence(level, numbers.length);
    setSequence(newSequence);
    return newSequence;
  };

  /** 音声再生の準備を行う関数 */
  const prepareAudio = async () => {
    // モバイル端末の場合のみ音声の準備を行う
    if (isMobileDevice()) {
      try {
        // 音声ファイルの準備
        const sounds = {
          // 共通の音声
          common: ['correct', 'incorrect'],
          // カウントダウンと開始音声
          countdown: ['3', '2', '1', '0', 'start'],
          // 音声タイプ別の音声
          animal1: ['cat1', 'cat2', 'cat3', 'cat4'],
          human1: Array.from({ length: 9 }, (_, i) => `num${i}`),
          human2: Array.from({ length: 9 }, (_, i) => `num${i}`)
        };

        // 必要な音声ファイルを準備
        const requiredSounds = [
          ...sounds.common,
          ...sounds.countdown,
          ...(questionVoice === 'animal1' ? sounds.animal1 : sounds[questionVoice])
        ];

        console.log('音声ファイルの準備を開始:', JSON.stringify({
          // 準備情報
          preparation: {
            voiceType: questionVoice,
            totalSounds: requiredSounds.length,
            sounds: requiredSounds
          }
        }, null, 2));
        
        // 各音声ファイルに対してplay()とpause()を実行
        await Promise.all(requiredSounds.map(async (soundName) => {
          const audio = new Audio();
          audio.src = `/sounds/${questionVoice === 'animal1' ? 'animal1' : questionVoice}/${soundName}.mp3`;
          audio.play();
          audio.pause();
        }));

        setIsAudioReady(true);
      } catch (error) {
        console.warn('音声の準備に失敗しました:', error);
        // エラーが発生しても準備完了として扱う
        setIsAudioReady(true);
      }
    } else {
      // モバイル端末以外の場合は準備完了として扱う
      setIsAudioReady(true);
    }
  };

  /** 解答を検証する関数 */
  const validateAnswer = async (input: number) => {    
    // 現在の正解数に基づいて期待される数字を取得
    const expectedNumber = sequence[correctCount];
    
    // 入力値が期待される数字と一致するか
    const isCurrentInputCorrect = input === expectedNumber;

    // 入力の正誤結果を、管理配列に追加(現在の配列をコピーして新しい配列を作成)
    setAnswerResults(prev => [...prev, isCurrentInputCorrect]);

    if (!isCurrentInputCorrect) {
        // 不正解の処理
        setIsCorrect(false);
        setShowResult(true);
        // 音声の長さを取得
        const soundDuration = getSoundDuration('incorrect');
        // 音声の長さが異常な値の場合はデフォルト値を使用
        const validDuration = soundDuration > 0.1 ? soundDuration : 1.0;
        // 音声再生と同時に待機を開始
        await Promise.all([
          playSound('incorrect'),
          new Promise(resolve => setTimeout(resolve, (validDuration * 1000)))
        ]);
        // ライフを1減らす処理...
        setRemainingLives(prev => {
          const newLives = Math.max(0, prev - 1);
          if (newLives === 0) {
            setPhase('result');
            setIsCorrect(false);  // ゲームオーバー時は不正解として扱う
          } else {
            setShowResult(false);
          }
          return newLives;
        });
        return;
    }

    // 正解の場合
    setIsCorrect(true);
    setShowResult(true);
    // 音声の長さを取得
    const soundDuration = getSoundDuration('correct');
    // 音声の長さが異常な値の場合はデフォルト値を使用
    const validDuration = soundDuration > 0.1 ? soundDuration : 1.0;
    // 音声再生と同時に待機を開始
    await Promise.all([
      playSound('correct'),
      new Promise(resolve => setTimeout(resolve, (validDuration * 1000)))
    ]);
    // 正解数をインクリメントして新しい正解数を設定
    const newCorrectCount = correctCount + 1;
    setCorrectCount(newCorrectCount);
    
    // 正解数が目標の長さに達したかチェック
    if (newCorrectCount === sequence.length) {
        // レベルクリア
        // resultフェーズに移行
        setPhase('result');
        // スコアを更新
        onScoreUpdate(score + level * 100);
    } else {
        // 途中の正解の場合
        setShowResult(false);
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

              // 音声の待機時間を計算(音声の長さを1000倍してミリ秒に変換 + バッファ値:モバイル端末の場合は500ms,PCの場合は300ms)
              const displayDuration = (getSoundDuration(soundName) * 1000) + (isMobileDevice() ? 500 : 300);

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
          // 解答モードへの移行を示すモーダルを表示
          setShowAnswerMode(true);
          // 1.5秒後に解答モードに移行
          setTimeout(() => {
            // 解答モードへの移行を示すモーダルを非表示
            setShowAnswerMode(false);
            // 解答モードに移行
            setPhase('answering');
          }, 1500);
        }
      };
      showSequence();
    }
  }, [phase, sequence]);

  // 初回マウントとリセット時のカウントダウン処理を統一
  useEffect(() => {
    // 音声ファイルの読み込みが完了し、かつ音声再生の準備ができている場合に実行
    if (phase === 'ready' && isSoundLoaded && isAudioReady) {
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
            new Promise(resolve => setTimeout(resolve, duration3 * 1000 + (isMobileDevice() ? 300 : 0)))
          ]);

          setCountdown(2);
          const duration2 = getSoundDuration('2');
          await Promise.all([
            playSound('2'),
            new Promise(resolve => setTimeout(resolve, duration2 * 1000 + (isMobileDevice() ? 300 : 0)))
          ]);

          setCountdown(1);
          const duration1 = getSoundDuration('1');
          await Promise.all([
            playSound('1'),
            new Promise(resolve => setTimeout(resolve, duration1 * 1000 + (isMobileDevice() ? 300 : 0)))
          ]);

          setCountdown(0);
          const duration0 = getSoundDuration('0');
          await Promise.all([
            playSound('0'),
            new Promise(resolve => setTimeout(resolve, duration0 * 1000 + (isMobileDevice() ? 300 : 0)))
          ]);

          setCountdown('Start');
          const durationStart = getSoundDuration('start');
          await Promise.all([
            playSound('start'),
            new Promise(resolve => setTimeout(resolve, durationStart * 1000 + (isMobileDevice() ? 300 : 0)))
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
  }, [phase, isSoundLoaded, isAudioReady]);

  /** 結果表示モーダルで「次のレベルへ」クリック処理 */
  const handleContinue = () => {
    console.log('handleContinue');
    // 結果表示モーダルを非表示
    setShowResult(false);
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
    setCorrectCount(0);
    setAnswerResults([]);
    setShowResult(false);
    onGameEnd();
  };

  // 解答フェーズで、数字クリック時の処理
  const handleNumberClick = async (number: number) => {
    if (phase === 'answering') {
      // 数字クリック動作関数を実行
      onNumberClick(number);
      // 解答を検証
      await validateAnswer(number);
    }
  };

  // レベルが変更されたときやゲームがリセットされたときに正解数をリセット
  useEffect(() => {
    setCorrectCount(0);
    setAnswerResults([]);
  }, [level]);

  return (
    <>
      {/* ゲームステータスコンポーネント */}
      <GameStatus level={level} score={score} lives={remainingLives} />

      {/* カウントダウンモーダル */}
      {phase === 'ready' && (
        <CountdownModal level={level} countdown={countdown} />
      )}

      {/* 解答モードへの移行を示すモーダル */}
      {showAnswerMode && (
        <AnswerStartModal level={level} />
      )}

      {/* 解答フェーズの表示 */}
      {phase === 'answering' && (
        <Instruction>
          <h3>{questionVoice === 'animal1' ? '光った順番に鳴き声を押してください' : '光った順番に数字を押してください'}</h3>
          <h3>正解数: {correctCount} / 残り: {sequence.length - correctCount}</h3>
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
        answerResults={answerResults}
        showAllHistory={showAllHistory}
        onToggleHistory={onToggleHistory}
      />

      {/* 結果表示コンポーネント　showResultがtrueの場合に表示 */}
      {showResult && (
        <>
          {/* 最終レベルクリア時またはゲームオーバー時はLastResultModalを表示 */}
          {(level === finalLevel && isCorrect && correctCount === sequence.length) || 
           (remainingLives === 0 && !isCorrect) ? (
            <LastResultModal
              finalLevel={level}
              soundType={questionVoice}
              isSoundEnabled={isSoundEnabled}
              startLevel={startLevel}
              difficulty={difficulty}
              finalScore={score}
              onReturnToStart={handleEndGame}
              isGameOver={remainingLives === 0}
            />
          ) : (
            <ResultModal
              isCorrect={isCorrect}
              level={level}
              score={score}
              onContinue={handleContinue}
              onEnd={handleEndGame}
              isIntermediate={isCorrect && correctCount < sequence.length}
            />
          )}
        </>
      )}
    </>
  );
};