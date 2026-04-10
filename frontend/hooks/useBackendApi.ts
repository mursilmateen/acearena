import { useState, useCallback } from 'react';
import apiClient from '@/lib/api';
import { toast } from 'sonner';

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

  const getProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/profile');
      return response.data.data;
    } catch (error: any) {
      toast.error('Failed to fetch profile');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: any) => {
    setLoading(true);
    try {
      const response = await apiClient.put('/profile', updates);
      toast.success('Profile updated!');
      return response.data.data;
    } catch (error: any) {
      toast.error('Failed to update profile');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadAvatar = useCallback(async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await apiClient.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      toast.success('Avatar uploaded!');
      return response.data.data;
    } catch (error: any) {
      toast.error('Failed to upload avatar');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getProfile, updateProfile, uploadAvatar, loading };
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
      return response.data.data;
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
      return response.data.data;
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
      return response.data.data;
    } catch (error: any) {
      toast.error('Failed to fetch game');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createGame = useCallback(async (gameData: any) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/games', gameData);
      toast.success('Game created!');
      return response.data.data;
    } catch (error: any) {
      toast.error('Failed to create game');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGame = useCallback(async (id: string, updates: any) => {
    setLoading(true);
    try {
      const response = await apiClient.put(`/games/${id}`, updates);
      toast.success('Game updated!');
      return response.data.data;
    } catch (error: any) {
      toast.error('Failed to update game');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteGame = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await apiClient.delete(`/games/${id}`);
      toast.success('Game deleted!');
    } catch (error: any) {
      toast.error('Failed to delete game');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadGameFile = useCallback(async (gameId: string, file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post(`/games/${gameId}/file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      toast.success('Game file uploaded!');
      return response.data.data;
    } catch (error: any) {
      toast.error('Failed to upload game file');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadGameThumbnail = useCallback(async (gameId: string, file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('thumbnail', file);
      
      const response = await apiClient.post(`/games/${gameId}/thumbnail`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      toast.success('Thumbnail uploaded!');
      return response.data.data;
    } catch (error: any) {
      toast.error('Failed to upload thumbnail');
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
      toast.success('Asset created!');
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

  return {
    getAssets,
    getAllAssets: getAssets,
    getUserAssets,
    getAssetById,
    createAsset,
    updateAsset,
    deleteAsset,
    uploadAssetFile,
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
