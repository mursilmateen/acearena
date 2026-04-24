
import { ThreeElements } from '@react-three/fiber';

export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

export enum ObstacleType {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  TALL = 'TALL'
}

export interface ObstacleData {
  id: string;
  type: ObstacleType;
  lane: number;
  z: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  pathLength: number;
  baseSpeed: number;
  obstacles: ObstacleData[];
  themeColor: string;
}

export const LANE_WIDTH = 3;

const THEMES = [
  "#22c55e", // Green
  "#00f2ff", // Cyan
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#eab308", // Yellow
  "#f97316", // Orange
  "#ef4444", // Red
  "#ffffff"  // White (Singularity)
];

const generateObstacles = (levelId: number, length: number): ObstacleData[] => {
  const obs: ObstacleData[] = [];
  // Increased minimum spacing to prevent overlapping
  const spacingBase = Math.max(20, 36 - (levelId * 0.8)); 
  const obstacleCount = Math.floor(length / spacingBase);
  const usedLanesForIndex: number[] = [];

  for (let i = 0; i < obstacleCount; i++) {
    const z = -50 - (i * spacingBase);
    // Rotate through lanes to prevent consecutive obstacles in same lane
    const lane = [-1, 0, 1][i % 3];
    
    // Determine type based on level
    let type = ObstacleType.LOW;
    const rand = Math.random();
    if (rand > 0.6) type = ObstacleType.MEDIUM;
    if (rand > 0.85) type = ObstacleType.TALL;

    obs.push({
      id: `${levelId}-${i}`,
      type,
      lane,
      z
    });

    // Add secondary "trap" obstacles for higher levels (Sector 8+)
    if (levelId > 7 && Math.random() > 0.75) {
      const secondaryLane = (lane + 1 > 1) ? -1 : lane + 1;
      obs.push({
        id: `${levelId}-${i}-trap`,
        type: Math.random() > 0.5 ? ObstacleType.LOW : ObstacleType.TALL,
        lane: secondaryLane,
        z: z - 7 // Slightly more breathing room for high speed reactions
      });
    }
  }
  return obs;
};

export const LEVELS: LevelConfig[] = Array.from({ length: 10 }).map((_, i) => {
  const id = i + 1;
  const names = [
    "Safe Run", "Neon District", "Data Stream", "Grid Access", 
    "Core Sector", "Neural Link", "Plasma Port", "Overclock", 
    "Final Breach", "Singularity"
  ];
  
  // baseSpeed scaled for gradual difficulty increase
  // Level 1: 0.8
  // Level 5: 0.8 + (4 * 0.1) = 1.2
  // Level 10: 0.8 + (9 * 0.1) = 1.7
  return {
    id,
    name: names[i],
    pathLength: 500 + (i * 200), // Longer paths to accommodate speed
    baseSpeed: 0.8 + (i * 0.1),
    obstacles: generateObstacles(id, 500 + (i * 200)),
    themeColor: THEMES[i]
  };
});

// Fix for JSX intrinsic elements not being recognized in TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
