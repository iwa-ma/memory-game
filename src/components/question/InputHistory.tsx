import styled from 'styled-components';

/** QuestionMode.tsxから受け取るProps型 */
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
  const recentInputs = inputHistory.slice(0, 5);
  const olderInputs = inputHistory.slice(5);

  return (
    <HistoryContainer>
      <h3>入力履歴</h3>
      <RecentInputs>
        {recentInputs.map((num, idx) => (
          <InputNumber key={idx}>{num}</InputNumber>
        ))}
      </RecentInputs>
      
      {inputHistory.length > 5 && (
        <>
          <ShowMoreButton onClick={onToggleHistory}>
            {showAllHistory ? '履歴を隠す' : 'すべての履歴を表示'}
          </ShowMoreButton>
          {showAllHistory && (
            <AllInputs>
              {olderInputs.map((num, idx) => (
                <InputNumber key={idx}>{num}</InputNumber>
              ))}
            </AllInputs>
          )}
        </>
      )}
    </HistoryContainer>
  );
};

const HistoryContainer = styled.div`
  margin: 20px auto;
  padding: 15px;
  background-color: rgba(97, 218, 251, 0.1);
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  text-align: center;
`;

const RecentInputs = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
`;

const InputNumber = styled.span`
  background-color: #61dafb;
  color: #282c34;
  padding: 8px 12px;
  border-radius: 4px;
  font-weight: bold;
  min-width: 40px;
`;

const ShowMoreButton = styled.button`
  background: none;
  border: none;
  color: #61dafb;
  cursor: pointer;
  text-decoration: underline;
  padding: 5px;
`;

const AllInputs = styled.div`
  margin-top: 10px;
  padding: 10px;
  background-color: rgba(97, 218, 251, 0.05);
  border-radius: 4px;
`;