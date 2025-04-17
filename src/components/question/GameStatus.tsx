import styled from 'styled-components';
import { motion } from 'framer-motion';

/** ゲームステータスのスタイル */
const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
`;

const DebugButton = styled(motion.button)`
  background-color: #ff4757;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-left: 1rem;
`;

/** QuestionMode.tsxから受け取るProps型 */
type GameStatusProps = {
  /** 現在のレベル */
  level: number;
  /** スコア */
  score: number;
  /** デバッグ用：ゲームをリセットする動作関数 */
  onReset: () => void;
};

/** ゲームステータスコンポーネント */
export const GameStatus = ({ level, score, onReset }: GameStatusProps) => (
  <StatusContainer>
    <p>Level: {level}</p>
    <p>Score: {score}</p>
    <DebugButton
      className="debug-button"
      onClick={onReset}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      リセット
    </DebugButton>
  </StatusContainer>
);