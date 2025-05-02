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
  /** phaseを親に渡すコールバック */
  onPhaseChange?: (phase: string) => void;
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
  finalLevel,
  onPhaseChange
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
  /** レベル内でのミスを管理する状態変数を追加 */
  const [hasMistakeInLevel, setHasMistakeInLevel] = useState(false);
  /** 現在の問題のスコアを管理する状態変数を追加 */
  const [currentQuestionScore, setCurrentQuestionScore] = useState(0);
  /** コンボ数を管理する状態変数を追加 */
  const [comboCount, setComboCount] = useState(0);
  /** 解答開始時間を管理する状態変数を追加 */
  const [answerStartTime, setAnswerStartTime] = useState<number>(0);

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

    // 解答時間を計算（ミリ秒を秒に変換）
    const answerTime = (Date.now() - answerStartTime) / 1000;

    // タイムボーナスの計算
    let timeBonus = 0;
    if (isCurrentInputCorrect) {
      if (answerTime <= 2) {
        timeBonus = 30;  // 2秒以内: +30点
      } else if (answerTime <= 3) {
        timeBonus = 15;  // 3秒以内: +15点
      }
    }

    // コンボボーナスの計算
    let comboBonus = 0;
    if (isCurrentInputCorrect) {
      // 正解の場合、コンボ数を増やす
      const newComboCount = comboCount + 1;
      setComboCount(newComboCount);
      // コンボ数に応じてボーナスを計算（2コンボ以上でボーナス発生）
      if (newComboCount >= 2) {
        comboBonus = newComboCount * 10; // コンボ数 × 10点のボーナス
      }
    } else {
      // 不正解の場合、コンボをリセット
      setComboCount(0);
    }

    // 問題のスコアを設定（正解:50点、不正解:-20点）とボーナスを加算
    const questionScore = (isCurrentInputCorrect ? 50 : -20) + comboBonus + timeBonus;
    setCurrentQuestionScore(questionScore);

    // スコアを即座に更新
    onScoreUpdate(score + questionScore);

    if (!isCurrentInputCorrect) {
        // 不正解の処理
        setIsCorrect(false);
        setShowResult(true);
        // レベル内でミスがあったことを記録
        setHasMistakeInLevel(true);

        if (isSoundEnabled) {
          // 音声の長さを取得
          const soundDuration = getSoundDuration('incorrect');
          // 音声の長さが異常な値の場合はデフォルト値を使用
          const validDuration = soundDuration > 0.1 ? soundDuration : 1.0;
          // 音声再生と同時に待機を開始
          await Promise.all([
            playSound('incorrect'),
            new Promise(resolve => setTimeout(resolve, (validDuration * 1000)))
          ]);
        } else {
          // 音声が無効な場合は固定の待機時間(1秒)
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // ライフを1減らす処理
        setRemainingLives(prev => {
          const newLives = Math.max(0, prev - 1);
          if (newLives === 0) {
            setPhase('result');
            setIsCorrect(false);  // ゲームオーバー時は不正解として扱う
          } else {
            // モーダルを非表示
            setShowResult(false);
            // 次の問題の解答開始時間を設定
            setAnswerStartTime(Date.now());
          }
          return newLives;
        });
        return;
    }

    // 正解の場合
    setIsCorrect(true);
    setShowResult(true);

    if (isSoundEnabled) {
      // 音声の長さを取得
      const soundDuration = getSoundDuration('correct');
      // 音声の長さが異常な値の場合はデフォルト値を使用
      const validDuration = soundDuration > 0.1 ? soundDuration : 1.0;
      // 音声再生と同時に待機を開始
      await Promise.all([
        playSound('correct'),
        new Promise(resolve => setTimeout(resolve, (validDuration * 1000)))
      ]);
    } else {
      // 音声が無効な場合は固定の待機時間(1.0秒)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 正解数をインクリメントして新しい正解数を設定
    const newCorrectCount = correctCount + 1;
    setCorrectCount(newCorrectCount);
    
    // 正解数が目標の長さに達したかチェック
    if (newCorrectCount === sequence.length) {
        // レベルクリア
        // resultフェーズに移行
        setPhase('result');
        // スコアを更新（ノーミスクリアボーナスを含む）
        const noMistakeBonus = !hasMistakeInLevel ? level * 500 : 0;
        onScoreUpdate(score + level * 100 + noMistakeBonus);
    } else {
        // 途中の正解の場合
        setShowResult(false);
        // 次の問題の解答開始時間を設定
        setAnswerStartTime(Date.now());
    }
  };

  /** 数字を順番に光らせる処理 */
  useEffect(() => {
    // showingフェーズで、出題数字が存在する場合に実行
    if (phase === 'showing' && sequence.length > 0) {
      const showSequence = async () => {
        try {
          for (let i = 0; i < sequence.length; i++) {
            setCurrentIndex(i);
            
            // 音声が有効な場合、音声を再生
            if (isSoundEnabled) {
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

                // 音声の待機時間を計算
                const displayDuration = (getSoundDuration(soundName) * 1000) + (isMobileDevice() ? 500 : 300);

                // 音声の再生と表示時間の待機を同時に開始
                await Promise.all([
                  playSound(soundName),
                  new Promise(resolve => setTimeout(resolve, displayDuration))
                ]);
              } catch (error) {
                console.warn('音声の再生に失敗しました:', error);
              }
            } else {
              // 音声無効時は表示時間のみ待機（1.3秒）
              await new Promise(resolve => setTimeout(resolve, 1300));
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

  /** カウントダウン処理 */
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
          if (isSoundEnabled) {
            // 音声の再生と同時に待機を開始
            await Promise.all([
              playSound('3'),
              new Promise(resolve => setTimeout(resolve, duration3 * 1000 + (isMobileDevice() ? 300 : 0)))
            ]);
          } else {
            // 音声が無効な場合は音声の長さと同じ時間待機
            await new Promise(resolve => setTimeout(resolve, duration3 * 1000));
          }

          setCountdown(2);
          const duration2 = getSoundDuration('2');
          if (isSoundEnabled) {
            await Promise.all([
              playSound('2'),
              new Promise(resolve => setTimeout(resolve, duration2 * 1000 + (isMobileDevice() ? 300 : 0)))
            ]);
          } else {
            await new Promise(resolve => setTimeout(resolve, duration2 * 1000));
          }

          setCountdown(1);
          const duration1 = getSoundDuration('1');
          if (isSoundEnabled) {
            await Promise.all([
              playSound('1'),
              new Promise(resolve => setTimeout(resolve, duration1 * 1000 + (isMobileDevice() ? 300 : 0)))
            ]);
          } else {
            await new Promise(resolve => setTimeout(resolve, duration1 * 1000));
          }

          setCountdown(0);
          const duration0 = getSoundDuration('0');
          if (isSoundEnabled) {
            await Promise.all([
              playSound('0'),
              new Promise(resolve => setTimeout(resolve, duration0 * 1000 + (isMobileDevice() ? 300 : 0)))
            ]);
          } else {
            await new Promise(resolve => setTimeout(resolve, duration0 * 1000));
          }

          setCountdown('Start');
          const durationStart = getSoundDuration('start');
          if (isSoundEnabled) {
            await Promise.all([
              playSound('start'),
              new Promise(resolve => setTimeout(resolve, durationStart * 1000 + (isMobileDevice() ? 300 : 0)))
            ]);
          } else {
            await new Promise(resolve => setTimeout(resolve, durationStart * 1000));
          }

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
    // レベル内のミス状態をリセット
    setHasMistakeInLevel(false);
    // 問題のスコアをリセット
    setCurrentQuestionScore(0);
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

  // 解答フェーズに移行したときに最初の問題の解答開始時間を設定
  useEffect(() => {
    if (phase === 'answering') {
      setAnswerStartTime(Date.now());
    }
  }, [phase]);

  // レベルが変更されたときやゲームがリセットされたときに正解数をリセット
  useEffect(() => {
    setCorrectCount(0);
    setAnswerResults([]);
    setHasMistakeInLevel(false);
    setCurrentQuestionScore(0);
    setComboCount(0);
    setAnswerStartTime(0);
  }, [level]);

  /** phaseが変わるたびに親に通知 */
  useEffect(() => {
    if (onPhaseChange) {
      onPhaseChange(phase);
    }
  }, [phase, onPhaseChange]);

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
          {comboCount >= 2 && (
            <h3 style={{ color: '#4CAF50' }}>コンボ: {comboCount}（+{comboCount * 10}点）</h3>
          )}
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
              isIntermediate={correctCount < sequence.length}
              noMistakeBonus={!hasMistakeInLevel && correctCount === sequence.length ? level * 500 : 0}
              questionScore={currentQuestionScore}
              comboCount={comboCount}
              answerTime={(Date.now() - answerStartTime) / 1000}
            />
          )}
        </>
      )}
    </>
  );
};