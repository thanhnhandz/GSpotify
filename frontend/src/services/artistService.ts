import api from './api';
import { Song, Album, ArtistStats } from '../types';

export const artistService = {
  async getArtistSongs(artistId: number): Promise<Song[]> {
    const response = await api.get(`/songs/?artist_id=${artistId}`);
    return response.data;
  },

  async createAlbum(data: {
    title: string;
    description?: string;
    release_date: string;
    genre_id: number;
  }): Promise<Album> {
    const response = await api.post('/artist/albums', data);
    return response.data;
  },

  async getDashboardStats(): Promise<ArtistStats> {
    const response = await api.get('/artist/dashboard/stats');
    return response.data;
  },

  async uploadSong(formData: FormData): Promise<{
    id: number;
    title: string;
    status: string;
    upload_url: string;
    message: string;
  }> {
    const response = await api.post('/artist/songs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
}; 