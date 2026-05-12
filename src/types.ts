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

export type GameState = 'START' | 'PLAYING' | 'GAMEOVER';
