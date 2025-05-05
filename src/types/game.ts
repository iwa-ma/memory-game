
/** ゲームフェーズの型 */
export type GamePhase = 'ready' | 'preparing' | 'showing' | 'answering' | 'result';

/** ゲームの状態 */
export interface GameState {
  phase: GamePhase;
  sequence: number[];
  currentIndex: number;
} 