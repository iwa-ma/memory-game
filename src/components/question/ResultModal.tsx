import styled from 'styled-components';
import { motion } from 'framer-motion';

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
`;

const Title = styled.h2`
  color: #61dafb;
  margin: 0 0 1rem 0;
  font-size: 2rem;
`;

const Message = styled.p`
  color: white;
  margin: 1rem 0;
  font-size: 1.2rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
`;

const Button = styled(motion.button)`
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;

  &.continue {
    background-color: #4CAF50;
    color: white;
  }

  &.end {
    background-color: #ff4757;
    color: white;
  }
`;

/** ResultModalのProps型 */
type ResultModalProps = {
  /** 正解かどうかの状態 */ 
  isCorrect: boolean;
  /** 現在のレベル */
  level: number;
  /** スコア */
  score: number;
  /** 次のレベルへの動作関数 */
  onContinue: () => void;
  /** 終了する動作関数 */
  onEnd: () => void;
  /** 途中の正解かどうか */
  isIntermediate?: boolean;
  /** ノーミスクリアボーナス */
  noMistakeBonus?: number;
  /** 問題のスコア */
  questionScore?: number;
  /** コンボ数 */
  comboCount?: number;
  /** 解答時間（秒） */
  answerTime?: number;
};

/** 結果表示コンポーネント */
export const ResultModal = ({
  isCorrect,
  level,
  onContinue,
  onEnd,
  isIntermediate = false,
  noMistakeBonus = 0,
  questionScore = 0,
  comboCount = 0,
  answerTime = 0,
}: ResultModalProps) => {
  // レベルクリアスコアを計算
  const levelClearScore = level * 100;
  // コンボボーナスを計算
  const comboBonus = comboCount >= 2 ? comboCount * 10 : 0;
  // タイムボーナスを計算
  const timeBonus = isCorrect ? (answerTime <= 2 ? 30 : answerTime <= 3 ? 15 : 0) : 0;

  // スコア計算のログ出力
  console.log('ResultModal score calculation:', {
    isIntermediate,
    isCorrect,
    level,
    scores: {
      questionScore,
      levelClearScore,
      noMistakeBonus,
      comboBonus,
      timeBonus
    },
    breakdown: {
      baseScore: questionScore - comboBonus - timeBonus,
      comboBonus,
      timeBonus
    }
  });

  return (
    <ModalOverlay>
      <ModalContent>
        <Title>{isCorrect ? (isIntermediate ? '正解！' : 'レベルクリア！') : '不正解'}</Title>
        {!isIntermediate && (
          <Message>
            {isCorrect
              ? `レベル${level}をクリアしました！`
              : '残念！間違えました。'}
          </Message>
        )}
        {!isIntermediate && isCorrect && (
          <>
            <Message style={{ color: '#61dafb' }}>
              レベルクリアスコア: +{levelClearScore}
            </Message>
            {noMistakeBonus > 0 && (
              <Message style={{ color: '#4CAF50' }}>
                ノーミスクリアボーナス: +{noMistakeBonus}
              </Message>
            )}
          </>
        )}
        {isIntermediate && (
          <>
            <Message style={{ color: questionScore > 0 ? '#4CAF50' : '#ff4757' }}>
              {questionScore > 0 ? `+${questionScore}点` : `${questionScore}点`}
              <span style={{ fontSize: '0.9em', marginLeft: '0.5rem' }}>
                （基本スコア: {questionScore - comboBonus - timeBonus}点
                {comboBonus > 0 && ` + コンボボーナス: +${comboBonus}点`}
                {timeBonus > 0 && ` + タイムボーナス: +${timeBonus}点`}）
              </span>
            </Message>
            <Message style={{ fontSize: '0.9em', color: '#61dafb' }}>
              解答時間: {answerTime.toFixed(1)}秒
            </Message>
          </>
        )}
        {!isIntermediate && (
          isCorrect ? (
            <ButtonContainer>
              <Button
                className="continue"
                onClick={onContinue}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                次のレベルへ
              </Button>
              <Button
                className="end"
                onClick={onEnd}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                スタート画面に戻る
              </Button>
            </ButtonContainer>
          ) : null
        )}
      </ModalContent>
    </ModalOverlay>
  );
}; 