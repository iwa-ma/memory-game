import styled from 'styled-components';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

/** 入力履歴のスタイル */
const HistoryContainer = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background-color: rgba(97, 218, 251, 0.1);
  border-radius: 8px;
`;

/** 入力履歴のタイトル */
const HistoryTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #61dafb;
  text-align: center;
`;

/** 入力履歴の数字 */
const InputNumber = styled.span`
  display: inline-block;
  margin: 0.25rem;
  padding: 0.25rem 0.5rem;
  background-color: #61dafb;
  color: #282c34;
  border-radius: 4px;
  font-size: 1.2em;
`;

/** すべての入力履歴 */
const AllInputs = styled.div`
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(97, 218, 251, 0.3);
`;

/** InputHistory.tsxから受け取るProps型 */
type InputHistoryProps = {
  /** 入力履歴管理配列 */
  inputHistory: number[];
  /** 入力履歴(すべて)の表示状態 */
  showAllHistory: boolean;
  /** 履歴表示クリック動作関数 */
  onToggleHistory: () => void;
};

/** 入力履歴コンポーネント */
export const InputHistory = ({
  inputHistory,
  showAllHistory,
  onToggleHistory
}: InputHistoryProps) => {
  /** 音声の種類 */
  const questionVoice = useSelector((state: RootState) => state.settings.questionVoice);

  /** 数字を表示用の文字列に変換する関数 */
  const getDisplayText = (number: number): string => {
    if (questionVoice === 'animal1') {
      switch (number) {
        case 0:
          return 'ニャー';
        case 1:
          return '甘え声';
        case 2:
          return 'ニャウ～ン';
        case 3:
          return 'ギニャー';
        default:
          return number.toString();
      }
    }
    return number.toString();
  };

  // 最新の入力履歴（最後の4つ）
  const recentInputs = inputHistory.slice(-4);
  // それ以前の入力履歴
  const olderInputs = inputHistory.slice(0, -4);

  return (
    <HistoryContainer>
      <HistoryTitle onClick={onToggleHistory} style={{ cursor: 'pointer' }}>
        入力履歴 {showAllHistory ? '▼' : '▲'}
      </HistoryTitle>
      <>
        {recentInputs.map((num, idx) => (
          <InputNumber key={idx}>{getDisplayText(num)}</InputNumber>
        ))}
        {showAllHistory && (
          <AllInputs>
            {olderInputs.map((num, idx) => (
              <InputNumber key={idx}>{getDisplayText(num)}</InputNumber>
            ))}
          </AllInputs>
        )}
      </>
    </HistoryContainer>
  );
};