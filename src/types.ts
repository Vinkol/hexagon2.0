export interface Leader {
  player_name: string;
  score: string;
}

export interface DatabaseLeaderboardRow {
  player_name: string;
  score: number;
}

export interface Wall {
  dist: number;
  angle: number;
  width: number;
}

export interface ColorScheme {
  bg: string;
  wall: string;
  center: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export interface MainMenuProps {
  playerName: string;
  personalBest: string;
  globalLeaderboard: Leader[];
  isLoading: boolean;
  onSaveName: (name: string) => void;
  onStartGame: () => void;
}

export interface GameOverScreenProps {
  score: string;
  personalBest: string;
  globalLeaderboard: Leader[];
  isLoading: boolean;
  playerName: string;
  onRetry: () => void;
}

export interface LeaderboardListProps {
  leaders: Leader[];
  playerName: string;
  isLoading: boolean;
  emptyText?: string;
  useDotSeparator?: boolean;
}

export type GameState = 'START' | 'PLAYING' | 'GAMEOVER';
