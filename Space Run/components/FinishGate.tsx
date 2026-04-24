
import React from 'react';
import { LANE_WIDTH } from '../types';

interface FinishGateProps {
  position: [number, number, number];
  color: string;
}

const FinishGate: React.FC<FinishGateProps> = ({ position, color }) => {
  return (
    <group position={position}>
      <mesh position={[0, 4.5, 0]}>
        <boxGeometry args={[LANE_WIDTH * 5, 1.5, 1.5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
      </mesh>
      <mesh position={[LANE_WIDTH * 2.5, 2.25, 0]}>
        <boxGeometry args={[0.8, 4.5, 1.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-LANE_WIDTH * 2.5, 2.25, 0]}>
        <boxGeometry args={[0.8, 4.5, 1.2]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <pointLight position={[0, 4.5, 2]} intensity={5} color={color} distance={10} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <planeGeometry args={[LANE_WIDTH * 6, 4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} transparent opacity={0.4} />
      </mesh>
    </group>
  );
};

export default FinishGate;
