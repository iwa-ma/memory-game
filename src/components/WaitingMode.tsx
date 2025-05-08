import { motion } from 'framer-motion';
import styled from 'styled-components';
import { SettingsModal } from './SettingsModal';
import { useSoundLoader } from '@/hooks/useSoundLoader';
import { HowToModal } from './HowToModal';
import { useState } from 'react';

/** index.tsxから受け取るProps型 */
type WaitingModeProps = {
  /** ゲームスタートボタンクリック動作関数 */
  onStart: () => void;
  /** 設定モーダルの表示状態 */
  isSettingsOpen: boolean;
  /** 設定モーダルを開く関数 */
  onSettingsOpen: () => void;
  /** 設定モーダルを閉じる関数 */
  onSettingsClose: () => void;
};

/** スタートボタンのスタイル */
const StartButton = styled(motion.button)`
  background-color: #4CAF50;
  color: white;
  border: none;
  margin-right: 1rem;
  padding: 15px 32px;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 200px;

  &:hover {
    background-color: #45a049;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

/** 設定変更ボタンと遊び方ボタンのスタイル */
const SecondaryButton = styled(motion.button)`
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 15px 32px;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 200px;

  &:hover {
    background-color: #1976D2;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

/** ボタンコンテナのスタイル */
const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;

  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
    padding: 0 20px;
    
    ${StartButton}, ${SecondaryButton} {
      width: 100%;
      margin: 5px 0;
    }
  }
`;

/** スタート待機モードコンポーネント */
export const WaitingMode = ({ 
  onStart, 
  isSettingsOpen, 
  onSettingsOpen, 
  onSettingsClose
}: WaitingModeProps) => {
  const { isLoading } = useSoundLoader();
  /** HowToモーダルの表示状態 */
  const [isHowToOpen, setIsHowToOpen] = useState(false);

  // 設定変更時のみローディング状態を表示
  const showLoading = isLoading && isSettingsOpen;

  return (
    <div>
      <ButtonContainer>
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
          disabled={showLoading}
        >
          {showLoading ? '読み込み中...' : 'ゲームスタート'}
        </StartButton>
        <SecondaryButton
          onClick={onSettingsOpen}
          disabled={showLoading}
        >
          {showLoading ? '読み込み中...' : '設定変更'}
        </SecondaryButton>
        <SecondaryButton
          onClick={() => setIsHowToOpen(true)}
          disabled={showLoading}
        >
          遊び方
        </SecondaryButton>
      </ButtonContainer>
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={onSettingsClose}
      />
      <HowToModal
        isOpen={isHowToOpen}
        onClose={() => setIsHowToOpen(false)}
      />
    </div>
  );
};