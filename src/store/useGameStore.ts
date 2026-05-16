import { create } from 'zustand';

export type GameState = 'START' | 'PLAYING' | 'GAME_OVER';

export interface PlayerData {
  id: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  score: number;
  gameState: GameState;
  color: string;
}

interface GameStore {
  gameState: GameState;
  score: number;
  highScore: number;
  lastScore: number;
  isSpeedingUp: boolean;
  otherPlayers: Record<string, PlayerData>;
  setGameState: (state: GameState) => void;
  incrementScore: () => void;
  resetGame: () => void;
  setIsSpeedingUp: (isSpeeding: boolean) => void;
  updateOtherPlayer: (id: string, data: Partial<PlayerData>) => void;
  removeOtherPlayer: (id: string) => void;
  initOtherPlayers: (players: PlayerData[]) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: 'START',
  score: 0,
  highScore: parseInt(localStorage.getItem('flappy-3d-highscore') || '0'),
  lastScore: 0,
  isSpeedingUp: false,
  otherPlayers: {},
  setGameState: (state) => set((prev) => {
    if (state === 'GAME_OVER') {
      const newHighScore = Math.max(prev.highScore, prev.score);
      localStorage.setItem('flappy-3d-highscore', newHighScore.toString());
      return { gameState: state, highScore: newHighScore, lastScore: prev.score, isSpeedingUp: false };
    }
    if (state === 'PLAYING') {
      return { gameState: state, score: 0, isSpeedingUp: false };
    }
    return { gameState: state };
  }),
  incrementScore: () => set((state) => ({ score: state.score + 1 })),
  resetGame: () => set({ gameState: 'PLAYING', score: 0, isSpeedingUp: false }),
  setIsSpeedingUp: (isSpeeding) => set({ isSpeedingUp: isSpeeding }),
  updateOtherPlayer: (id, data) => set((state) => ({
    otherPlayers: {
      ...state.otherPlayers,
      [id]: { ...state.otherPlayers[id], ...data } as PlayerData
    }
  })),
  removeOtherPlayer: (id) => set((state) => {
    const { [id]: _, ...remaining } = state.otherPlayers;
    return { otherPlayers: remaining };
  }),
  initOtherPlayers: (players) => set({
    otherPlayers: players.reduce((acc, p) => ({ ...acc, [p.id]: p }), {})
  }),
}));
