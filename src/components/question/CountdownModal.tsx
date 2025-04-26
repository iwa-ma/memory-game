import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

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
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  border: 2px solid #61dafb;
  box-shadow: 0 0 20px rgba(97, 218, 251, 0.3);
  min-width: 300px;
  max-width: 90%;

  h2 {
    color: #61dafb;
    margin: 0 0 0.5rem 0;
    font-size: 1.8rem;
    text-align: center;
  }

  h4 {
    color: white;
    margin: 0.3rem 0;
    font-size: 1.1rem;
    line-height: 1.4;
    text-align: left;
    padding: 0 0.5rem;
  }

  p {
    color: #888;
    margin: 0.5rem 0 0 0;
  }
`;

const CountdownDisplay = styled(motion.div)`
  font-size: 3.5rem;
  color: #61dafb;
  margin: 0.8rem 0;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(97, 218, 251, 0.5);

  &.start {
    color: #4CAF50;
    font-size: 3rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
`;

/** QuestionMode.tsxから受け取るProps型 */
type CountdownModalProps = {
  /** 現在のレベル */
  level: number;
  /** カウントダウン用の状態 */
  countdown: number | string;
};

/** カウントダウンモーダルコンポーネント */
export const CountdownModal = ({ level, countdown }: CountdownModalProps) => {
  /** 音声の種類 */
  const questionVoice = useSelector((state: RootState) => state.settings.questionVoice);

  return (
    <ModalOverlay>
      <ModalContent>
        <h2>Level {level}</h2>
        <h4>カウントダウンが終わったら問題の表示を開始します。</h4>
        {/* 音声の種類で表示内容を変える */}
        <h4>{questionVoice === 'animal1' ? '光る鳴き声をよく見ていてください。' : '光る数字をよく見ていてください。'}</h4>
        <CountdownDisplay
          key={countdown}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={countdown === 'Start' ? 'start' : ''}
        >
          {countdown}
        </CountdownDisplay>
      </ModalContent>
    </ModalOverlay>
  );
};