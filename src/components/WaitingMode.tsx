import { motion } from 'framer-motion';
import styled from 'styled-components';

/** index.tsxから受け取るProps型 */
type WaitingModeProps = {
  /** ゲームスタートボタンクリック動作関数 */
  onStart: () => void;
  /** レベル管理 */
  level: number;
};

const StartButton = styled(motion.button)`
  background-color: #61dafb;
  color: #282c34;
  border: none;
  padding: 15px 32px;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #4fa8c6;
  }
`;

const LevelDisplay = styled.div`
  font-size: 1.5rem;
  color: #61dafb;
  margin-bottom: 1rem;
`;

/** スタート待機モードコンポーネント */
export const WaitingMode = ({ onStart, level }: WaitingModeProps) => {
  return (
    <div>
      {/* TODO: レベル表示（変更機能実装予定）  */}
      <LevelDisplay>Level: {level}</LevelDisplay>
      <StartButton
        animate={{
          scale: [1, 1.1, 1],
          opacity: [1, 0.8, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        onClick={onStart}
      >
        ゲームスタート
      </StartButton>
    </div>
  );
};