import { motion } from 'framer-motion';

/** index.tsxから受け取るProps型 */
type WaitingModeProps = {
  /** ゲームスタートボタンクリック動作関数 */
  onStart: () => void; 
};

/** スタート待機モードコンポーネント */
export const WaitingMode = ({ onStart }: WaitingModeProps) => {
  return (
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
  );
};