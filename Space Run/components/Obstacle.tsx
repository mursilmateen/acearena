
import React, { useRef } from 'react';
import { ObstacleData, ObstacleType, LANE_WIDTH } from '../types';
import * as THREE from 'three';

interface ObstacleProps {
  data: ObstacleData;
  themeColor: string;
}

const Obstacle: React.FC<ObstacleProps> = ({ data, themeColor }) => {
  const { type, lane, z } = data;
  const x = lane * LANE_WIDTH;
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef} position={[x, 0, z]}>
      {type === ObstacleType.LOW ? (
        // LOW OBSTACLE - Compact neon yellow glowing rectangular block (~0.6 units)
        <group position={[0, 0.3, 0]}>
          {/* Main compact block */}
          <mesh castShadow>
            <boxGeometry args={[2.4, 0.6, 1.2]} />
            <meshStandardMaterial 
              color={themeColor} 
              emissive={themeColor} 
              emissiveIntensity={2.5}
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
          {/* Cyan neon glow outline */}
          <mesh scale={1.05}>
            <boxGeometry args={[2.4, 0.6, 1.2]} />
            <meshStandardMaterial 
              color="#00ffff" 
              emissive="#00ffff"
              emissiveIntensity={1}
              transparent 
              opacity={0.3} 
              wireframe 
            />
          </mesh>
        </group>
      ) : type === ObstacleType.MEDIUM ? (
        // MEDIUM OBSTACLE - Neon pink upright rectangular block (~1.8 units)
        <group position={[0, 0.9, 0]}>
          {/* Main upright block */}
          <mesh castShadow>
            <boxGeometry args={[1.8, 1.8, 1.0]} />
            <meshStandardMaterial 
              color={themeColor} 
              emissive={themeColor} 
              emissiveIntensity={2.5}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
          {/* Edge highlights for depth */}
          <mesh position={[-0.9, 0, 0]} castShadow>
            <boxGeometry args={[0.15, 1.8, 1.0]} />
            <meshStandardMaterial 
              color={themeColor} 
              emissive={themeColor} 
              emissiveIntensity={2}
            />
          </mesh>
          <mesh position={[0.9, 0, 0]} castShadow>
            <boxGeometry args={[0.15, 1.8, 1.0]} />
            <meshStandardMaterial 
              color={themeColor} 
              emissive={themeColor} 
              emissiveIntensity={2}
            />
          </mesh>
          {/* Neon glow outline */}
          <mesh scale={1.08}>
            <boxGeometry args={[1.8, 1.8, 1.0]} />
            <meshStandardMaterial 
              color={themeColor} 
              transparent 
              opacity={0.25} 
              wireframe 
            />
          </mesh>
        </group>
      ) : (
        // TALL OBSTACLE - Neon cyan gate structure with top bar and pillars
        <group position={[0, 1.0, 0]}>
          {/* Left vertical pillar */}
          <mesh castShadow position={[-1.2, 0.6, 0]}>
            <boxGeometry args={[0.35, 2.0, 0.9]} />
            <meshStandardMaterial 
              color={themeColor} 
              emissive={themeColor} 
              emissiveIntensity={2.5}
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
          
          {/* Right vertical pillar */}
          <mesh castShadow position={[1.2, 0.6, 0]}>
            <boxGeometry args={[0.35, 2.0, 0.9]} />
            <meshStandardMaterial 
              color={themeColor} 
              emissive={themeColor} 
              emissiveIntensity={2.5}
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
          
          {/* Horizontal top bar */}
          <mesh castShadow position={[0, 1.35, 0]}>
            <boxGeometry args={[2.7, 0.4, 0.9]} />
            <meshStandardMaterial 
              color={themeColor} 
              emissive={themeColor} 
              emissiveIntensity={2.5}
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
          
          {/* Top bar end caps for cleaner look */}
          <mesh castShadow position={[-1.35, 1.35, 0]}>
            <boxGeometry args={[0.2, 0.4, 0.95]} />
            <meshStandardMaterial 
              color={themeColor} 
              emissive={themeColor} 
              emissiveIntensity={2}
            />
          </mesh>
          <mesh castShadow position={[1.35, 1.35, 0]}>
            <boxGeometry args={[0.2, 0.4, 0.95]} />
            <meshStandardMaterial 
              color={themeColor} 
              emissive={themeColor} 
              emissiveIntensity={2}
            />
          </mesh>
          
          {/* Intense neon glow outline for gate structure */}
          <mesh scale={1.08} position={[-1.2, 0.6, 0]}>
            <boxGeometry args={[0.35, 2.0, 0.9]} />
            <meshStandardMaterial 
              color={themeColor}
              emissive={themeColor}
              emissiveIntensity={0.8}
              transparent 
              opacity={0.4} 
              wireframe 
            />
          </mesh>
          <mesh scale={1.08} position={[1.2, 0.6, 0]}>
            <boxGeometry args={[0.35, 2.0, 0.9]} />
            <meshStandardMaterial 
              color={themeColor}
              emissive={themeColor}
              emissiveIntensity={0.8}
              transparent 
              opacity={0.4} 
              wireframe 
            />
          </mesh>
          <mesh scale={1.06} position={[0, 1.35, 0]}>
            <boxGeometry args={[2.7, 0.4, 0.9]} />
            <meshStandardMaterial 
              color={themeColor}
              emissive={themeColor}
              emissiveIntensity={0.8}
              transparent 
              opacity={0.4} 
              wireframe 
            />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default Obstacle;
