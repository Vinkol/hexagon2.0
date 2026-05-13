import React from 'react';
import { LeaderboardList } from '../LeaderboardList/LeaderboardList';
import type {  GameOverScreenProps } from '../../types';



export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  personalBest,
  globalLeaderboard,
  isLoading,
  playerName,
  onRetry,
}) => {
  return (
    <div className="overlay">
      <h1 style={{ color: '#ff4d4d', fontSize: '3rem', textShadow: '0 0 10px #ff4d4d' }}>
        CRASHED
      </h1>
      <p className="final-score-text">
        ВАШЕ ВРЕМЯ: <span style={{ color: '#fff', fontWeight: 'bold' }}>{score}s</span>
      </p>

      <button className="btn-start" onClick={onRetry}>
        RETRY
      </button>

      <div className="stats-container">
        <div className="personal-best-badge">
          ВАШ РЕКОРД: <span>{personalBest}s</span>
        </div>

        <div className="leaderboard-box">
          <h2>МИРОВОЙ ТОП-5 (LIVE)</h2>
          <LeaderboardList
            leaders={globalLeaderboard}
            playerName={playerName}
            isLoading={isLoading}
            useDotSeparator={true}
          />
        </div>
      </div>
    </div>
  );
};
