# Troubleshooting Guide

## Common Issues & Solutions

### 1. Login Success But Stuck at Login Page

**Symptoms**: User sees "Login successful" but page doesn't redirect

**Cause**: Problematic nested Routes or authentication state issues

**Solution**:
```typescript
// Check App.tsx routing structure
// Ensure no nested <Routes> with wildcard paths
<Routes>
  <Route path="/login" element={<LoginForm />} />
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  // NOT: <Route path="/*" element={<Routes>...</Routes>} />
</Routes>

// Verify auth store state
const { isAuthenticated } = useAuthStore(); // Should be boolean, not function
```

### 2. Songs Not Loading / Only 10 Songs Showing

**Symptoms**: Browse page shows limited songs, missing recent uploads

**Root Cause**: Backend `/songs/` endpoint defaults to `limit=10`

**Solution**:
```typescript
// Frontend: Always specify larger limits
api.get('/songs/?limit=100')  // ✅ Correct
api.get('/songs')             // ❌ Only gets 10 songs

// Files to update:
// - frontend/src/pages/Browse.tsx
// - frontend/src/components/OptimizedBrowse.tsx  
// - frontend/src/services/musicService.ts
```

### 3. Music Player "Failed to Load" Error

**Symptoms**: Audio element shows "Failed to load because no supported source was found"

**Root Cause**: Frontend proxy not handling audio streaming correctly

**Solution**:
```typescript
// MusicPlayer should use direct backend URL, not proxy
const audioSrc = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/songs/${currentSong.id}/stream`;

// NOT: src={`/songs/${currentSong.id}/stream`} (relies on proxy)
```

**Verification**:
```bash
# Test streaming endpoint directly
curl -v "http://localhost:8000/songs/12/stream"
# Should return 307 redirect to /files/songs/{filename}

curl -v "http://localhost:8000/files/songs/{filename}"  
# Should return audio data
```

### 4. Search Returns "Not Found" for Existing Songs

**Symptoms**: Search shows no results for songs that exist in Browse

**Root Cause**: Frontend parsing wrong response structure

**Backend Returns**:
```json
{
  "songs": [...],
  "artists": [...], 
  "playlists": [...]
}
```

**Frontend Fix**:
```typescript
// Wrong
setSongs(response.data);

// Correct  
setSongs(response.data.songs);
```

### 5. Playlist Delete Fails

**Symptoms**: "Failed to delete playlist" error

**Root Cause**: Foreign key constraint from `playlist_songs` table

**Backend Fix**:
```python
# Delete playlist_songs first, then playlist
db.query(PlaylistSong).filter(PlaylistSong.playlist_id == playlist_id).delete()
db.delete(playlist)
db.commit()
```

### 6. 401 Unauthorized Errors

**Symptoms**: API calls return 401 even with valid login

**Common Causes**:
- Expired JWT token (30min default)
- Missing Authorization header
- Token stored incorrectly

**Debug Steps**:
```typescript
// Check token storage
const token = localStorage.getItem('access_token');
console.log('Token:', token);

// Verify token format
// Should be: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."

// Check API interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 7. Artist Upload Shows as User Role

**Symptoms**: User selects "artist" during signup but has "user" role

**Root Cause**: Backend not properly handling role assignment

**Solution**:
```python
# app/routers/auth.py - signup endpoint
user_data = UserSignup(**user_dict)
new_user = User(
    username=user_data.username,
    email=user_data.email,
    hashed_password=hashed_password,
    role=user_data.role or UserRole.USER  # Ensure role is set
)
```

### 8. File Upload 413 Entity Too Large

**Symptoms**: Large audio files fail to upload

**Solutions**:
```python
# FastAPI: Increase file size limit
from fastapi import FastAPI, File, UploadFile

@app.post("/upload")
async def upload_file(file: UploadFile = File(..., max_size=50_000_000)):  # 50MB
    pass
```

```nginx
# Nginx: Increase client_max_body_size
client_max_body_size 50M;
```

### 9. CORS Errors in Production

**Symptoms**: Frontend can't connect to backend API

**Solution**:
```python
# app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 10. Database Connection Errors

**Symptoms**: "could not connect to server" errors

**Debug Steps**:
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Test connection
psql -h localhost -U username -d gspotify

# Verify DATABASE_URL format
DATABASE_URL=postgresql://user:password@localhost:5432/gspotify
```

## Development Environment Issues

### Backend Won't Start

**Check List**:
```bash
# 1. Virtual environment activated?
source venv/bin/activate

# 2. Dependencies installed?
pip install -r requirements.txt

# 3. Environment variables set?
cp env.example .env
# Edit .env with correct values

# 4. Database migrations run?
alembic upgrade head

# 5. Port 8000 available?
lsof -i :8000
```

### Frontend Won't Start

**Check List**:
```bash
# 1. Node modules installed?
cd frontend && npm install

# 2. Node version compatible?
node --version  # Should be 16+

# 3. Port 3000 available?
lsof -i :3000

# 4. Proxy configuration correct?
# Check frontend/src/setupProxy.js
```

### Hot Reload Not Working

**Solutions**:
```bash
# Backend: Use --reload flag
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend: Check package.json
"scripts": {
  "start": "react-scripts start"
}

# Clear cache if needed
npm start -- --reset-cache
```

## Performance Issues

### Slow Page Loading

**Common Causes**:
- Large API responses without pagination
- Missing database indexes
- Unoptimized images

**Solutions**:
```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_songs_status ON songs(status);
CREATE INDEX idx_songs_artist_id ON songs(artist_id);

-- Use pagination
SELECT * FROM songs WHERE status = 'approved' 
ORDER BY created_at DESC 
LIMIT 20 OFFSET 0;
```

### Audio Streaming Issues

**Debug Steps**:
```bash
# 1. Check file exists
ls -la uploads/songs/

# 2. Test direct file access
curl -I "http://localhost:8000/files/songs/filename.mp3"

# 3. Check file permissions
chmod 644 uploads/songs/*.mp3

# 4. Verify MIME type
file --mime-type uploads/songs/filename.mp3
# Should be: audio/mpeg
```

## Production Deployment Issues

### Environment Variables

**Common Mistakes**:
```bash
# Wrong: Using development URLs in production
REACT_APP_API_URL=http://localhost:8000

# Correct: Use production URLs
REACT_APP_API_URL=https://api.yourdomain.com
```

### Static File Serving

**Nginx Configuration**:
```nginx
# Serve uploaded files
location /files/ {
    alias /path/to/uploads/;
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Proxy API requests
location /api/ {
    proxy_pass http://localhost:8000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Debugging Tools

### Backend Debugging
```python
# Add logging
import logging
logging.basicConfig(level=logging.DEBUG)

# SQLAlchemy query logging
# Set in database.py
engine = create_engine(DATABASE_URL, echo=True)
```

### Frontend Debugging
```typescript
// Network tab: Check API requests/responses
// Console: Check for JavaScript errors
// React DevTools: Inspect component state

// Add debug logging
console.log('Auth state:', useAuthStore.getState());
console.log('Player state:', usePlayerStore.getState());
```

### Database Debugging
```sql
-- Check data integrity
SELECT COUNT(*) FROM songs WHERE status = 'approved';
SELECT COUNT(*) FROM playlist_songs;

-- Find orphaned records
SELECT * FROM playlist_songs ps 
LEFT JOIN songs s ON ps.song_id = s.id 
WHERE s.id IS NULL;
```

## Getting Help

### Log Files to Check
- **Backend**: Console output from uvicorn
- **Frontend**: Browser console (F12)
- **Database**: PostgreSQL logs
- **Nginx**: `/var/log/nginx/error.log`

### Useful Commands
```bash
# Backend health check
curl http://localhost:8000/docs

# Database connection test  
python -c "from app.database import engine; print(engine.execute('SELECT 1').scalar())"

# Frontend build test
cd frontend && npm run build
```
