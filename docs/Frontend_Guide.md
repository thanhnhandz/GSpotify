# Frontend Architecture Guide

## Route Map

### Public Routes
```typescript
/login          → LoginForm component
/signup         → SignupForm component
```

### Protected Routes (Require Authentication)
```typescript
/               → Redirect to /dashboard
/dashboard      → Dashboard (user home)
/browse         → Browse (all approved songs)
/search         → Search (songs, artists, playlists)
/playlists      → Playlists (user's playlists)
/playlists/:id  → PlaylistDetail (view/edit playlist)
/liked-songs    → LikedSongs (user's liked songs)
/profile        → Profile (user settings)
/settings       → Settings (account settings)
```

### Artist Routes (Require `artist` or `admin` role)
```typescript
/artist/dashboard → ArtistDashboard (uploaded songs)
/artist/upload    → UploadSong (new song form)
```

### Admin Routes (Require `admin` role)
```typescript
/admin/dashboard → AdminDashboard (overview)
/admin/users     → ManageUsers (user management)
/admin/songs     → PendingSongs (approve/reject)
```

## Component Architecture

### Layout Structure
```
App.tsx
├── AuthRoute (login/signup pages)
└── ProtectedRoute
    ├── Sidebar (navigation)
    ├── MainContent (page content)
    └── MusicPlayer (global audio player)
```

### Key Components

#### Authentication
- **`LoginForm`** - User login with username/password
- **`SignupForm`** - User registration with role selection
- **`ProtectedRoute`** - Route guard with role checking

#### Layout
- **`Sidebar`** - Navigation menu with role-based items
- **`MusicPlayer`** - Global audio player with minimize/maximize

#### Pages
- **`Browse`** - Grid of approved songs with play buttons
- **`Search`** - Search input with filtered results
- **`PlaylistDetail`** - Playlist view with add/remove songs
- **`ArtistDashboard`** - Artist's uploaded songs with status
- **`AdminDashboard`** - Admin overview with quick actions

## State Management (Zustand)

### Auth Store
```typescript
// store/authStore.ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginData) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

// Usage
const { user, isAuthenticated, login, logout } = useAuthStore();
```

### Player Store
```typescript
// store/playerStore.ts
interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  volume: number;
  currentTime: number;
  duration: number;
  repeatMode: 'off' | 'one' | 'all';
  shuffleMode: boolean;
  isMinimized: boolean;
  
  playSong: (song: Song) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  nextSong: () => void;
  previousSong: () => void;
  setQueue: (songs: Song[]) => void;
  toggleMinimized: () => void;
}

// Usage
const { currentSong, isPlaying, playSong, setQueue } = usePlayerStore();
```

## Music Player Architecture

### Audio Element Management
```typescript
// MusicPlayer.tsx
const audioRef = useRef<HTMLAudioElement>(null);

// Source URL construction
const audioSrc = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/songs/${currentSong.id}/stream`;

// Event handlers
useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
  const handleLoadedMetadata = () => setDuration(audio.duration);
  const handleEnded = () => nextSong();

  audio.addEventListener('timeupdate', handleTimeUpdate);
  audio.addEventListener('loadedmetadata', handleLoadedMetadata);
  audio.addEventListener('ended', handleEnded);

  return () => {
    audio.removeEventListener('timeupdate', handleTimeUpdate);
    audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    audio.removeEventListener('ended', handleEnded);
  };
}, [currentSong]);
```

### Queue Management
```typescript
// Playing a single song
playSong(song);

// Playing with queue (e.g., playlist)
playSong(songs[0]);
setQueue(songs);

// Playing from specific position
playSong(songs[index]);
setQueue(songs.slice(index)); // Queue starts from clicked song
```

### Player States
- **Minimized**: Small player in bottom-right corner
- **Maximized**: Full-width player at bottom of screen
- **Hidden**: No current song playing

## API Integration

### Service Layer
```typescript
// services/api.ts - Base axios instance
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
});

// Auto-attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Specialized Services
```typescript
// services/authService.ts
export const authService = {
  login: (credentials) => api.post('/auth/login', formData),
  signup: (userData) => api.post('/auth/signup', userData),
  changePassword: (oldPass, newPass) => api.put('/auth/change-password', {...})
};

// services/musicService.ts
export const musicService = {
  getSongs: (limit = 100) => api.get(`/songs/?limit=${limit}`),
  searchSongs: (query) => api.get(`/search?q=${query}`),
  likeSong: (songId) => api.post(`/songs/${songId}/like`),
  unlikeSong: (songId) => api.delete(`/songs/${songId}/like`)
};
```

## Common Patterns

### Loading States
```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const loadData = async () => {
  try {
    setLoading(true);
    setError(null);
    const response = await api.get('/songs/');
    setSongs(response.data);
  } catch (err: any) {
    setError(err.response?.data?.detail || 'Failed to load');
  } finally {
    setLoading(false);
  }
};
```

### Error Handling
```typescript
// Global error interceptor (api.ts)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);
```

### Role-Based Rendering
```typescript
const { user } = useAuthStore();
const isAdmin = user?.role === 'admin';
const isArtist = user?.role === 'artist' || user?.role === 'admin';

return (
  <>
    {isArtist && <UploadSongButton />}
    {isAdmin && <AdminPanel />}
  </>
);
```

### Form Handling
```typescript
const [formData, setFormData] = useState({
  name: '',
  description: '',
  isPublic: true
});

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await api.post('/playlists', formData);
    toast.success('Playlist created!');
  } catch (error: any) {
    toast.error(error.response?.data?.detail || 'Failed to create');
  }
};
```

## Styling System

### CSS Variables (App.tsx)
```css
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-blur: blur(10px);
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --border-radius: 12px;
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);
}
```

### Styled Components Pattern
```typescript
const Container = styled.div`
  padding: var(--space-xl);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => 
    props.variant === 'primary' 
      ? 'var(--primary-gradient)' 
      : 'var(--glass-bg)'
  };
`;
```

## Performance Considerations

### Pagination
```typescript
// Always specify limits for large datasets
const loadSongs = () => api.get('/songs/?limit=100');

// Implement pagination for very large lists
const [currentPage, setCurrentPage] = useState(1);
const ITEMS_PER_PAGE = 20;
```

### Memoization
```typescript
// Expensive computations
const filteredSongs = useMemo(() => 
  songs.filter(song => song.title.includes(searchQuery)),
  [songs, searchQuery]
);

// Event handlers
const handlePlay = useCallback((song: Song) => {
  playSong(song);
}, [playSong]);
```

### Lazy Loading
```typescript
// Code splitting for admin routes
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <AdminDashboard />
</Suspense>
```

## Development Proxy

### setupProxy.js
```javascript
// Proxies API calls from frontend (port 3000) to backend (port 8000)
module.exports = function(app) {
  app.use('/api', createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
    pathRewrite: { '^/api': '' }
  }));
  
  // Direct routes for streaming
  app.use(['/songs', '/files'], createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true
  }));
};
```

**Note**: MusicPlayer bypasses proxy by using direct backend URL for audio streaming.
