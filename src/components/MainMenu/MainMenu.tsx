import React, { useState, type SyntheticEvent } from 'react';
import { LeaderboardList } from '../LeaderboardList/LeaderboardList';
import type { MainMenuProps } from '../../types';



export const MainMenu: React.FC<MainMenuProps> = ({
  playerName,
  personalBest,
  globalLeaderboard,
  isLoading,
  onSaveName,
  onStartGame,
}) => {
  const [nameInput, setNameInput] = useState('');

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onSaveName(nameInput.trim());
    }
  };

  if (!playerName) {
    return (
      <div className="overlay">
        <h1 className="title-neon">HEXAGON 2.0</h1>
        <form onSubmit={handleSubmit} className="name-form">
          <input
            type="text"
            placeholder="ВВЕДИТЕ ВАШ НИКНЕЙМ"
            maxLength={15}
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="name-input"
          />
          <button type="submit" className="btn-start">
            СОХРАНИТЬ
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="overlay">
      <h1 className="title-neon">HEXAGON 2.0</h1>
      <div className="welcome-text">
        ПРИВЕТ, <span className="user-highlight">{playerName}</span>!
      </div>
      <button className="btn-start" onClick={onStartGame}>
        START
      </button>

      <div className="stats-container">
        <div className="personal-best-badge">
          ВАШ РЕКОРД: <span>{personalBest}s</span>
        </div>

        <div className="leaderboard-box">
          <h2>МИРОВОЙ ТОП-5</h2>
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
