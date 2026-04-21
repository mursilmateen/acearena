import { useState, useCallback } from 'react';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import { useAppStore } from '@/store/appStore';
import type { User } from '@/types';

type MutationOptions = {
  silent?: boolean;
};

const mapBackendGame = (gameData: any) => {
  if (!gameData || typeof gameData !== 'object') {
    return gameData;
  }

  const createdBy = gameData.createdBy && typeof gameData.createdBy === 'object' ? gameData.createdBy : null;
  const author = gameData.author || createdBy?.username || 'Unknown Developer';
  const thumbnail = typeof gameData.thumbnail === 'string' ? gameData.thumbnail : '';
  const downloadUrl = gameData.downloadUrl || gameData.fileUrl || null;

  return {
    ...gameData,
    id: gameData.id || gameData._id,
    author,
    thumbnail,
    downloadUrl,
  };
};

const mapBackendGames = (games: any): any[] => {
  if (!Array.isArray(games)) {
    return [];
  }

  return games.map(mapBackendGame);
};

const toSafeDate = (value: unknown, fallback: Date) => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return fallback;
};

const toSafeCount = (value: unknown, fallback: number) => {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
};

const mapBackendUserToStoreUser = (userData: any, fallbackUser: User | null): User => {
  const fallbackCreatedAt = fallbackUser?.createdAt ?? new Date();
  const createdAt = toSafeDate(userData?.createdAt, fallbackCreatedAt);
  const joinedDate = toSafeDate(userData?.createdAt ?? fallbackUser?.joinedDate, createdAt);
  const role = userData?.role === 'developer' || userData?.role === 'player'
    ? userData.role
    : (fallbackUser?.role ?? 'player');

  return {
    id: userData?._id || userData?.id || fallbackUser?.id || '',
    email: userData?.email || fallbackUser?.email || '',
    username: userData?.username || fallbackUser?.username || '',
    role,
    bio: userData?.bio ?? fallbackUser?.bio ?? '',
    avatar: userData?.avatar ?? fallbackUser?.avatar,
    socialLinks: userData?.socialLinks ?? fallbackUser?.socialLinks,
    joinedDate,
    gamesUploaded: toSafeCount(userData?.gamesUploaded, fallbackUser?.gamesUploaded ?? 0),
    assetsUploaded: toSafeCount(userData?.assetsUploaded, fallbackUser?.assetsUploaded ?? 0),
    jamsJoined: toSafeCount(userData?.jamsJoined, fallbackUser?.jamsJoined ?? 0),
    createdAt,
  };
};

// Auth Hook
export const useAuth = () => {
  const [loading, setLoading] = useState(false);

  const register = useCallback(async (username: string, email: string, password: string, role: string = 'player') => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/register', {
        username,
        email,
        password,
        role,
      });
      
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      toast.success('Registration successful!');
      return { token, user };
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      toast.success('Login successful!');
      return { token, user };
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { login, register, loading };
};

// Profile Hook
export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);

  const getProfile = useCallback(async (options?: { silent?: boolean }) => {
    setLoading(true);
    try {
      const response = await apiClient.get('/profile');
      const profileData = response.data.data;

      if (profileData) {
        setUser(mapBackendUserToStoreUser(profileData, user));
      }

      return profileData;
    } catch (error: any) {
      if (!options?.silent) {
        toast.error('Failed to fetch profile');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setUser, user]);

  const updateProfile = useCallback(async (updates: any) => {
    setLoading(true);
    try {
      const response = await apiClient.put('/profile', updates);
      const updatedProfile = response.data.data;

      if (updatedProfile) {
        setUser(mapBackendUserToStoreUser(updatedProfile, user));
      }

      toast.success('Profile updated!');
      return updatedProfile;
    } catch (error: any) {
      toast.error('Failed to update profile');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setUser, user]);

  const uploadAvatar = useCallback(async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await apiClient.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updatedProfile = response.data.data;
      if (updatedProfile) {
        setUser(mapBackendUserToStoreUser(updatedProfile, user));
      }
      
      toast.success('Avatar uploaded!');
      return updatedProfile;
    } catch (error: any) {
      toast.error('Failed to upload avatar');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setUser, user]);

  const upgradeToDeveloper = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/profile/upgrade-developer');
      const data = response.data.data;

      if (data?.user) {
        setUser(mapBackendUserToStoreUser(data.user, user));
      }

      if (data?.token) {
        localStorage.setItem('token', data.token);
      }

      toast.success('Account upgraded to developer!');
      return data;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to upgrade account');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setUser, user]);

  return { getProfile, updateProfile, uploadAvatar, upgradeToDeveloper, loading };
};

// Games Hook
export const useGames = () => {
  const [loading, setLoading] = useState(false);

  const getGames = useCallback(async (filters?: any) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters?.tags) params.append('tags', filters.tags.join(','));
      if (filters?.minPrice) params.append('minPrice', filters.minPrice);
      if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters?.search) params.append('search', filters.search);

      const response = await apiClient.get(`/games?${params.toString()}`);
      return mapBackendGames(response.data.data);
    } catch (error: any) {
      toast.error('Failed to fetch games');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserGames = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/games/my-games');
      return mapBackendGames(response.data.data);
    } catch (error: any) {
      toast.error('Failed to fetch your games');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getGameById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/games/${id}`);
      return mapBackendGame(response.data.data);
    } catch (error: any) {
      toast.error('Failed to fetch game');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createGame = useCallback(async (gameData: any, options?: MutationOptions) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/games', gameData);
      if (!options?.silent) {
        toast.success('Game created!');
      }
      return mapBackendGame(response.data.data);
    } catch (error: any) {
      if (!options?.silent) {
        toast.error('Failed to create game');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGame = useCallback(async (id: string, updates: any, options?: MutationOptions) => {
    setLoading(true);
    try {
      const response = await apiClient.put(`/games/${id}`, updates);
      if (!options?.silent) {
        toast.success('Game updated!');
      }
      return mapBackendGame(response.data.data);
    } catch (error: any) {
      if (!options?.silent) {
        toast.error('Failed to update game');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteGame = useCallback(async (id: string, options?: MutationOptions) => {
    setLoading(true);
    try {
      await apiClient.delete(`/games/${id}`);
      if (!options?.silent) {
        toast.success('Game deleted!');
      }
    } catch (error: any) {
      if (!options?.silent) {
        toast.error('Failed to delete game');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadGameFile = useCallback(async (gameId: string, file: File, options?: MutationOptions) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post(`/games/${gameId}/file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!options?.silent) {
        toast.success('Game file uploaded!');
      }

      const payload = response.data.data;
      const mappedGame = mapBackendGame(payload?.game || payload);
      if (payload?.game) {
        return {
          ...payload,
          game: mappedGame,
        };
      }

      return mappedGame;
    } catch (error: any) {
      if (!options?.silent) {
        toast.error('Failed to upload game file');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadGameThumbnail = useCallback(async (gameId: string, file: File, options?: MutationOptions) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('thumbnail', file);
      
      const response = await apiClient.post(`/games/${gameId}/thumbnail`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!options?.silent) {
        toast.success('Thumbnail uploaded!');
      }

      return mapBackendGame(response.data.data);
    } catch (error: any) {
      if (!options?.silent) {
        toast.error('Failed to upload thumbnail');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getGames,
    getUserGames,
    getGameById,
    createGame,
    updateGame,
    deleteGame,
    uploadGameFile,
    uploadGameThumbnail,
    loading,
  };
};

// Assets Hook
export const useAssets = () => {
  const [loading, setLoading] = useState(false);

  const getAssets = useCallback(async (filters?: any) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.tags) params.append('tags', filters.tags.join(','));
      if (filters?.minPrice) params.append('minPrice', filters.minPrice);
      if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters?.search) params.append('search', filters.search);

      const response = await apiClient.get(`/assets?${params.toString()}`);
      return response.data.data;
    } catch (error: any) {
      toast.error('Failed to fetch assets');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserAssets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/assets/my-assets');
      return response.data.data;
    } catch (error: any) {
      toast.error('Failed to fetch your assets');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAssetById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/assets/${id}`);
      return response.data.data;
    } catch (error: any) {
      toast.error('Failed to fetch asset');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createAsset = useCallback(async (assetData: any) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/assets', assetData);
      return response.data.data;
    } catch (error: any) {
      toast.error('Failed to create asset');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAsset = useCallback(async (id: string, updates: any) => {
    setLoading(true);
    try {
      const response = await apiClient.put(`/assets/${id}`, updates);
      toast.success('Asset updated!');
      return response.data.data;
    } catch (error: any) {
      toast.error('Failed to update asset');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAsset = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await apiClient.delete(`/assets/${id}`);
      toast.success('Asset deleted!');
    } catch (error: any) {
      toast.error('Failed to delete asset');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadAssetFile = useCallback(async (assetId: string, file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post(`/assets/${assetId}/file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      toast.success('Asset file uploaded!');
      return response.data.data;
    } catch (error: any) {
      toast.error('Failed to upload asset file');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadAssetThumbnail = useCallback(async (assetId: string, file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('thumbnail', file);

      const response = await apiClient.post(`/assets/${assetId}/thumbnail`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Asset thumbnail uploaded!');
      return response.data.data;
    } catch (error: unknown) {
      toast.error('Failed to upload asset thumbnail');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getAssets,
    getAllAssets: getAssets,
    getUserAssets,
    getAssetById,
    createAsset,
    updateAsset,
    deleteAsset,
    uploadAssetFile,
    uploadAssetThumbnail,
    loading,
  };
};

// Game Jams Hook
export const useGameJams = () => {
  const [loading, setLoading] = useState(false);

  const getJams = useCallback(async (filters?: any) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.ongoing) params.append('ongoing', 'true');

      const response = await apiClient.get(`/jams?${params.toString()}`);
      return response.data.data;
    } catch (error: any) {
      toast.error('Failed to fetch jams');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getJamById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/jams/${id}`);
      return response.data.data;
    } catch (error: any) {
      toast.error('Failed to fetch jam');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createJam = useCallback(async (jamData: any) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/jams', jamData);
      toast.success('Game jam created!');
      return response.data.data;
    } catch (error: any) {
      toast.error('Failed to create jam');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const joinJam = useCallback(async (jamId: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post(`/jams/${jamId}/join`);
      toast.success('Joined jam!');
      return response.data.data;
    } catch (error: any) {
      toast.error('Failed to join jam');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const leaveJam = useCallback(async (jamId: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post(`/jams/${jamId}/leave`);
      toast.success('Left jam!');
      return response.data.data;
    } catch (error: any) {
      toast.error('Failed to leave jam');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getJams,
    getAllGameJams: getJams,
    getJamById,
    getGameJamById: getJamById,
    createJam,
    createGameJam: createJam,
    joinJam,
    joinGameJam: joinJam,
    leaveJam,
    leaveGameJam: leaveJam,
    loading,
  };
};
