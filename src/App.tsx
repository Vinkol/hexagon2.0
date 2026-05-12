import { useState, useEffect, useCallback } from 'react';
import HexagonCanvas from './components/HexagonCanvas';
import type { GameState } from './types';
import './index.css';

function App() {
  const [status, setStatus] = useState<GameState>('START');
  const [score, setScore] = useState('0.00');

  const handleGameOver = useCallback((finalScore: string) => {
    setScore(finalScore);
    setStatus('GAMEOVER');
  }, []);

  const handleUpdateScore = useCallback((newScore: string) => {
    setScore(newScore);
  }, []);

  const startGame = useCallback(() => {
    if (status !== 'PLAYING') {
      setStatus('PLAYING');
    }
  }, [status]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        startGame();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [startGame]);

  return (
    <div className="game-wrapper">
      <div className="score-ui">TIME: {score}</div>

      {status === 'START' && (
        <div className="overlay">
          <h1>HEXAGON 2.0</h1>
          <button className="btn-start" onClick={startGame}>
            START
          </button>
        </div>
      )}

      {status === 'PLAYING' && (
        <HexagonCanvas onGameOver={handleGameOver} updateScore={handleUpdateScore} />
      )}

      {status === 'GAMEOVER' && (
        <div className="overlay">
          <h1 style={{ color: '#ff4d4d' }}>CRASHED</h1>
          <p>FINAL TIME: {score}</p>
          <button className="btn-start" onClick={startGame}>
            RETRY
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
