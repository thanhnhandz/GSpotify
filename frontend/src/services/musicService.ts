import api from './api';
import { Song, PaginatedResponse, Playlist, Comment, Genre, Artist } from '../types';

export const musicService = {
  // Songs
  async getSongs(params?: {
    page?: number;
    size?: number;
    genre_id?: number;
    artist_id?: number;
  }): Promise<Song[]> {
    // Default to higher limit to show all songs
    const queryParams = { limit: 100, ...params };
    const response = await api.get('/songs/', { params: queryParams });
    return response.data;
  },

  async getSong(id: number): Promise<Song> {
    const response = await api.get(`/songs/${id}`);
    return response.data;
  },

  async streamSong(id: number): Promise<{ stream_url: string; expires_in: number }> {
    const response = await api.get(`/songs/${id}/stream`);
    return response.data;
  },

  async likeSong(id: number): Promise<{ message: string; is_liked: boolean; like_count: number }> {
    const response = await api.post(`/songs/${id}/like`);
    return response.data;
  },

  async unlikeSong(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/songs/${id}/like`);
    return response.data;
  },

  async getSongLyrics(id: number): Promise<{ song_id: number; song_title: string; lyrics: string }> {
    const response = await api.get(`/songs/${id}/lyrics`);
    return response.data;
  },

  async getSongComments(id: number, params?: { page?: number; size?: number }): Promise<PaginatedResponse<Comment>> {
    const response = await api.get(`/songs/${id}/comments`, { params });
    return response.data;
  },

  async addComment(songId: number, content: string): Promise<Comment> {
    const response = await api.post(`/songs/${songId}/comments`, { content });
    return response.data;
  },

  // Playlists
  async getPlaylists(params?: { page?: number; size?: number }): Promise<PaginatedResponse<Playlist>> {
    const response = await api.get('/playlists', { params });
    return response.data;
  },

  async getPlaylist(id: number): Promise<Playlist> {
    const response = await api.get(`/playlists/${id}`);
    return response.data;
  },

  async createPlaylist(data: { name: string; description?: string; is_public: boolean }): Promise<Playlist> {
    const response = await api.post('/playlists', data);
    return response.data;
  },

  async updatePlaylist(id: number, data: { name?: string; description?: string; is_public?: boolean }): Promise<Playlist> {
    const response = await api.put(`/playlists/${id}`, data);
    return response.data;
  },

  async deletePlaylist(id: number): Promise<void> {
    await api.delete(`/playlists/${id}`);
  },

  async addSongToPlaylist(playlistId: number, songId: number): Promise<{ message: string }> {
    const response = await api.post(`/playlists/${playlistId}/songs`, { song_id: songId });
    return response.data;
  },

  async removeSongFromPlaylist(playlistId: number, songId: number): Promise<{ message: string }> {
    const response = await api.delete(`/playlists/${playlistId}/songs/${songId}`);
    return response.data;
  },

  // Genres
  async getGenres(): Promise<Genre[]> {
    const response = await api.get('/genres');
    return response.data;
  },

  // Artists
  async getArtists(): Promise<Artist[]> {
    const response = await api.get('/artists');
    return response.data;
  },

  // Search
  async search(query: string, type?: string, params?: { page?: number; size?: number }): Promise<any> {
    const response = await api.get('/search', {
      params: { q: query, type, ...params }
    });
    return response.data;
  },
}; 