
import React, { useState, useEffect } from 'react';
import { GameState, LEVELS } from './types';
import GameScene from './components/GameScene';
import UIOverlay from './components/UIOverlay';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [containerHeight, setContainerHeight] = useState('100vh');

  useEffect(() => {
    const saved = localStorage.getItem('neon_cyborg_highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      // Use window.innerHeight for proper viewport calculation in iframes
      const height = Math.max(window.innerHeight, 400);
      setContainerHeight(`${height}px`);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('neon_cyborg_highscore', score.toString());
    }
  }, [score, highScore]);

  const currentLevel = LEVELS[currentLevelIndex];

  const startGame = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
  };

  const finishGame = () => {
    setGameState(GameState.FINISHED);
  };

  const handleRestart = () => {
    setGameState(GameState.START);
  };

  const handleNextLevel = () => {
    if (currentLevelIndex < LEVELS.length - 1) {
      setCurrentLevelIndex(prev => prev + 1);
      setGameState(GameState.START);
    }
  };

  return (
    <div 
      className="relative w-full bg-black overflow-hidden select-none"
      style={{ height: containerHeight }}
    >
      <GameScene 
        gameState={gameState} 
        currentLevel={currentLevel}
        onFinish={finishGame}
        onScoreUpdate={setScore}
        onSpeedUpdate={setSpeed}
      />
      
      <UIOverlay 
        gameState={gameState} 
        score={score}
        highScore={highScore}
        speed={speed}
        currentLevel={currentLevel}
        hasNextLevel={currentLevelIndex < LEVELS.length - 1}
        onStart={startGame}
        onRestart={handleRestart}
        onNextLevel={handleNextLevel}
      />
    </div>
  );
};

export default App;
