
import React, { useEffect, useState } from 'react';
import { GameState, LevelConfig } from '../types';
import { soundManager } from '../utils/soundManager';

interface UIOverlayProps {
  gameState: GameState;
  score: number;
  highScore: number;
  speed: number;
  currentLevel: LevelConfig;
  hasNextLevel: boolean;
  onStart: () => void;
  onRestart: () => void;
  onNextLevel: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  gameState, 
  score, 
  highScore,
  speed, 
  currentLevel, 
  hasNextLevel, 
  onStart, 
  onRestart, 
  onNextLevel 
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const isFinalLevel = currentLevel.id === 10;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (gameState === GameState.FINISHED) {
      soundManager.playLevelComplete();
    }
  }, [gameState]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-8 text-white">
      {/* HUD - Top */}
      <div className={`flex ${isMobile ? 'flex-col gap-2' : 'gap-4'} justify-between items-start`}>
        <div className={`flex ${isMobile ? 'w-full' : 'gap-4'} ${isMobile ? 'gap-2' : ''} flex-wrap`}>
          <div 
            className={`bg-black/70 backdrop-blur-xl border p-2 md:p-4 rounded-lg md:rounded-xl transition-colors duration-500 ${isMobile ? 'flex-1 min-w-[100px]' : 'min-w-[120px]'}`}
            style={{ borderColor: `${currentLevel.themeColor}4d` }}
          >
            <p className={`uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold mb-1 ${isMobile ? 'text-[8px]' : 'text-[10px]'}`} style={{ color: `${currentLevel.themeColor}b3` }}>Sector</p>
            <p className={`font-orbitron ${isMobile ? 'text-xl' : 'text-3xl'}`} style={{ color: currentLevel.themeColor }}>
              {currentLevel.id < 10 ? `0${currentLevel.id}` : currentLevel.id}
            </p>
          </div>
          <div 
            className={`bg-black/70 backdrop-blur-xl border p-2 md:p-4 rounded-lg md:rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.5)] ${isMobile ? 'flex-1 min-w-[100px]' : ''}`}
            style={{ borderColor: `${currentLevel.themeColor}4d` }}
          >
            <p className={`uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold mb-1 ${isMobile ? 'text-[8px]' : 'text-[10px]'}`} style={{ color: `${currentLevel.themeColor}b3` }}>Distance</p>
            <p className={`font-orbitron ${isMobile ? 'text-xl' : 'text-3xl'}`} style={{ color: currentLevel.themeColor }}>{score}m</p>
          </div>
          {!isMobile && (
            <div className="bg-black/70 backdrop-blur-xl border border-white/10 p-4 rounded-xl opacity-60">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold mb-1">Best</p>
              <p className="text-xl font-orbitron text-white/70">{highScore}m</p>
            </div>
          )}
        </div>
        
        <div 
          className={`bg-black/70 backdrop-blur-xl border p-2 md:p-4 rounded-lg md:rounded-xl text-right ${isMobile ? '' : 'min-w-[120px]'}`}
          style={{ borderColor: `${currentLevel.themeColor}4d` }}
        >
          <p className={`uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold mb-1 ${isMobile ? 'text-[8px]' : 'text-[10px]'}`} style={{ color: `${currentLevel.themeColor}b3` }}>Speed</p>
          <p className={`font-orbitron ${isMobile ? 'text-lg' : 'text-3xl'}`} style={{ color: currentLevel.themeColor }}>
            {speed} <span className={`${isMobile ? 'text-xs' : 'text-sm'} opacity-50`}>KH/S</span>
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {gameState === GameState.PLAYING && (
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
          <div 
            className="h-full transition-all duration-300 shadow-[0_0_10px_white]"
            style={{ 
              width: `${(score / currentLevel.pathLength) * 100}%`,
              backgroundColor: currentLevel.themeColor
            }}
          ></div>
        </div>
      )}

      {/* Start Screen */}
      {gameState === GameState.START && (
        <div className="absolute inset-0 pointer-events-auto flex items-center justify-center bg-black/90 backdrop-blur-md">
          <div className={`relative text-center max-w-lg w-full p-6 md:p-12 border border-white/10 rounded-2xl md:rounded-3xl bg-black/40 shadow-2xl mx-4`}>
            <h1 className={`font-orbitron font-bold text-white mb-2 uppercase tracking-tight ${isMobile ? 'text-4xl' : 'text-6xl'}`}>
              NEON CYBORG
            </h1>
            <p className={`text-white/50 mb-6 md:mb-10 uppercase tracking-[0.3em] md:tracking-[0.4em] font-bold ${isMobile ? 'text-[10px]' : 'text-xs'}`}>Tactical Runner 2099</p>
            
            <div className={`grid gap-3 md:gap-4 mb-6 md:mb-10 ${isMobile ? 'grid-cols-2' : 'grid-cols-2'}`}>
              <div 
                className="bg-white/5 border p-3 md:p-4 rounded-lg md:rounded-xl text-left"
                style={{ borderColor: `${currentLevel.themeColor}4d` }}
              >
                <p className={`text-white/40 uppercase font-bold mb-2 ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>Target</p>
                <p className={`font-orbitron leading-tight uppercase ${isMobile ? 'text-sm' : 'text-lg'}`} style={{ color: currentLevel.themeColor }}>{currentLevel.name}</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-3 md:p-4 rounded-lg md:rounded-xl text-left">
                <p className={`text-white/40 uppercase font-bold mb-2 ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>Distance</p>
                <p className={`font-orbitron text-white leading-tight ${isMobile ? 'text-sm' : 'text-lg'}`}>{currentLevel.pathLength}m</p>
              </div>
            </div>

            <button 
              onClick={() => {
                soundManager.playMenuClick();
                soundManager.playGameStart();
                onStart();
              }}
              className={`group relative w-full text-black font-orbitron font-bold rounded-lg md:rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${isMobile ? 'py-4 text-lg' : 'py-5 text-xl'}`}
              style={{ backgroundColor: currentLevel.themeColor }}
            >
              <span className="relative z-10 uppercase tracking-widest">Start Sector</span>
            </button>
            
            <div className="mt-6 md:mt-8 flex justify-center gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`rounded-full ${i < currentLevel.id ? 'bg-white' : 'bg-white/10'} ${isMobile ? 'h-0.5 w-4' : 'h-1 w-6'}`}
                  style={i === currentLevel.id - 1 ? { backgroundColor: currentLevel.themeColor } : {}}
                ></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Finished Screen */}
      {gameState === GameState.FINISHED && (
        <div className="absolute inset-0 pointer-events-auto flex items-center justify-center bg-black/95 backdrop-blur-lg">
          <div className={`text-center p-6 md:p-12 border border-white/10 rounded-2xl md:rounded-3xl bg-black/60 shadow-2xl mx-4 max-w-md md:max-w-none`}>
            <h2 className={`font-orbitron font-bold mb-4 uppercase tracking-tighter ${isMobile ? 'text-3xl' : 'text-6xl'}`} style={{ color: currentLevel.themeColor }}>
              {isFinalLevel ? 'SINGULARITY' : `SECTOR ${currentLevel.id} CLEAR`}
            </h2>
            <p className={`text-white/60 mb-8 md:mb-10 font-rajdhani uppercase tracking-[0.2em] ${isMobile ? 'text-sm' : 'text-lg'}`}>
              {isFinalLevel ? 'Project Neon Complete' : 'Next layer ready...'}
            </p>
            
            <div className={`flex gap-3 md:gap-4 ${isMobile ? 'flex-col' : ''}`}>
              <button 
                onClick={() => {
                  soundManager.playMenuClick();
                  soundManager.playGameStart();
                  onRestart();
                }}
                className={`flex-1 py-3 md:py-4 bg-transparent hover:bg-white/5 text-white border border-white/20 font-orbitron font-bold rounded-lg md:rounded-xl transition-all ${isMobile ? 'text-base' : 'text-lg'}`}
              >
                REPLAY
              </button>
              
              {hasNextLevel ? (
                <button 
                  onClick={() => {
                    soundManager.playMenuClick();
                    soundManager.playGameStart();
                    onNextLevel();
                  }}
                  className={`flex-1 py-3 md:py-4 text-black font-orbitron font-bold rounded-lg md:rounded-xl transition-all transform hover:scale-105 shadow-xl ${isMobile ? 'text-base' : 'text-lg'}`}
                  style={{ backgroundColor: currentLevel.themeColor }}
                >
                  NEXT SECTOR
                </button>
              ) : (
                <button 
                  onClick={() => {
                    soundManager.playMenuClick();
                    window.location.reload();
                  }}
                  className={`flex-1 py-3 md:py-4 bg-white text-black font-orbitron font-bold rounded-lg md:rounded-xl transition-all transform hover:scale-105 ${isMobile ? 'text-base' : 'text-lg'}`}
                >
                  RESTART
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {gameState === GameState.PLAYING && (
        <div className="flex justify-center mb-4 md:mb-8">
          <div className="px-4 md:px-6 py-2 md:py-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-white/40 tracking-[0.2em] md:tracking-[0.3em] uppercase flex gap-4 md:gap-12 font-bold text-[9px] md:text-[10px] flex-wrap justify-center">
            {isMobile ? (
              <>
                <span className="flex gap-1"><span className="text-white">←→</span> LANE</span>
                <span className="flex gap-1"><span className="text-white">↑</span> JUMP</span>
                <span className="flex gap-1"><span className="text-white">↓</span> SLIDE</span>
              </>
            ) : (
              <>
                <span className="flex gap-2"><span className="text-white">A/D</span> LANE</span>
                <span className="flex gap-2"><span className="text-white">SPACE</span> JUMP</span>
                <span className="flex gap-2"><span className="text-white">S</span> SLIDE</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UIOverlay;
