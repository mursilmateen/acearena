import { Game } from '@/types';

export const POPULAR_TAGS = [
  'Horror',
  'Multiplayer',
  'Visual Novel',
  'Puzzle',
  'Adventure',
  'RPG',
  'Strategy',
  'Action',
  'Indie',
  'Retro',
  'Prototype',
  'Experimental',
];

export const MOCK_GAMES: Game[] = [
  {
    id: '1',
    title: 'Crimson Echoes',
    description: 'A psychological horror game with immersive storytelling',
    longDescription:
      'Crimson Echoes is a first-person psychological horror game that plunges you into the depths of a sinister mansion. Uncovering dark secrets and solving mysterious puzzles are key to surviving the night.',
    tags: ['Horror', 'Puzzle', 'Adventure'],
    price: 9.99,
    isFree: false,
    thumbnail:
      'https://images.unsplash.com/photo-1538481143235-97a4aa328b33?w=400&h=300&fit=crop',
    author: 'DarkStudio',
    authorId: 'dev-1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-10'),
    downloads: 5420,
    rating: 4.5,
    reviews: 234,
    fileType: 'zip',
  },
  {
    id: '2',
    title: 'Pixel Quest Adventures',
    description: 'Classic 16-bit style RPG adventure',
    longDescription:
      'Embark on an epic journey in this retro-inspired RPG with turn-based combat, hundreds of items to collect, and a world filled with secrets.',
    tags: ['RPG', 'Retro', 'Adventure'],
    price: 4.99,
    isFree: false,
    thumbnail:
      'https://images.unsplash.com/photo-1553294340-976fb0ac8580?w=400&h=300&fit=crop',
    author: 'RetroPixel',
    authorId: 'dev-2',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-03-05'),
    downloads: 8921,
    rating: 4.7,
    reviews: 456,
    fileType: 'zip',
  },
  {
    id: '3',
    title: 'Mindscape',
    description: 'Surreal puzzle game about perception',
    longDescription:
      'Navigate through impossible geometries and optical illusions in this mind-bending puzzle game that challenges your perception of reality.',
    tags: ['Puzzle', 'Experimental', 'Adventure'],
    price: 0,
    isFree: true,
    thumbnail:
      'https://images.unsplash.com/photo-1460066844512-9d97af8cc6c3?w=400&h=300&fit=crop',
    author: 'ArtisticMinds',
    authorId: 'dev-3',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-12'),
    downloads: 12340,
    rating: 4.3,
    reviews: 321,
    fileType: 'zip',
  },
  {
    id: '4',
    title: 'Multiplayer Mage Wars',
    description: 'Fast-paced multiplayer spell casting battles',
    longDescription:
      'Compete against players worldwide in real-time spell duels. Master element combinations, customize your mage, and climb the ranked ladder.',
    tags: ['Multiplayer', 'Action', 'Strategy'],
    price: 0,
    isFree: true,
    thumbnail:
      'https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=400&h=300&fit=crop',
    author: 'NetplayStudios',
    authorId: 'dev-4',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-03-08'),
    downloads: 15600,
    rating: 4.6,
    reviews: 567,
    fileType: 'zip',
  },
  {
    id: '5',
    title: 'Whispers of the Past',
    description: 'Visual novel with branching romance stories',
    longDescription:
      'Make choices that matter in this story-driven visual novel. Multiple endings, gorgeous artwork, and deeply emotional narratives await.',
    tags: ['Visual Novel', 'Adventure', 'Indie'],
    price: 7.99,
    isFree: false,
    thumbnail:
      'https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?w=400&h=300&fit=crop',
    author: 'StorytellerWorks',
    authorId: 'dev-5',
    createdAt: new Date('2024-01-28'),
    updatedAt: new Date('2024-03-06'),
    downloads: 4230,
    rating: 4.8,
    reviews: 198,
    fileType: 'zip',
  },
  {
    id: '6',
    title: 'Prototype: Neural Network',
    description: 'Experimental AI training simulation',
    longDescription:
      'An experimental game where you build and train neural networks to complete increasingly complex tasks. Educational and mind-bending.',
    tags: ['Experimental', 'Prototype', 'Strategy'],
    price: 0,
    isFree: true,
    thumbnail:
      'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400&h=300&fit=crop',
    author: 'TechLab',
    authorId: 'dev-6',
    createdAt: new Date('2024-02-14'),
    updatedAt: new Date('2024-03-11'),
    downloads: 2145,
    rating: 4.1,
    reviews: 87,
    fileType: 'zip',
  },
  {
    id: '7',
    title: 'Neon Survivors',
    description: 'Cyberpunk roguelike with endless action',
    longDescription:
      'Survive wave after wave of enemies in this neon-drenched roguelike. Unlock weapons, abilities, and upgrades to become unstoppable.',
    tags: ['Action', 'Indie', 'Strategy'],
    price: 6.99,
    isFree: false,
    thumbnail:
      'https://images.unsplash.com/photo-1528184989246-e2a5eb3f6f5e?w=400&h=300&fit=crop',
    author: 'CyberForge',
    authorId: 'dev-7',
    createdAt: new Date('2024-02-25'),
    updatedAt: new Date('2024-03-09'),
    downloads: 7834,
    rating: 4.4,
    reviews: 312,
    fileType: 'zip',
  },
];

export const FEATURED_GAMES = MOCK_GAMES.slice(0, 3);
export const LATEST_GAMES = MOCK_GAMES.sort(
  (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
);
