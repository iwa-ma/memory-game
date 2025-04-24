import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { SettingsModal } from './SettingsModal';
import { useSoundLoader } from '@/hooks/useSoundLoader';

/** index.tsxから受け取るProps型 */
type WaitingModeProps = {
  /** ゲームスタートボタンクリック動作関数 */
  onStart: () => void;
  /** レベル管理 */
  level: number;
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
`;

/** 設定変更ボタンのスタイル */
const SettingsButton = styled(motion.button)`
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
`;

/** レベル表示のスタイル */
const LevelDisplay = styled.div`
  font-size: 1.5rem;
  color: #61dafb;
  margin-bottom: 1rem;
`;

/** ボタンコンテナのスタイル */
const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;

  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
    padding: 0 20px;
    
    ${StartButton}, ${SettingsButton} {
      width: 100%;
      margin: 5px 0;
    }
  }
`;

/** スタート待機モードコンポーネント */
export const WaitingMode = ({ 
  onStart, 
  level, 
  isSettingsOpen, 
  onSettingsOpen, 
  onSettingsClose 
}: WaitingModeProps) => {
  /** 音声の読み込み状態 */
  const { isLoading: isSoundLoading } = useSoundLoader();

  return (
    <div>
      <LevelDisplay>Level: {level}</LevelDisplay>
      {!isSoundLoading && (
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
          >
            ゲームスタート
          </StartButton>
          <SettingsButton
            onClick={onSettingsOpen}
          >
            設定変更
          </SettingsButton>
        </ButtonContainer>
      )}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={onSettingsClose}
      />
    </div>
  );
};