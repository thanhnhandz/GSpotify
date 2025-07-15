export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  role: 'user' | 'artist' | 'admin';
  is_active: boolean;
  created_at: string;
  total_playlists?: number;
  total_liked_songs?: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Song {
  id: number;
  title: string;
  artist_id: number;
  album_id?: number;
  genre_id: number;
  duration_seconds: number;
  file_url: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  release_date?: string;
  play_count: number;
  created_at: string;
  // Populated relationships
  artist?: User;
  genre?: Genre;
  album?: Album;
  // Legacy fields for backward compatibility
  artist_name?: string;
  album_name?: string;
  genre_name?: string;
  duration?: number;
  cover_image_url?: string;
  like_count?: number;
  is_liked?: boolean;
  lyrics?: string;
}

export interface Album {
  id: number;
  title: string;
  artist_id: number;
  cover_art_url?: string;
  release_date?: string;
  created_at: string;
  artist?: User;
}

export interface Playlist {
  id: number;
  name: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  owner_name: string;
  song_count: number;
  songs?: Song[];
}

export interface Artist {
  id: number;
  username: string;
  full_name: string;
  role: 'artist';
  bio?: string;
  website?: string;
  social_links?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  total_songs: number;
  total_albums: number;
  total_followers: number;
}

export interface Comment {
  id: number;
  content: string;
  user_name: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  full_name?: string;
  role?: 'user' | 'artist';
  agreed_to_terms: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface SearchResults {
  query: string;
  type?: string;
  results: {
    songs: Song[];
    artists: Artist[];
    albums: Album[];
    playlists: Playlist[];
  };
  total: number;
  page: number;
  size: number;
}

export interface ArtistStats {
  total_songs: number;
  total_albums: number;
  total_plays: number;
  total_likes: number;
  total_comments: number;
  pending_songs: number;
  approved_songs: number;
  rejected_songs: number;
  monthly_plays: Array<{
    month: string;
    plays: number;
  }>;
}

export interface AdminStats {
  total_users: number;
  total_artists: number;
  total_songs: number;
  total_albums: number;
  total_playlists: number;
  total_plays: number;
  pending_songs: number;
  recent_signups: number;
  active_users_today: number;
  top_genres: Array<{
    name: string;
    song_count: number;
  }>;
} 