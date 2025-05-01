import styled from 'styled-components';
import { motion } from 'framer-motion';
import { convertSoundType, convertDifficulty } from '@/utils/settingsConverter';

/** モーダルオーバーレイスタイル */
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

/** モーダルコンテンツスタイル */
const ModalContent = styled.div`
  background: #282c34;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  border: 2px solid #61dafb;
  box-shadow: 0 0 20px rgba(97, 218, 251, 0.3);
  min-width: 300px;

  /* スマートフォン向けのスタイル */
  @media (max-width: 768px) {
    margin: 0 1rem;
    max-width: calc(100% - 2rem);
    width: 100%;
    min-width: auto;  /* スマホでは最小幅の制限を解除 */
    box-sizing: border-box;
  }
`;

/** タイトルスタイル */
const Title = styled.h2`
  color: #61dafb;
  margin: 0 0 1rem 0;
  font-size: 2rem;
`;

/** メッセージスタイル */
const Message = styled.p`
  color: white;
  margin: 1rem 0;
  font-size: 1.2rem;
`;

/** 設定値コンテナスタイル */
const SettingsContainer = styled.div`
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(97, 218, 251, 0.1);
  border-radius: 8px;
`;

/** 設定値スタイル */
const SettingItem = styled.p`
  color: white;
  margin: 0.5rem 0;
  font-size: 1rem;
`;

/** ボタンコンテナスタイル */
const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
`;

/** ボタンスタイル */
const Button = styled(motion.button)`
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: bold;
  background-color: #ff4757;
  color: white;
  transition: all 0.3s ease;
`;

/** QuestionMode.tsxから受け取るpropsの型 */
type LastResultModalProps = {
  /** 最終到達レベル */
  finalLevel: number;
  /** 音声種類 */
  soundType: string;
  /** 音声オンオフ */
  isSoundEnabled: boolean;
  /** 開始レベル */
  startLevel: number;
  /** 難易度 */
  difficulty: string;
  /** 最終スコア */
  finalScore: number;
  /** スタート画面に戻る動作関数 */
  onReturnToStart: () => void;
  /** ゲームオーバーかどうか */
  isGameOver: boolean;
};

/** ゲーム終了モーダル　*/
export const LastResultModal = ({
  finalLevel,
  soundType,
  isSoundEnabled,
  startLevel,
  difficulty,
  finalScore,
  onReturnToStart,
  isGameOver
}: LastResultModalProps) => {
  return (
    <ModalOverlay>
      <ModalContent>
        <Title>{isGameOver ? 'ゲームオーバー' : 'レベルクリア！'}</Title>
        <Message>
          {isGameOver 
            ? 'ライフが0になりました。また遊んでね。'
            : 'レベル10クリアおめでとうございます！'}
        </Message>
        <Message>最終到達レベル: {finalLevel}</Message>
        <Message>最終スコア: {finalScore}</Message>
        
        <SettingsContainer>
          <SettingItem>音声種類: {convertSoundType(soundType)}</SettingItem>
          <SettingItem>音声: {isSoundEnabled ? 'オン' : 'オフ'}</SettingItem>
          <SettingItem>開始レベル: {startLevel}</SettingItem>
          <SettingItem>難易度: {convertDifficulty(difficulty)}</SettingItem>
        </SettingsContainer>

        <ButtonContainer>
          <Button
            onClick={onReturnToStart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            スタート画面に戻る
          </Button>
        </ButtonContainer>
      </ModalContent>
    </ModalOverlay>
  );
}; 