export interface GameJam {
  id: string;
  title: string;
  theme: string;
  description: string;
  rules: string[];
  deadline: Date;
  startDate: Date;
  status: 'active' | 'upcoming' | 'ended';
  participants: {
    id: string;
    username: string;
    avatar?: string;
    role: 'player' | 'developer';
  }[];
  submissions?: {
    id: string;
    gameTitle: string;
    developer: string;
    thumbnail: string;
    rating?: number;
  }[];
}

export const MOCK_JAMS: GameJam[] = [
  {
    id: '1',
    title: 'Spooky Game Jam 2026',
    theme: 'Fear & Mystery',
    description:
      'Create a horror or mystery-themed game in 72 hours. Your game should evoke emotions of fear, suspense, or intrigue.',
    rules: [
      'Build a game based on the theme: Fear & Mystery',
      'Submit your game before the deadline',
      'Game can be in any genre as long as it follows the theme',
      'Individual or team submissions allowed',
      'Assets can be pre-made or created during jam',
      'Have fun and be creative!',
    ],
    startDate: new Date('2026-04-01'),
    deadline: new Date('2026-04-04'),
    status: 'active',
    participants: [
      { id: '1', username: 'Alex Dev', role: 'developer', avatar: 'AD' },
      { id: '2', username: 'Jordan Maker', role: 'developer', avatar: 'JM' },
      { id: '3', username: 'Casey Pixel', role: 'player', avatar: 'CP' },
      { id: '4', username: 'Morgan Code', role: 'developer', avatar: 'MC' },
      { id: '5', username: 'Riley Games', role: 'player', avatar: 'RG' },
    ],
    submissions: [
      {
        id: '1',
        gameTitle: 'Shadows of Silence',
        developer: 'Alex Dev',
        thumbnail: 'https://images.unsplash.com/photo-1538481143235-97a4aa328b33?w=300&h=200&fit=crop',
        rating: 4.8,
      },
      {
        id: '2',
        gameTitle: 'The Last Echo',
        developer: 'Jordan Maker',
        thumbnail: 'https://images.unsplash.com/photo-1460066844512-9d97af8cc6c3?w=300&h=200&fit=crop',
        rating: 4.5,
      },
    ],
  },
  {
    id: '2',
    title: 'Retro Arcade Challenge',
    theme: '8-Bit Nostalgia',
    description:
      'Build a retro-style arcade game inspired by the golden age of gaming. Pixel art, chiptune music, and simple mechanics welcome!',
    rules: [
      'Create a game with retro/8-bit aesthetic',
      'Keep gameplay simple and addictive',
      'Submit before April 15, 2026',
      'Pixel art recommended but not required',
      'Single player or multiplayer accepted',
      'Maximum game size: 10MB',
    ],
    startDate: new Date('2026-04-10'),
    deadline: new Date('2026-04-15'),
    status: 'upcoming',
    participants: [
      { id: '6', username: 'Sam Canvas', role: 'developer', avatar: 'SC' },
      { id: '7', username: 'Alex Dev', role: 'developer', avatar: 'AD' },
    ],
  },
  {
    id: '3',
    title: 'Puzzle Master Jam',
    theme: 'Brain Teasers',
    description:
      'Design innovative puzzle games that challenge players mentally. Focus on unique mechanics and creative solutions.',
    rules: [
      'Core focus: Puzzle gameplay',
      'Any puzzle genre: Match-3, Logic, Physics, etc.',
      'Difficulty progression expected',
      'Deadline: March 25, 2026',
      'Solo or team participation',
      'English-friendly interface required',
    ],
    startDate: new Date('2026-03-20'),
    deadline: new Date('2026-03-25'),
    status: 'ended',
    participants: [
      { id: '8', username: 'Robin Clever', role: 'developer', avatar: 'RC' },
      { id: '9', username: 'Taylor Logic', role: 'player', avatar: 'TL' },
      { id: '10', username: 'Morgan Code', role: 'developer', avatar: 'MC' },
    ],
    submissions: [
      {
        id: '3',
        gameTitle: 'Pattern Flow',
        developer: 'Robin Clever',
        thumbnail: 'https://images.unsplash.com/photo-1553294340-976fb0ac8580?w=300&h=200&fit=crop',
        rating: 4.6,
      },
    ],
  },
  {
    id: '4',
    title: 'Multiplayer Mayhem Jam',
    theme: 'Local Multiplayer Fun',
    description:
      'Create games designed for local multiplayer. Couch co-op, split-screen, or turn-based games that bring people together.',
    rules: [
      'Must support 2+ local players',
      'Any genre welcome',
      'Controller-friendly recommended',
      'Submit by April 20, 2026',
      'Cross-platform compatibility bonus',
      'Easy-to-learn mechanics encouraged',
    ],
    startDate: new Date('2026-04-05'),
    deadline: new Date('2026-04-20'),
    status: 'active',
    participants: [
      { id: '11', username: 'Casey Pixel', role: 'player', avatar: 'CP' },
      { id: '12', username: 'Morgan Code', role: 'developer', avatar: 'MC' },
      { id: '4', username: 'Morgan Code', role: 'developer', avatar: 'MC' },
    ],
  },
  {
    id: '5',
    title: 'Experimental Game Jam',
    theme: 'Push Boundaries',
    description:
      'Break the rules! Create unconventional games that challenge traditional game design. Art projects and experimental mechanics welcome.',
    rules: [
      'Forget conventional game design',
      'Any form of interactive experience accepted',
      'Experimental mechanics encouraged',
      'Deadline: May 1, 2026',
      'Individual entries preferred',
      'Documentation of concept required',
    ],
    startDate: new Date('2026-04-25'),
    deadline: new Date('2026-05-01'),
    status: 'upcoming',
    participants: [],
  },
];
