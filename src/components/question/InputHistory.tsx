import styled from 'styled-components';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { motion, AnimatePresence } from 'framer-motion';

/** 入力履歴枠のスタイル */
const HistoryContainer = styled.div`
  margin-top: 20px;
  padding: 10px;
  background-color: rgba(40, 44, 52, 0.8);
  border-radius: 8px;
  
  @media (max-width: 480px) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10;
    margin: 0;
  }
`;

/** PC用の履歴パネル */
const DesktopHistoryPanel = styled.div`
  // PC用(PCでは表示)
  @media (min-width: 481px) {
    display: block;
  }
  // モバイル用(モバイルでは非表示)
  @media (max-width: 480px) {
    display: none;
  }
`;

/** モバイル用の履歴パネル */
const MobileHistoryPanel = styled(motion.div)`  
  // PC用(PCでは非表示)
  @media (min-width: 481px) {
    display: none;
  }
  // モバイル用(モバイルでは表示)
  @media (max-width: 480px) {
    max-height: 40vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    background-color: rgba(40, 44, 52, 0.95);
    padding: 10px;
  }
`;

/** 履歴表示ボタンのスタイル */
const ToggleButton = styled.button`
  width: 100%;
  padding: 10px;
  background: none;
  border: none;
  color: #61dafb;
  font-size: 1em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:focus {
    outline: none;
  }

  // モバイル用
  @media (max-width: 480px) {
    background-color: rgba(40, 44, 52, 0.95);
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 11;
    margin: 0;
    border-top: 1px solid rgba(97, 218, 251, 0.3);
  }
`;

/** 入力履歴の数字と結果のコンテナ */
const InputContainer = styled.div`
  display: inline-flex;
  align-items: center;
  margin: 0.5rem;
  padding: 0.5rem;
  border: 1px solid rgba(97, 218, 251, 0.3);
  border-radius: 4px;
  background-color: rgba(97, 218, 251, 0.05);
`;

/** 通し番号のスタイル */
const SequenceNumber = styled.span`
  margin-right: 0.5rem;
  color: #61dafb;
  font-size: 0.9em;
  min-width: 1.5em;
  text-align: right;
`;

/** 結果ラベルのスタイル */
const ResultLabel = styled.span<{ isCorrect: boolean }>`
  margin-right: 0.5rem;
  color: ${props => props.isCorrect ? '#4caf50' : '#f44336'};
  font-weight: bold;
  min-width: 1.2em;
  text-align: center;
`;

/** 入力履歴の数字 */
const InputNumber = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background-color: #61dafb;
  color: #282c34;
  border-radius: 4px;
  font-size: 1.2em;
  min-width: 2em;
  text-align: center;
`;

/** すべての入力履歴 */
const AllInputs = styled.div`
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(97, 218, 251, 0.3);
  text-align: center;
`;

/** InputHistory.tsxから受け取るProps型 */
type InputHistoryProps = {
  /** 入力履歴管理配列 */
  inputHistory: number[];
  /** 正答結果の配列 */
  answerResults: boolean[];
  /** 入力履歴(すべて)の表示状態 */
  showAllHistory: boolean;
  /** 履歴表示クリック動作関数 */
  onToggleHistory: () => void;
};

/** 入力履歴コンポーネント */
export const InputHistory = ({
  inputHistory,
  answerResults,
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

  // 最新の入力履歴（最後の4つ）を逆順で取得
  const recentInputs = inputHistory.slice(-4).reverse();
  const recentResults = answerResults.slice(-4).reverse();
  // それ以前の入力履歴も逆順で取得
  const olderInputs = inputHistory.slice(0, -4).reverse();
  const olderResults = answerResults.slice(0, -4).reverse();

  // 最新4つの開始インデックスを計算
  const startIndex = inputHistory.length;

  const historyContent = (
    <>
      {recentInputs.map((num, idx) => (
        <InputContainer key={idx}>
          <SequenceNumber>{startIndex - idx}.</SequenceNumber>
          <ResultLabel isCorrect={recentResults[idx]}>{recentResults[idx] ? '○' : '×'}</ResultLabel>
          <InputNumber>{getDisplayText(num)}</InputNumber>
        </InputContainer>
      ))}
      {showAllHistory && olderInputs.length > 0 && (
        <AllInputs>
          {olderInputs.map((num, idx) => (
            <InputContainer key={idx}>
              <SequenceNumber>{startIndex - recentInputs.length - idx}.</SequenceNumber>
              <ResultLabel isCorrect={olderResults[idx]}>{olderResults[idx] ? '○' : '×'}</ResultLabel>
              <InputNumber>{getDisplayText(num)}</InputNumber>
            </InputContainer>
          ))}
        </AllInputs>
      )}
    </>
  );

  return (
    <HistoryContainer>
      <ToggleButton onClick={onToggleHistory}>
        入力履歴 {showAllHistory ? '▼' : '▲'}
      </ToggleButton>
      
      {/* PC用の表示 */}
      <DesktopHistoryPanel>
        {historyContent}
      </DesktopHistoryPanel>

      {/* モバイル用の表示（アニメーション付き） */}
      <AnimatePresence>
        {showAllHistory && (
          <MobileHistoryPanel
            // 初期状態
            initial={{ height: 0, opacity: 0 }}
            // 表示状態
            animate={{ height: 'auto', opacity: 1 }}
            // 非表示状態
            exit={{ height: 0, opacity: 0 }}
            // アニメーション設定
            transition={{ 
              duration: 0.3,
              ease: "easeInOut"
            }}
          >
            {historyContent}
          </MobileHistoryPanel>
        )}
      </AnimatePresence>
    </HistoryContainer>
  );
};