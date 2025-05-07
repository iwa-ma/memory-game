import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { GameStatus } from '@/components/question/GameStatus';
import { CountdownModal } from '@/components/question/CountdownModal';
import { AnswerStartModal } from '@/components/question/AnswerStartModal';
import { NumberPad } from '@/components/question/NumberPad';
import { InputHistory } from '@/components/question/InputHistory';
import { ResultModal } from '@/components/question/ResultModal';
import { LastResultModal } from '@/components/question/LastResultModal';
import { isMobileDevice } from '@/utils/deviceUtils';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useSoundLoader } from '@/hooks/useSoundLoader';
import { useGameState } from '@/hooks/useGameState';
import { useGameResult } from '@/hooks/useGameResult';
import { useGameProgress } from '@/hooks/useGameProgress';
import { useGameScore } from '@/hooks/useGameScore';
import { useScoreCalculation } from '@/hooks/useScoreCalculation';
import { useGameCountdown } from '@/hooks/useGameCountdown';

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

  // useGameStateフックを使用
  const {
    /** ゲームの状態 */
    state: gameState,
    /** フェーズを更新する関数 */
    setPhase,
    /** 現在のインデックスを更新する関数 */
    setCurrentIndex,
    /** シーケンスを生成する関数 */
    handleGenerateSequence
  } = useGameState({
    numbers,
    level
  });

  // useGameResultフックを使用
  const {
    resultDisplay,
    updateResultDisplay,
    resetResultDisplay
  } = useGameResult();

  // useGameProgressフックを使用
  const {
    correctCount,
    answerResults,
    hasMistakeInLevel,
    incrementCorrectCount,
    addAnswerResult,
    setMistake,
    resetProgress
  } = useGameProgress({
    initialLives: lives
  });

  // useGameScoreフックを使用
  const {
    currentQuestionScore,
    comboCount,
    answerStartTime,
    setQuestionScore,
    updateCombo,
    setStartTime,
    resetScore
  } = useGameScore();

  // useScoreCalculationフックを使用
  const {
    calculateQuestionScore,
    calculateLevelClearScore
  } = useScoreCalculation();

  /** 音声ファイルの読み込み状態(このコンポーネント内で管理) */
  const [isSoundLoaded, setIsSoundLoaded] = useState(false);
  /** 音声再生の準備状態 */
  const [isAudioReady, setIsAudioReady] = useState(false);
  /** 残りライフ */
  const [remainingLives, setRemainingLives] = useState(lives);

  /** 音声ローダー(実際の読み込み状態を表す) */
  const { playSound, getSoundDuration, isLoading } = useSoundLoader();

  // useGameCountdownフックを使用
  const {
    countdown,
    resetCountdown
  } = useGameCountdown(
    isSoundEnabled,
    isSoundLoaded,
    isAudioReady,
    () => setPhase('showing'),
    gameState.phase
  );


  // 音声ファイルの読み込み状態を監視
  useEffect(() => {
    if (!isLoading) {
      setIsSoundLoaded(true);
    }
  }, [isLoading]);

  // 初回マウント時の問題生成
  useEffect(() => {
    if (gameState.phase === 'ready' && gameState.sequence.length === 0) {
      handleGenerateSequence();
      prepareAudio();
    }
  }, []);

  // levelが変更されたときに問題を生成
  useEffect(() => {
    if (gameState.phase === 'preparing') {
      handleGenerateSequence();
    }
  }, [level]);

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
          human1: Array.from({ length: numbers.length }, (_, i) => `num${i}`),
          human2: Array.from({ length: numbers.length }, (_, i) => `num${i}`)
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
    const expectedNumber = gameState.sequence[correctCount];
    
    // 入力値が期待される数字と一致するか
    const isCurrentInputCorrect = input === expectedNumber;

    // 入力の正誤結果を追加
    addAnswerResult(isCurrentInputCorrect);

    // 解答時間を計算（ミリ秒を秒に変換）
    const answerTime = (Date.now() - answerStartTime) / 1000;

    // コンボボーナスの計算
    if (isCurrentInputCorrect) {
      // 正解の場合、コンボ数を増やす
      updateCombo(true);
    } else {
      // 不正解の場合、コンボをリセット
      updateCombo(false);
    }

    // 問題のスコアを計算
    const questionScore = calculateQuestionScore(
      isCurrentInputCorrect,
      answerTime,
      comboCount
    );
    setQuestionScore(questionScore);

    // スコアを即座に更新
    onScoreUpdate(score + questionScore);

    if (!isCurrentInputCorrect) {
      // 不正解の処理
      updateResultDisplay({
        isCorrect: false,
        showResult: true
      });
      // レベル内でミスがあったことを記録
      setMistake(true);

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
          updateResultDisplay({
            isCorrect: false,
            showResult: true
          });
        } else {
          // モーダルを非表示
          resetResultDisplay();
          // 次の問題の解答開始時間を設定
          setStartTime(Date.now());
        }
        return newLives;
      });
      return;
    }

    // 正解の場合
    updateResultDisplay({
      isCorrect: true,
      showResult: true
    });

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

    // 正解数をインクリメント
    incrementCorrectCount();
    
    // 正解数が目標の長さに達したかチェック
    if (correctCount + 1 === gameState.sequence.length) {
      // レベルクリア
      // resultフェーズに移行
      setPhase('result');
      // スコアを更新（ノーミスクリアボーナスを含む）
      const levelClearScore = calculateLevelClearScore({
        level,
        hasMistakeInLevel
      });
      onScoreUpdate(score + levelClearScore);
    } else {
      // 途中の正解の場合
      resetResultDisplay();
      // 次の問題の解答開始時間を設定
      setStartTime(Date.now());
    }
  };

  /** 数字を順番に光らせる処理 */
  useEffect(() => {
    // showingフェーズで、出題数字が存在する場合に実行
    if (gameState.phase === 'showing' && gameState.sequence.length > 0) {
      const showSequence = async () => {
        try {
          for (let i = 0; i < gameState.sequence.length; i++) {
            setCurrentIndex(i);
            
            // 音声が有効な場合、音声を再生
            if (isSoundEnabled) {
              try {
                let soundName = '';
                
                if (questionVoice === 'animal1') {
                  switch (gameState.sequence[i]) {
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
                  soundName = `num${gameState.sequence[i]}`;
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
            if (i < gameState.sequence.length - 1) {
              // 次の音声の準備時間（0.3秒）
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          }
        } catch (error) {
          console.error('シーケンス表示中にエラーが発生しました:', error);
        } finally {
          // 解答モードへの移行を示すモーダルを表示
          updateResultDisplay({ showAnswerMode: true });
          // 1.5秒後に解答モードに移行
          setTimeout(() => {
            resetResultDisplay();
            setPhase('answering');
          }, 1500);
        }
      };
      showSequence();
    }
  }, [gameState.phase, gameState.sequence]);

  /** 結果表示モーダルで「次のレベルへ」クリック処理 */
  const handleContinue = () => {
    console.log('handleContinue');
    // 結果表示モーダルを非表示
    resetResultDisplay();
    // ボタンを消灯
    setCurrentIndex(-1);
    // 問題をリセット
    resetCountdown();
    // レベル内のミス状態をリセット
    setMistake(false);
    // 問題のスコアをリセット
    resetScore();
    // レベルアップ
    onLevelUp();
    // 出題準備フェーズに移行
    setPhase('ready');
  };

  /** 結果表示モーダルで「終了する」クリック処理 */
  const handleEndGame = () => {
    resetProgress();
    resetScore();
    resetResultDisplay();
    onGameEnd();
  };

  // 解答フェーズで、数字クリック時の処理
  const handleNumberClick = async (number: number) => {
    if (gameState.phase === 'answering') {
      // 数字クリック動作関数を実行
      onNumberClick(number);
      // 解答を検証
      await validateAnswer(number);
    }
  };

  // 解答フェーズがansweringに変わったときに解答開始時間を設定
  useEffect(() => {
    if (gameState.phase === 'answering') {
      setStartTime(Date.now());
    }
  }, [gameState.phase]);

  // レベルが変更されたときやゲームがリセットされたときに正解数をリセット
  useEffect(() => {
    resetProgress();
    resetScore();
  }, [level]);

  return (
    <>
      {/* ゲームステータスコンポーネント */}
      <GameStatus level={level} score={score} lives={remainingLives} />

      {/* カウントダウンモーダル */}
      {gameState.phase === 'ready' && (
        <CountdownModal level={level} countdown={countdown} />
      )}

      {/* 解答モードへの移行を示すモーダル */}
      {resultDisplay.showAnswerMode && (
        <AnswerStartModal level={level} />
      )}

      {/* 解答フェーズの表示 */}
      {gameState.phase === 'answering' && (
        <Instruction>
          <h3>{questionVoice === 'animal1' ? '光った順番に鳴き声を押してください' : '光った順番に数字を押してください'}</h3>
          <h3>正解数: {correctCount} / 残り: {gameState.sequence.length - correctCount}</h3>
          {comboCount >= 2 && (
            <h3 style={{ color: '#4CAF50' }}>コンボ: {comboCount}（+{comboCount * 10}点）</h3>
          )}
        </Instruction>
      )}

      {/* 数字ボタンコンポーネント */}
      <NumberPad
        numbers={numbers}
        currentIndex={gameState.currentIndex}
        sequence={gameState.sequence}
        phase={gameState.phase}
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
      {resultDisplay.showResult && (
        <>
          {/* 最終レベルクリア時またはゲームオーバー時はLastResultModalを表示 */}
          {(level === finalLevel && resultDisplay.isCorrect && correctCount === gameState.sequence.length) || 
           (remainingLives === 0 && !resultDisplay.isCorrect) ? (
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
              isCorrect={resultDisplay.isCorrect}
              level={level}
              score={score}
              onContinue={handleContinue}
              onEnd={handleEndGame}
              isIntermediate={correctCount < gameState.sequence.length}
              noMistakeBonus={!hasMistakeInLevel && correctCount === gameState.sequence.length ? level * 500 : 0}
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