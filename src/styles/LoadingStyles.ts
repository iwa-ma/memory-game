import styled from 'styled-components';

/** ローディング画面のコンテナ */
export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #282c34;
  color: #61dafb;
`;

/** ローディング画面のテキスト */
export const LoadingText = styled.h2`
  margin: 1rem 0;
`;

/** ローディングスピナーのスタイル */
export const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid #61dafb;
  border-top: 5px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`; 