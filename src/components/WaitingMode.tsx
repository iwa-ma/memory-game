import { motion } from 'framer-motion';

/** index.tsxから受け取るProps型 */
type WaitingModeProps = {
  /** ゲームスタートボタンクリック動作関数 */
  onStart: () => void;
  /** レベル管理 */
  level: number;
};

/** スタート待機モードコンポーネント */
export const WaitingMode = ({ onStart, level }: WaitingModeProps) => {
  return (
    <div>
       {/* TODO: レベル表示（変更機能実装予定）  */}
      <div>level: {level}</div>
      <motion.button
        className="start-button"
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
      </motion.button>
    </div>
  );
};