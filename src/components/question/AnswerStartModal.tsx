import styled from 'styled-components';
import { motion } from 'framer-motion';

/** 解答モードへの移行を示すモーダルの背景スタイル */
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

/** 解答モードへの移行を示すモーダルのコンテンツスタイル */
const ModalContent = styled(motion.div)`
  background-color: #282c34;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  color: white;
  max-width: 90%;
  width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #61dafb;
  }

  h3 {
    font-size: 1.5rem;
    margin: 1rem 0;
    color: #61dafb;
  }
`;

/** 解答モードへの移行を示すモーダルのprops */
type AnswerStartModalProps = {
  level: number;
};

/** 解答モードへの移行を示すモーダル */
export const AnswerStartModal = ({ level }: AnswerStartModalProps) => {
  return (
    <ModalOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ModalContent
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <h2>Level {level}</h2>
        <h3>解答スタート</h3>
      </ModalContent>
    </ModalOverlay>
  );
}; 