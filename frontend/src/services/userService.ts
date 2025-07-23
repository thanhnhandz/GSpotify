import api from './api';
import { User, Song, Playlist } from '../types';

export const userService = {
  async getCurrentUserProfile(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data;
  },

  async updateProfile(data: { email?: string; full_name?: string }): Promise<User> {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  async getMyPlaylists(params?: { skip?: number; limit?: number }): Promise<Playlist[]> {
    const response = await api.get('/users/me/playlists', { params });
    return response.data;
  },

  async getLikedSongs(params?: { skip?: number; limit?: number }): Promise<Song[]> {
    const response = await api.get('/users/me/liked-songs', { params });
    return response.data;
  },
}; 