import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import type { RootState } from '@/store/store';
import {
  setQuestionVoice,
  setSoundEnabled,
  setStartLevel,
  setDifficultyLevel,
} from '@/store/settingsSlice';
import { useSoundLoader } from '@/hooks/useSoundLoader';
import { convertSoundType, convertDifficulty } from '@/utils/settingsConverter';

/** モーダルオーバーレイのスタイル */
const ModalOverlay = styled.div`
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

/** モーダルコンテンツのスタイル */
const ModalContent = styled.div`
  background-color: #1a1a1a;
  color: #ffffff;
  padding: 1.5rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  border: 1px solid #333;

  @media (max-height: 667px) {  /* iPhoneSE等の小さい画面用 */
    max-height: 80vh;
    padding: 1rem;
  }
`;

/** 設定セクションのスタイル */
const SettingsSection = styled.div`
  margin-bottom: 1.2rem;

  h2 {
    color: #61dafb;
    margin-bottom: 1rem;
  }

  h3 {
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
    color: #61dafb;
  }

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-height: 667px) {
    margin-bottom: 1rem;
  }
`;

/** トグルグループのスタイル */
const ToggleGroup = styled.div`
  display: flex;
  gap: 1rem;

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #ffffff;
  }
`;

/** セレクトリストのスタイル */
const StyledSelect = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #444;
  border-radius: 4px;
  font-size: 1rem;
  background-color: #2a2a2a;
  color: #ffffff;

  &:focus {
    outline: none;
    border-color: #61dafb;
  }
`;

/** モーダルアクションのスタイル */
const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;

  button {
    padding: 0.5rem 1rem;
    background-color: #61dafb;
    color: #1a1a1a;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;

    &:hover {
      background-color: #4fa8c6;
    }
  }
`;

/** 設定変更モーダルコンポーネントのProps型 */
interface SettingsModalProps {
  /** モーダルの表示状態 */
  isOpen: boolean;
  /** モーダルを閉じる関数 */
  onClose: () => void;
}

/** 設定変更モーダルコンポーネント */
export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);
  const { isLoading: isSoundLoading } = useSoundLoader();

  // モーダルが開いているときにEscapeキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSoundLoading) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => {
        window.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, isSoundLoading, onClose]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (!isSoundLoading) {
      onClose();
    }
  };

  /** 音声の種類を変更する関数 */
  const handleVoiceChange = (value: 'human1' | 'human2' | 'animal1') => {
    if (!isSoundLoading) {
      dispatch(setQuestionVoice(value));
    }
  };

  /** 音声の有効状態を変更する関数 */
  const handleSoundEnabledChange = (enabled: boolean) => {
    if (!isSoundLoading) {
      dispatch(setSoundEnabled(enabled));
    }
  };

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <h2>設定変更</h2>
        <SettingsSection>
          <h3>音声の種類</h3>
          <StyledSelect
            value={settings.questionVoice}
            onChange={(e) => handleVoiceChange(e.target.value as 'human1' | 'human2' | 'animal1')}
            disabled={isSoundLoading}
          >
            <option value="human1">{convertSoundType('human1')}</option>
            <option value="human2">{convertSoundType('human2')}</option>
            <option value="animal1">{convertSoundType('animal1')}</option>
          </StyledSelect>
          {isSoundLoading && (
            <div style={{ color: '#61dafb', marginTop: '0.5rem' }}>
              音声を読み込み中...しばらくお待ちください
            </div>
          )}
        </SettingsSection>

        <SettingsSection>
          <h3>音声</h3>
          <ToggleGroup>
            <label>
              <input
                type="radio"
                name="soundEnabled"
                value="on"
                checked={settings.soundEnabled}
                onChange={() => handleSoundEnabledChange(true)}
                disabled={isSoundLoading}
              />
              オン
            </label>
            <label>
              <input
                type="radio"
                name="soundEnabled"
                value="off"
                checked={!settings.soundEnabled}
                onChange={() => handleSoundEnabledChange(false)}
                disabled={isSoundLoading}
              />
              オフ
            </label>
          </ToggleGroup>
        </SettingsSection>

        <SettingsSection>
          <h3>開始レベル(1~10)</h3>
          <StyledSelect
            value={settings.startLevel}
            onChange={(e) => dispatch(setStartLevel(Number(e.target.value)))}
            disabled={isSoundLoading}
          >
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </StyledSelect>
        </SettingsSection>

        <SettingsSection>
          <h3>難易度</h3>
          <StyledSelect
            value={settings.difficultyLevel}
            onChange={(e) => dispatch(setDifficultyLevel(e.target.value as 'easy' | 'normal' | 'hard'))}
            disabled={isSoundLoading}
          >
            <option value="practice">{convertDifficulty('practice')}</option>
            <option value="easy">{convertDifficulty('easy')}</option>
            <option value="normal">{convertDifficulty('normal')}</option>
            <option value="hard">{convertDifficulty('hard')}</option>
          </StyledSelect>
        </SettingsSection>

        <ModalActions>
          <button onClick={handleClose} disabled={isSoundLoading}>
            {isSoundLoading ? '読み込み中...' : '閉じる'}
          </button>
        </ModalActions>
      </ModalContent>
    </ModalOverlay>
  );
}; 