// Mock Community Data for AceArena

export interface CommunityPost {
  id: string;
  title: string;
  contentPreview: string;
  author: string;
  replies: number;
  time: string;
  category: 'Game Development' | 'Help' | 'Feedback' | 'Collaboration';
}

export interface TrendingTopic {
  id: string;
  title: string;
  posts: number;
}

export interface ActiveDeveloper {
  id: string;
  username: string;
  specialty: string;
  postsCount: number;
}

export interface GameJam {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  theme: string;
  prize: string;
}

export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: '1',
    title: 'How do I upload my first game on AceArena?',
    contentPreview: 'I just finished my first game project and I\'m ready to publish it. Can someone walk me through the upload process? Also, what are the best practices for setting up the game page?',
    author: 'noobDev',
    replies: 23,
    time: '2 hours ago',
    category: 'Help',
  },
  {
    id: '2',
    title: 'Feedback needed for my horror game demo',
    contentPreview: 'I\'ve been working on a psychological horror game for the past 3 months. Just released a demo and would love constructive feedback on gameplay mechanics, atmosphere, and story pacing...',
    author: 'pixelmaster',
    replies: 45,
    time: 'Yesterday',
    category: 'Feedback',
  },
  {
    id: '3',
    title: 'Best game engines for beginners in Pakistan?',
    contentPreview: 'Hey everyone! I\'m starting my game dev journey and want to know which engine is best to learn. I\'ve heard about Unity, Unreal, and Godot. What are your experiences?',
    author: 'indieDevPK',
    replies: 38,
    time: '3 days ago',
    category: 'Game Development',
  },
  {
    id: '4',
    title: 'Looking for a 2D artist for collaboration',
    contentPreview: 'I\'m a developer working on a 2D platformer adventure game and I need an experienced 2D pixel artist to join my team. We\'re a small indie studio based in Karachi...',
    author: 'gameCrafter',
    replies: 12,
    time: '1 week ago',
    category: 'Collaboration',
  },
  {
    id: '5',
    title: 'How to optimize Unity games for low-end PCs?',
    contentPreview: 'My game is performing well on high-end systems but struggles on older PCs. Looking for tips on optimization, LOD systems, and memory management in Unity...',
    author: 'code_wizard',
    replies: 34,
    time: '4 days ago',
    category: 'Game Development',
  },
  {
    id: '6',
    title: 'My first game release – need honest reviews',
    contentPreview: 'After 18 months of solo development, I\'ve finally released my action RPG on AceArena. Please check it out and let me know what you think. All feedback is welcome!',
    author: 'dev_ali',
    replies: 28,
    time: '5 days ago',
    category: 'Feedback',
  },
  {
    id: '7',
    title: 'Any Unreal Engine developers here?',
    contentPreview: 'Looking to connect with other Unreal Engine devs to discuss best practices, share resources, and potentially collaborate on projects. Let\'s build a community!',
    author: 'unity_guy',
    replies: 19,
    time: '1 week ago',
    category: 'Collaboration',
  },
  {
    id: '8',
    title: 'How to price indie games?',
    contentPreview: 'I\'m struggling with pricing my indie game. Should I go free-to-play, $4.99, or $9.99? What factors should I consider for pricing decisions?',
    author: 'gameCrafter',
    replies: 42,
    time: '5 days ago',
    category: 'Help',
  },
  {
    id: '9',
    title: 'Tips for publishing HTML5 games',
    contentPreview: 'Just finished my HTML5 web game and ready to publish. Looking for advice on distribution platforms, marketing strategies, and best practices for web games...',
    author: 'noobDev',
    replies: 15,
    time: '3 days ago',
    category: 'Game Development',
  },
  {
    id: '10',
    title: 'Sound design tools for beginners?',
    contentPreview: 'I want to create professional sound effects and music for my game but I\'m new to audio production. What tools do you recommend for beginners on a budget?',
    author: 'pixelmaster',
    replies: 26,
    time: '2 days ago',
    category: 'Help',
  },
  {
    id: '11',
    title: 'Game design document template?',
    contentPreview: 'Does anyone have a good GDD template they use for their projects? I want to improve my game design process and would love to see examples from experienced devs...',
    author: 'code_wizard',
    replies: 31,
    time: '1 day ago',
    category: 'Game Development',
  },
  {
    id: '12',
    title: 'Marketing strategies for indie games',
    contentPreview: 'With thousands of games releasing daily, how do you get your indie game noticed? Share your marketing tips, social media strategies, and what actually works...',
    author: 'indieDevPK',
    replies: 37,
    time: '3 days ago',
    category: 'Help',
  },
  {
    id: '13',
    title: 'Asset store recommendations?',
    contentPreview: 'Looking for high-quality 3D models, animations, and audio assets. Which asset stores do you trust? Any recommendations for budget-friendly options?',
    author: 'dev_ali',
    replies: 22,
    time: '4 days ago',
    category: 'Help',
  },
  {
    id: '14',
    title: 'Showcase: My first commercial game!',
    contentPreview: 'After 2 years, I finally released my puzzle adventure game and it\'s selling! Never thought this day would come. Sharing my journey and lessons learned...',
    author: 'gameCrafter',
    replies: 40,
    time: '6 days ago',
    category: 'Feedback',
  },
  {
    id: '15',
    title: 'Game development bootcamp experiences',
    contentPreview: 'Thinking about joining a game dev bootcamp. Anyone here gone through one? Worth the investment? What did you learn and was it helpful for your career?',
    author: 'unity_guy',
    replies: 18,
    time: '1 week ago',
    category: 'Help',
  },
];

export const TRENDING_TOPICS: TrendingTopic[] = [
  {
    id: 'trend-1',
    title: 'Game Development Tips',
    posts: 284,
  },
  {
    id: 'trend-2',
    title: 'Unity vs Unreal Engine',
    posts: 156,
  },
  {
    id: 'trend-3',
    title: 'Indie Game Marketing',
    posts: 121,
  },
  {
    id: 'trend-4',
    title: 'Beginner Questions',
    posts: 198,
  },
  {
    id: 'trend-5',
    title: 'Game Asset Resources',
    posts: 87,
  },
  {
    id: 'trend-6',
    title: 'Monetization Strategies',
    posts: 95,
  },
];

export const ACTIVE_DEVELOPERS: ActiveDeveloper[] = [
  {
    id: 'dev-1',
    username: 'dev_ali',
    specialty: 'Full-stack Game Dev',
    postsCount: 156,
  },
  {
    id: 'dev-2',
    username: 'pixelmaster',
    specialty: 'Pixel Art & Design',
    postsCount: 134,
  },
  {
    id: 'dev-3',
    username: 'indieDevPK',
    specialty: 'Game Design',
    postsCount: 112,
  },
  {
    id: 'dev-4',
    username: 'gameCrafter',
    specialty: 'Game Architecture',
    postsCount: 98,
  },
  {
    id: 'dev-5',
    username: 'code_wizard',
    specialty: 'Engine Programming',
    postsCount: 87,
  },
  {
    id: 'dev-6',
    username: 'unity_guy',
    specialty: 'Unity Development',
    postsCount: 76,
  },
];

export const GAME_JAMS: GameJam[] = [
  {
    id: 'jam-1',
    title: 'AceArena Spring Jam 2026',
    description: 'Create a game in 7 days with a mystery theme',
    startDate: 'Apr 15, 2026',
    endDate: 'Apr 22, 2026',
    theme: 'Mystery',
    prize: '$5,000 in prizes',
  },
  {
    id: 'jam-2',
    title: 'Horror Challenge',
    description: 'Create the scariest game experience',
    startDate: 'May 1, 2026',
    endDate: 'May 8, 2026',
    theme: 'Horror',
    prize: '$3,000 + Feature',
  },
  {
    id: 'jam-3',
    title: 'Pixel Art Game Jam',
    description: 'Retro pixel art focused competition',
    startDate: 'May 15, 2026',
    endDate: 'May 22, 2026',
    theme: 'Pixel Art Style',
    prize: '$2,000 + Showcase',
  },
];
