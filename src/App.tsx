import { useState, useEffect, useCallback } from 'react';
import HexagonCanvas from './components/HexagonCanvas/HexagonCanvas';
import { MainMenu } from './components/MainMenu/MainMenu';
import { GameOverScreen } from './components/GameOverScreen/GameOverScreen';
import { leaderboardService } from './services/leaderboardService';
import type { GameState, Leader } from './types';
import './index.css';

function App() {
  const [status, setStatus] = useState<GameState>('START');
  const [score, setScore] = useState('0.00');
  const [isLoading, setIsLoading] = useState(true);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<Leader[]>([]);

  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem('hexagon_user_name') || '';
  });

  const [personalBest, setPersonalBest] = useState<string>(() => {
    return localStorage.getItem('hexagon_personal_best') || '0.00';
  });

  const fetchScores = useCallback(async () => {
    try {
      const topFive = await leaderboardService.getTopFive();
      setGlobalLeaderboard(topFive);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // ИСПРАВЛЕНИЕ: Изолированный эффект первоначального маунта с защитой от race conditions
  useEffect(() => {
    let isMounted = true;

    const initLoad = async () => {
      try {
        const topFive = await leaderboardService.getTopFive();
        if (isMounted) {
          setGlobalLeaderboard(topFive);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initLoad();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveName = (name: string) => {
    localStorage.setItem('hexagon_user_name', name);
    setPlayerName(name);
  };

  const handleGameOver = useCallback(async (finalScore: string) => {
    setScore(finalScore);
    setStatus('GAMEOVER');

    const finalScoreNum = parseFloat(finalScore);
    const currentBestNum = parseFloat(personalBest);
    const isNewRecord = finalScoreNum > currentBestNum;
    
    if (isNewRecord) {
      localStorage.setItem('hexagon_personal_best', finalScore);
      setPersonalBest(finalScore);
    }

    try {
      if (isNewRecord || currentBestNum === 0) {
        setIsLoading(true);
        await leaderboardService.upsertScore(playerName, finalScoreNum);
      }
      await fetchScores();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [playerName, personalBest, fetchScores]);

  const handleUpdateScore = useCallback((newScore: string) => {
    setScore(newScore);
  }, []);

  const startGame = useCallback(() => {
    if (status !== 'PLAYING' && playerName) {
      setStatus('PLAYING');
    }
  }, [status, playerName]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.code === 'Enter') && playerName) {
        e.preventDefault();
        startGame();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [startGame, playerName]);

  return (
    <div className="game-wrapper">
      {status !== 'START' && <div className="score-ui">TIME: {score}</div>}

      {status === 'START' && (
        <MainMenu
          playerName={playerName}
          personalBest={personalBest}
          globalLeaderboard={globalLeaderboard}
          isLoading={isLoading}
          onSaveName={handleSaveName}
          onStartGame={startGame}
        />
      )}

      {status === 'PLAYING' && (
        <HexagonCanvas onGameOver={handleGameOver} updateScore={handleUpdateScore} />
      )}

      {status === 'GAMEOVER' && (
        <GameOverScreen
          score={score}
          personalBest={personalBest}
          globalLeaderboard={globalLeaderboard}
          isLoading={isLoading}
          playerName={playerName}
          onRetry={startGame}
        />
      )}
    </div>
  );
}

export default App;

