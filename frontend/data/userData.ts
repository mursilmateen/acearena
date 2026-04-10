export interface UserProfile {
  username: string;
  email: string;
  role: 'player' | 'developer';
  bio: string;
  joinedDate: Date;
  gamesUploaded: number;
  assetsUploaded: number;
  jamsJoined: number;
}

export interface UserGame {
  id: string;
  title: string;
  status: 'published' | 'draft';
  thumbnail: string;
  createdAt: Date;
}

export interface UserAsset {
  id: string;
  title: string;
  price: string;
  thumbnail: string;
  createdAt: Date;
}

export const USER_PROFILE: UserProfile = {
  username: 'alexcreator',
  email: 'alex@example.com',
  role: 'developer',
  bio: 'Indie game developer focused on pixel art games and game mechanics. Love creating unique gaming experiences.',
  joinedDate: new Date('2023-06-15'),
  gamesUploaded: 5,
  assetsUploaded: 12,
  jamsJoined: 3,
};

export const USER_GAMES: UserGame[] = [
  {
    id: '1',
    title: 'Pixel Quest',
    status: 'published',
    thumbnail: 'https://images.unsplash.com/photo-1538481143235-39bab5a55233?w=300&h=300&fit=crop',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Space Runner',
    status: 'published',
    thumbnail: 'https://images.unsplash.com/photo-1552062407-1b1a3e1f3b0f?w=300&h=300&fit=crop',
    createdAt: new Date('2024-02-20'),
  },
  {
    id: '3',
    title: 'Mystery Adventure',
    status: 'draft',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    createdAt: new Date('2024-03-10'),
  },
  {
    id: '4',
    title: 'Retro Platformer',
    status: 'published',
    thumbnail: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=300&h=300&fit=crop',
    createdAt: new Date('2024-03-25'),
  },
  {
    id: '5',
    title: 'Puzzle Master',
    status: 'published',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=300&fit=crop',
    createdAt: new Date('2024-04-01'),
  },
];

export const USER_ASSETS: UserAsset[] = [
  {
    id: 'a1',
    title: 'Pixel Art Character Pack',
    price: '$9.99',
    thumbnail: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=300&h=300&fit=crop',
    createdAt: new Date('2023-12-01'),
  },
  {
    id: 'a2',
    title: 'Fantasy UI Kit',
    price: 'Free',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=300&fit=crop',
    createdAt: new Date('2023-12-15'),
  },
  {
    id: 'a3',
    title: 'Horror Sound Effects',
    price: '$7.99',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    createdAt: new Date('2024-01-10'),
  },
  {
    id: 'a4',
    title: '3D Low Poly Trees',
    price: '$4.99',
    thumbnail: 'https://images.unsplash.com/photo-1552062407-1b1a3e1f3b0f?w=300&h=300&fit=crop',
    createdAt: new Date('2024-01-20'),
  },
];
