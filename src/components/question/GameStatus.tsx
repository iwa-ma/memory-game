import styled from 'styled-components';
import { FaHeart } from "react-icons/fa";


/** ゲームステータスのスタイル */
const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
`;

/** ライフ表示のスタイル */
const LivesContainer = styled.p`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  line-height: 1;
`;

/** ハートアイコンのスタイル（LevelとScoreと同じ高さに表示） */
const HeartIcon = styled(FaHeart)`
  color: #ff4757;
  font-size: 1.2em;
  margin-top: 0.1em;
`;

/** QuestionMode.tsxから受け取るProps型 */
type GameStatusProps = {
  /** 現在のレベル */
  level: number;
  /** スコア */
  score: number;
  /** 残りライフ */
  lives: number;
};

/** ゲームステータスコンポーネント */
export const GameStatus = ({ level, score, lives, }: GameStatusProps) => (
  <StatusContainer>
    <p>Level: {level}</p>
    <p>Score: {score}</p>
    <LivesContainer>
      <HeartIcon />
      <span>×</span>
      <span>{lives}</span>
    </LivesContainer>
  </StatusContainer>
);