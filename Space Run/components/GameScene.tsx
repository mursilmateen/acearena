
import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { GameState, LANE_WIDTH, LevelConfig, ObstacleType } from '../types';
import Player from './Player';
import Path from './Path';
import Obstacle from './Obstacle';
import FinishGate from './FinishGate';
import { soundManager } from '../utils/soundManager';

interface GameSceneProps {
  gameState: GameState;
  currentLevel: LevelConfig;
  onFinish: () => void;
  onScoreUpdate: (score: number) => void;
  onSpeedUpdate: (speed: number) => void;
}

const GameContent: React.FC<GameSceneProps> = ({ gameState, currentLevel, onFinish, onScoreUpdate, onSpeedUpdate }) => {
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  
  const playerRef = useRef<THREE.Group>(null);
  const cameraTargetPos = useRef(new THREE.Vector3(0, 4, 8));
  const cameraLookAt = useRef(new THREE.Vector3(0, 1, -5));
  const lastPlayerX = useRef(0);
  const starsRef = useRef<THREE.Points>(null);

  useEffect(() => {
    if (gameState === GameState.START) {
      setCurrentSpeed(0);
      onSpeedUpdate(0);
      onScoreUpdate(0);
      soundManager.stopBackgroundMusic();
      if (playerRef.current) {
          playerRef.current.position.set(0, 0, 0);
          lastPlayerX.current = 0;
      }
    } else if (gameState === GameState.PLAYING) {
      soundManager.startBackgroundMusic();
    } else if (gameState === GameState.FINISHED) {
      soundManager.stopBackgroundMusic();
    }
  }, [currentLevel.id, gameState]);

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    if (gameState === GameState.PLAYING) {
      const targetSpeed = currentLevel.baseSpeed;
      const newSpeed = THREE.MathUtils.lerp(currentSpeed, targetSpeed, 0.1);
      setCurrentSpeed(newSpeed);
      onSpeedUpdate(Math.round(newSpeed * 100));

      playerRef.current.position.z -= newSpeed;
      onScoreUpdate(Math.abs(Math.floor(playerRef.current.position.z)));

      if (playerRef.current.position.z <= -currentLevel.pathLength) {
        onFinish();
      }

      // Screen shake decay
      if (shakeIntensity > 0) {
        setShakeIntensity(prev => Math.max(0, prev - delta * 2));
      }

      // Collision Check
      currentLevel.obstacles.forEach(obs => {
        const obsZ = obs.z;
        const playerZ = playerRef.current!.position.z;
        const distZ = Math.abs(playerZ - obsZ);
        
        if (distZ < 0.8) {
          const obsX = obs.lane * LANE_WIDTH;
          const playerX = playerRef.current!.position.x;
          const distX = Math.abs(playerX - obsX);

          if (distX < 1.0) {
            let hit = false;
            const py = playerRef.current!.position.y;
            
            if (obs.type === ObstacleType.LOW && py < 0.5) hit = true;
            else if (obs.type === ObstacleType.TALL && !isSliding) hit = true;
            else if (obs.type === ObstacleType.MEDIUM) hit = true;

            if (hit) {
              setCurrentSpeed(currentLevel.baseSpeed * 0.1);
              setShakeIntensity(0.5); // Trigger shake
              soundManager.playCollision();
            }
          }
        }
      });
    } else if (gameState === GameState.FINISHED) {
      if (currentSpeed > 0) setCurrentSpeed(prev => Math.max(0, prev - 0.01));
    }

    // Camera with Shake
    const px = playerRef.current.position.x;
    const py = playerRef.current.position.y;
    const pz = playerRef.current.position.z;

    const lateralVel = px - lastPlayerX.current;
    lastPlayerX.current = px;
    const targetTilt = -lateralVel * 0.8;
    state.camera.rotation.z = THREE.MathUtils.lerp(state.camera.rotation.z, targetTilt, 0.1);

    const bobAmount = gameState === GameState.PLAYING ? Math.sin(state.clock.elapsedTime * 8) * 0.05 : 0;
    const shakeX = (Math.random() - 0.5) * shakeIntensity;
    const shakeY = (Math.random() - 0.5) * shakeIntensity;
    
    const targetX = px * 0.6 + shakeX;
    const targetY = 6.5 + bobAmount + (py * 0.5) + shakeY;
    const targetZ = pz + 6;

    cameraTargetPos.current.set(targetX, targetY, targetZ);
    state.camera.position.lerp(cameraTargetPos.current, 0.1);

    const lookX = px * 0.3;
    const lookY = 2 + py * 0.2;
    const lookZ = pz - 5;
    cameraLookAt.current.lerp(new THREE.Vector3(lookX, lookY, lookZ), 0.1);
    state.camera.lookAt(cameraLookAt.current);

    if (state.camera instanceof THREE.PerspectiveCamera) {
      state.camera.fov = 60 + (currentSpeed * 30);
      state.camera.updateProjectionMatrix();
    }

    // Rotate stars based on speed
    if (starsRef.current) {
      starsRef.current.rotation.z += currentSpeed * 0.001;
      // Make stars follow the player so they're always visible
      starsRef.current.position.z = pz;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 4, 8]} fov={60} />
      <fog attach="fog" args={['#000814', 15, 80]} />
      
      <directionalLight 
        position={[15, 15, 15]} 
        intensity={1.8} 
        color={currentLevel.themeColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight 
        position={[-10, 10, -10]} 
        intensity={1.2} 
        color="#0055ff"
      />
      <pointLight 
        position={[0, 20, -20]} 
        intensity={1.5} 
        color="#ff00ff"
        castShadow
      />
      <ambientLight intensity={0.3} color="#0a0f1f" />
      <pointLight position={[0, -5, 0]} intensity={0.5} color="#00ffff" distance={30} />
      
      <Stars 
        ref={starsRef} 
        radius={300} 
        depth={250} 
        count={8000} 
        factor={5} 
        saturation={1} 
        fade 
        speed={0.5 + currentSpeed * 0.5} 
      />
      <Suspense fallback={null}>
        <Path length={currentLevel.pathLength} color={currentLevel.themeColor} />
        <Player 
          ref={playerRef} 
          gameState={gameState} 
          onSlideChange={setIsSliding}
          onJumpChange={setIsJumping}
          color={currentLevel.themeColor}
        />
        {currentLevel.obstacles.map((obs) => (
          <Obstacle key={obs.id} data={obs} themeColor={currentLevel.themeColor} />
        ))}
        <FinishGate position={[0, 0, -currentLevel.pathLength]} color={currentLevel.themeColor} />
      </Suspense>

      <Environment preset="night" />
    </>
  );
};

const GameScene: React.FC<GameSceneProps> = (props) => {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas shadows dpr={[1, 2]}>
        <GameContent {...props} />
      </Canvas>
    </div>
  );
};

export default GameScene;
