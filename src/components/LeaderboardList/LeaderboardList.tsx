import React from 'react';
import type { LeaderboardListProps } from '../../types';

export const LeaderboardList: React.FC<LeaderboardListProps> = ({
  leaders,
  playerName,
  isLoading,
  emptyText = 'Таблица пуста. Стань первым!',
  useDotSeparator = false,
}) => {
  if (isLoading) {
    return <div style={{ textAlign: 'center', color: '#888' }}>ЗАГРУЗКА...</div>;
  }

  if (leaders.length === 0) {
    return <div style={{ textAlign: 'center', color: '#666' }}>{emptyText}</div>;
  }

  return (
    <div className="leaderboard-list">
      {leaders.map((player, i) => {
        const isMe = player.player_name === playerName;

        let rowClass = 'leaderboard-row';
        if (i === 0) {
          rowClass += ' first-place';
          if (isMe) rowClass += ' current-run';
        } else if (isMe) {
          rowClass += ' current-run';
        }

        const separator = useDotSeparator ? '.' : '';

        return (
          <div key={`${player.player_name}-${player.score}-${i}`} className={rowClass}>
            <span>
              {i + 1}
              {separator} {player.player_name} {isMe ? '(ВЫ)' : ''}
            </span>
            <span>{player.score}s</span>
          </div>
        );
      })}
    </div>
  );
};
