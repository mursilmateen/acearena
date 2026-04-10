import { AxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { Game } from '@/types';
import apiClient from '@/lib/api';

export const useGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/games', { params: filters });
      const data = response.data?.data || [];
      setGames(data);
      return data;
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGameById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/games/${id}`);
      return response.data?.data || null;
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { games, loading, error, fetchGames, fetchGameById };
};

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data?.data || null;
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.post('/auth/register', {
          email,
          username,
          password,
        });
        return response.data?.data || null;
      } catch (err) {
        const axiosError = err as AxiosError;
        setError(axiosError.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, error, login, register };
};

export const useUploadGame = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const uploadGame = useCallback(async (formData: FormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const gameId = formData.get('gameId');
      if (typeof gameId !== 'string' || !gameId.trim()) {
        throw new Error('FormData must include a valid gameId field');
      }

      const response = await apiClient.post(`/games/${gameId}/file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(true);
      return response.data?.data || null;
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, success, uploadGame };
};
