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
};

/** 結果表示コンポーネント */
export const ResultModal = ({
  isCorrect,
  level,
  score,
  onContinue,
  onEnd
}: ResultModalProps) => {
  return (
    <ModalOverlay>
      <ModalContent>
        <Title>{isCorrect ? '正解！' : 'ゲームオーバー'}</Title>
        <Message>
          {isCorrect
            ? `レベル${level}をクリアしました！`
            : '残念！間違えました。'}
        </Message>
        <Message>スコア: {score}</Message>
        {isCorrect ? (
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
              終了する
            </Button>
          </ButtonContainer>
        ) : (
          <ButtonContainer>
            <Button
              className="end"
              onClick={onEnd}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              終了する
            </Button>
          </ButtonContainer>
        )}
      </ModalContent>
    </ModalOverlay>
  );
}; 