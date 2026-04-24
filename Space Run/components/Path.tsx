
import React from 'react';
import { LANE_WIDTH } from '../types';

interface PathProps {
  length: number;
  color: string;
}

const Path: React.FC<PathProps> = ({ length, color }) => {
  return (
    <group>
      {/* Spaceship Flight Path Base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -length / 2]} receiveShadow>
        <planeGeometry args={[LANE_WIDTH * 6, length]} />
        <meshStandardMaterial color="#0a0f1f" />
      </mesh>

      {/* Space Lane Markers */}
      {[-1.5, -0.5, 0.5, 1.5].map((x, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x * LANE_WIDTH, 0, -length / 2]}>
          <planeGeometry args={[0.1, length]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Space Corridor Walls */}
      <mesh position={[LANE_WIDTH * 3, 1, -length / 2]}>
        <boxGeometry args={[0.2, 2, length]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} transparent opacity={0.3} />
      </mesh>
      <mesh position={[-LANE_WIDTH * 3, 1, -length / 2]}>
        <boxGeometry args={[0.2, 2, length]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

export default Path;
