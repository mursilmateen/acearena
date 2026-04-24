
import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import * as THREE from 'three';
import { LANE_WIDTH, GameState } from '../types';
import { soundManager } from '../utils/soundManager';

interface PlayerProps {
  gameState: GameState;
  onSlideChange: (isSliding: boolean) => void;
  onJumpChange: (isJumping: boolean) => void;
  color: string;
}

const Player = forwardRef<THREE.Group, PlayerProps>(({ gameState, onSlideChange, onJumpChange, color }, ref) => {
  const [lane, setLane] = useState(0);
  const [scaleY, setScaleY] = useState(1);
  
  const isJumping = useRef(false);
  const isSliding = useRef(false);
  const velocityY = useRef(0);
  const gravity = -0.015;
  const jumpForce = 0.35;
  const prevLaneRef = useRef(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const lastTapTimeRef = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== GameState.PLAYING) return;

      if ((e.key === 'ArrowLeft' || e.key === 'a') && lane > -1) {
        setLane(prev => prev - 1);
      } else if ((e.key === 'ArrowRight' || e.key === 'd') && lane < 1) {
        setLane(prev => prev + 1);
      } else if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') && !isJumping.current && !isSliding.current) {
        isJumping.current = true;
        onJumpChange(true);
        velocityY.current = jumpForce;
        soundManager.playJump();
      } else if ((e.key === 'ArrowDown' || e.key === 's') && !isJumping.current && !isSliding.current) {
        startSlide();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      lastTapTimeRef.current = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (gameState !== GameState.PLAYING) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX.current;
      const deltaY = touchEndY - touchStartY.current;
      const deltaTime = Date.now() - lastTapTimeRef.current;

      const swipeThreshold = 50;
      const tapThreshold = 200;

      // Swipe left
      if (deltaX < -swipeThreshold && Math.abs(deltaY) < 100 && lane > -1) {
        setLane(prev => prev - 1);
      }
      // Swipe right
      else if (deltaX > swipeThreshold && Math.abs(deltaY) < 100 && lane < 1) {
        setLane(prev => prev + 1);
      }
      // Tap (jump)
      else if (Math.abs(deltaX) < swipeThreshold && deltaY > 30 && deltaTime < tapThreshold && !isJumping.current && !isSliding.current) {
        isJumping.current = true;
        onJumpChange(true);
        velocityY.current = jumpForce;
        soundManager.playJump();
      }
      // Slide (long swipe down)
      else if (deltaY > 50 && !isJumping.current && !isSliding.current) {
        startSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [lane, gameState]);

  const startSlide = () => {
    isSliding.current = true;
    onSlideChange(true);
    setScaleY(0.4);
    soundManager.playSlide();
    setTimeout(() => {
      isSliding.current = false;
      onSlideChange(false);
      setScaleY(1);
    }, 800);
  };

  useFrame(() => {
    if (!ref || typeof ref === 'function' || !ref.current) return;
    const targetX = lane * LANE_WIDTH;
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, targetX, 0.15);

    // Calculate movement direction for realistic banking animation
    const laneDirection = lane - prevLaneRef.current;
    prevLaneRef.current = lane;

    // Bank rotation (Z-axis tilt) - tilts left/right based on movement
    const bankRotation = lane * 0.3; // Max tilt ~17 degrees
    ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, bankRotation, 0.12);

    // Yaw rotation (Y-axis) - subtle nose pointing in direction of travel
    const yawRotation = laneDirection * 0.15; // Smooth yaw when changing lanes
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, yawRotation, 0.15);

    // Pitch animation for descent/climb feel
    const pitchRotation = Math.sin(Date.now() * 0.001) * 0.05; // Subtle breathing pitch
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, pitchRotation, 0.1);

    if (isJumping.current) {
      velocityY.current += gravity;
      ref.current.position.y += velocityY.current;
      if (ref.current.position.y <= 0) {
        ref.current.position.y = 0;
        isJumping.current = false;
        onJumpChange(false);
        velocityY.current = 0;
      }
    }
    ref.current.scale.y = THREE.MathUtils.lerp(ref.current.scale.y, scaleY, 0.2);
  });

  return (
    <group ref={ref}>
      <Trail
        width={1.5}
        length={8}
        color={new THREE.Color(color)}
        attenuation={(t) => t * t}
      >
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </Trail>

      {/* Main Fuselage - Arrowhead Silhouette */}
      <mesh castShadow position={[0, 0.5, 0.15]}>
        <boxGeometry args={[0.3, 1.1, 0.9]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          metalness={0.8} 
          roughness={0.3}
          emissive="#0a0a15"
          emissiveIntensity={0.4}
        />
      </mesh>
      
      {/* Sharp Pointed Nose Cone */}
      <mesh castShadow position={[0, 0.65, 0.65]}>
        <coneGeometry args={[0.2, 0.6, 12]} />
        <meshStandardMaterial 
          color="#00ff88" 
          emissive="#00ff88" 
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
      
      {/* V-Shaped Left Wing - Aggressive Angle */}
      <mesh castShadow position={[-0.55, 0.35, -0.1]} rotation={[0, 0, Math.PI / 8]}>
        <boxGeometry args={[0.15, 0.85, 0.5]} />
        <meshStandardMaterial 
          color="#16213e" 
          metalness={0.7} 
          roughness={0.4}
          emissive="#0a0015"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* V-Shaped Right Wing - Aggressive Angle */}
      <mesh castShadow position={[0.55, 0.35, -0.1]} rotation={[0, 0, -Math.PI / 8]}>
        <boxGeometry args={[0.15, 0.85, 0.5]} />
        <meshStandardMaterial 
          color="#16213e" 
          metalness={0.7} 
          roughness={0.4}
          emissive="#0a0015"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Neon Energy Line - Left Wing */}
      <mesh position={[-0.55, 0.5, 0.1]}>
        <boxGeometry args={[0.08, 0.7, 0.08]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={2.5}
        />
      </mesh>
      
      {/* Neon Energy Line - Right Wing */}
      <mesh position={[0.55, 0.5, 0.1]}>
        <boxGeometry args={[0.08, 0.7, 0.08]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={2.5}
        />
      </mesh>
      
      {/* Dorsal Fin - Combat Mode */}
      <mesh castShadow position={[0, 1.1, 0]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.12, 0.5, 0.25]} />
        <meshStandardMaterial 
          color="#0f3460" 
          metalness={0.6} 
          roughness={0.5}
          emissive={color}
          emissiveIntensity={0.4}
        />
      </mesh>
      
      {/* Glass Cockpit Canopy */}
      <mesh castShadow position={[0, 0.8, 0.25]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial 
          color="#001a40" 
          transparent 
          opacity={0.5}
          metalness={0.2}
          roughness={0.1}
          emissive="#00ccff"
          emissiveIntensity={1.5}
        />
      </mesh>
      
      {/* Glowing Cockpit Controls - Inner */}
      <mesh position={[0, 0.8, 0.25]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshBasicMaterial 
          color="#00ffff"
        />
      </mesh>
      
      {/* Alien Glyph 1 - Top */}
      <mesh position={[-0.12, 0.95, 0.35]}>
        <octahedronGeometry args={[0.04]} />
        <meshStandardMaterial 
          color="#ff00ff" 
          emissive="#ff00ff" 
          emissiveIntensity={2}
        />
      </mesh>
      
      {/* Alien Glyph 2 - Top */}
      <mesh position={[0.12, 0.95, 0.35]}>
        <octahedronGeometry args={[0.04]} />
        <meshStandardMaterial 
          color="#ff00ff" 
          emissive="#ff00ff" 
          emissiveIntensity={2}
        />
      </mesh>
      
      {/* Heat Mark 1 - Battle Scar */}
      <mesh position={[-0.15, 0.4, -0.35]}>
        <boxGeometry args={[0.08, 0.12, 0.04]} />
        <meshStandardMaterial 
          color="#8b0000" 
          emissive="#ff4400" 
          emissiveIntensity={1.2}
        />
      </mesh>
      
      {/* Heat Mark 2 - Battle Scar */}
      <mesh position={[0.15, 0.3, -0.4]}>
        <boxGeometry args={[0.06, 0.1, 0.04]} />
        <meshStandardMaterial 
          color="#8b0000" 
          emissive="#ff4400" 
          emissiveIntensity={1.2}
        />
      </mesh>
      
      {/* Left Thruster - Main */}
      <mesh position={[-0.25, 0.3, -0.5]}>
        <cylinderGeometry args={[0.18, 0.15, 0.4, 16]} />
        <meshStandardMaterial 
          color="#0a0a2e" 
          metalness={0.8} 
          roughness={0.3}
        />
      </mesh>
      
      {/* Right Thruster - Main */}
      <mesh position={[0.25, 0.3, -0.5]}>
        <cylinderGeometry args={[0.18, 0.15, 0.4, 16]} />
        <meshStandardMaterial 
          color="#0a0a2e" 
          metalness={0.8} 
          roughness={0.3}
        />
      </mesh>
      
      {/* Left Thruster - Plasma Glow */}
      <mesh position={[-0.25, 0.3, -0.65]}>
        <cylinderGeometry args={[0.2, 0.18, 0.3, 16]} />
        <meshStandardMaterial 
          color="#0055ff" 
          emissive="#0055ff" 
          emissiveIntensity={3}
        />
      </mesh>
      
      {/* Right Thruster - Plasma Glow */}
      <mesh position={[0.25, 0.3, -0.65]}>
        <cylinderGeometry args={[0.2, 0.18, 0.3, 16]} />
        <meshStandardMaterial 
          color="#0055ff" 
          emissive="#0055ff" 
          emissiveIntensity={3}
        />
      </mesh>
      
      {/* Purple Plasma Aura - Left */}
      <mesh position={[-0.25, 0.35, -0.75]}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial 
          color="#5500ff" 
          emissive="#5500ff" 
          emissiveIntensity={2.5}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Purple Plasma Aura - Right */}
      <mesh position={[0.25, 0.35, -0.75]}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial 
          color="#5500ff" 
          emissive="#5500ff" 
          emissiveIntensity={2.5}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Main Thruster Light - Blue */}
      <pointLight position={[-0.25, 0.3, -0.8]} intensity={2} color="#0055ff" distance={3} />
      <pointLight position={[0.25, 0.3, -0.8]} intensity={2} color="#0055ff" distance={3} />
      
      {/* Plasma Light - Purple */}
      <pointLight position={[-0.25, 0.35, -0.75]} intensity={1.5} color="#5500ff" distance={2.5} />
      <pointLight position={[0.25, 0.35, -0.75]} intensity={1.5} color="#5500ff" distance={2.5} />
      
      {/* Cockpit Glow */}
      <pointLight position={[0, 0.8, 0.5]} intensity={1.2} color="#00ffff" distance={2} />
      
      {/* Main Hull Glow */}
      <pointLight position={[0, 0.5, 0.5]} intensity={0.8} color={color} distance={2.5} />
      
      {/* Trail Effect for Energy */}
    </group>
  );
});

export default Player;
