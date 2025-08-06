import api from './api';
import { Song, User, Genre, AdminStats } from '../types';

export const adminService = {
  async getPendingSongs(): Promise<Song[]> {
    const response = await api.get('/admin/songs/pending');
    return response.data;
  },

  async approveSong(songId: number): Promise<{ message: string; song: Song }> {
    const response = await api.post(`/admin/songs/${songId}/approve`);
    return response.data;
  },

  async rejectSong(songId: number, reason: string): Promise<{ message: string; song: Song }> {
    const response = await api.post(`/admin/songs/${songId}/reject`, { reason });
    return response.data;
  },

  async createGenre(data: { name: string; description?: string }): Promise<Genre> {
    const response = await api.post('/admin/genres', data);
    return response.data;
  },

  async getDashboardStats(): Promise<AdminStats> {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  async changeUserRole(userId: number, role: 'user' | 'artist' | 'admin'): Promise<{ message: string; user: User }> {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },
}; 