import styled from 'styled-components';
import { motion } from 'framer-motion';

/** モーダルの背景オーバーレイ */
const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

/** モーダル本体 */
const Modal = styled(motion.div)`
  background-color: #282c34;
  padding: 1rem 3.5rem 1rem 1rem;
  border-radius: 8px;
  max-width: 600px;
  width: 95%;
  max-height: 95vh;
  overflow-y: auto;
  position: relative;

  @media (min-width: 768px) {
    padding: 2rem 3.5rem 2rem 2rem;
    width: 90%;
  }
`;

/** 閉じるボタン */
const CloseButton = styled(motion.button)`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #61dafb;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;

  &:hover {
    background-color: rgba(97, 218, 251, 0.1);
  }
`;

/** モーダルの内容 */
const ModalContent = styled.div`
  padding: 2.5rem 10px 10px 10px;
  max-height: 80vh;
  overflow-y: auto;
  text-align: left;
  line-height: 1.6;

  @media (min-width: 768px) {
    padding: 2.5rem 20px 20px 20px;
  }

  h2 {
    color: #61dafb;
    margin-bottom: 0.8rem;
    font-size: 1.3rem;

    @media (min-width: 768px) {
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }
  }

  p {
    margin-bottom: 0.8rem;
    color: #fff;

    @media (min-width: 768px) {
      margin-bottom: 1rem;
    }
  }

  ol {
    padding-left: 1.2rem;
    margin: 0;
  }

  li {
    margin-bottom: 1rem;
    color: #fff;

    @media (min-width: 768px) {
      margin-bottom: 1.5rem;
    }
  }

  .image-placeholder {
    width: 100%;
    margin: 0.8rem 0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    @media (min-width: 768px) {
      margin: 1rem 0;
    }

    img {
      width: 100%;
      height: auto;
      max-height: 300px;
      object-fit: contain;
      display: block;
    }
  }
`;

const Credit = styled.div`
  border-top: 1px solid #444;
  margin-top: 1.5rem;
  padding-top: 1rem;
  text-align: center;
  color: #aaa;
  font-size: 0.85rem;

  a {
    color: #61dafb;
    text-decoration: underline;
    &:hover {
      color: #fff;
    }
  }
`;

type HowToModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const HowToModal = ({ isOpen, onClose }: HowToModalProps) => {
  if (!isOpen) return null;

  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <Modal
        onClick={e => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <CloseButton
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ×
        </CloseButton>
        <ModalContent>
          <h2>遊び方</h2>
          <ol>
            <li>
              「ゲームスタート」を押して、カウントダウン後に光るボタンの順番を覚えてください。
              <div className="image-placeholder"><img src="/images/howto/step1-1.png" alt="遊び方1" /></div>
              <div className="image-placeholder"><img src="/images/howto/step1-2.png" alt="遊び方1" /></div>
            </li>
            <li>
              早く答えるとタイムボーナス、連続で正解するとコンボボーナス、ミスせずに全問正解するとノーミスボーナスがもらえます。
              <div className="image-placeholder"><img src="/images/howto/step2.png" alt="遊び方2" /></div>
            </li>
            <li>
            「設定」から音声の種類、難易度、開始レベルを変更できます。難易度で「練習」を選ぶと、ライフが999になり何度でも挑戦できます
              <div className="image-placeholder"><img src="/images/howto/step3.png" alt="遊び方3" /></div>
            </li>
          </ol>
          <Credit>
            開発者: iwakura<br />
            音声素材提供: <a href="https://soundeffect-lab.info/" target="_blank" rel="noopener noreferrer">効果音ラボ</a>
          </Credit>
        </ModalContent>
      </Modal>
    </Overlay>
  );
}; 