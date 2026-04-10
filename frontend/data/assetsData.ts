export interface Asset {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  image: string;
  fileType: string;
}

export const ASSETS: Asset[] = [
  {
    id: "1",
    title: "Pixel Art Character Pack",
    description: "100+ pixel art characters with animations",
    category: "Sprites",
    price: "$9.99",
    image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400&h=400&fit=crop",
    fileType: "PNG",
  },
  {
    id: "2",
    title: "Fantasy UI Kit",
    description: "Complete RPG UI templates for your game",
    category: "UI Kits",
    price: "Free",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop",
    fileType: "PNG",
  },
  {
    id: "3",
    title: "Horror Sound Effects Pack",
    description: "200+ atmospheric horror and ambient sounds",
    category: "Sound Effects",
    price: "$7.99",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
    fileType: "MP3",
  },
  {
    id: "4",
    title: "3D Low Poly Trees",
    description: "15 optimized low poly trees for environments",
    category: "3D Models",
    price: "$4.99",
    image: "https://images.unsplash.com/photo-1552062407-1b1a3e1f3b0f?w=400&h=400&fit=crop",
    fileType: "Unity Package",
  },
  {
    id: "5",
    title: "Background Music Pack",
    description: "10 royalty-free background tracks",
    category: "Music",
    price: "$5.99",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
    fileType: "MP3",
  },
  {
    id: "6",
    title: "Sci-Fi UI Elements",
    description: "Modern sci-fi themed UI components",
    category: "UI Kits",
    price: "$6.99",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop",
    fileType: "PNG",
  },
  {
    id: "7",
    title: "Anime Character Sprites",
    description: "50+ anime style character sprites",
    category: "Sprites",
    price: "$12.99",
    image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400&h=400&fit=crop",
    fileType: "PNG",
  },
  {
    id: "8",
    title: "Free Game Icons Pack",
    description: "500+ game icons for UI and menus",
    category: "UI Kits",
    price: "Free",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop",
    fileType: "PNG",
  },
  {
    id: "9",
    title: "3D Monster Models",
    description: "12 detailed monster models with textures",
    category: "3D Models",
    price: "$14.99",
    image: "https://images.unsplash.com/photo-1552062407-1b1a3e1f3b0f?w=400&h=400&fit=crop",
    fileType: "Unreal Package",
  },
  {
    id: "10",
    title: "Environmental Ambience Sounds",
    description: "100+ nature and environment sound effects",
    category: "Sound Effects",
    price: "Free",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
    fileType: "MP3",
  },
  {
    id: "11",
    title: "2D Asset Bundle",
    description: "Complete 2D game asset pack",
    category: "2D Assets",
    price: "$19.99",
    image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400&h=400&fit=crop",
    fileType: "PNG",
  },
  {
    id: "12",
    title: "Epic Fantasy Music Tracks",
    description: "8 cinematic fantasy orchestral tracks",
    category: "Music",
    price: "$8.99",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
    fileType: "MP3",
  },
];

export const ASSET_CATEGORIES = [
  "2D Assets",
  "3D Models",
  "UI Kits",
  "Sound Effects",
  "Music",
  "Sprites",
];

export const PRICE_OPTIONS = [
  { label: "Free", value: "free" },
  { label: "Paid", value: "paid" },
  { label: "Under $5", value: "under-5" },
  { label: "Under $10", value: "under-10" },
];

export const FILE_TYPES = [
  "PNG",
  "MP3",
  "Unity Package",
  "Unreal Package",
];
