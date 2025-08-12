# API Quick Reference

## Base URL
- **Development**: `http://localhost:8000`
- **API Docs**: `http://localhost:8000/docs`

## Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <jwt_token>
```

## Key Endpoints

### Authentication
```bash
# Signup
POST /auth/signup
{
  "username": "john_doe",
  "email": "john@example.com", 
  "password": "password123",
  "role": "user"  # Optional: "user" | "artist"
}

# Login  
POST /auth/login
Content-Type: application/x-www-form-urlencoded
username=john_doe&password=password123

# Change Password
POST /auth/change-password
{
  "old_password": "oldpass",
  "new_password": "newpass"
}
```

### Songs (Public)
```bash
# List approved songs (public)
GET /songs/?skip=0&limit=100&genre_id=1&artist_id=2

# Get single song
GET /songs/{song_id}

# Stream song (redirects to file)
GET /songs/{song_id}/stream
# → Redirects to /files/songs/{filename}

# Like/Unlike song (requires auth)
POST /songs/{song_id}/like
DELETE /songs/{song_id}/like
```

### Songs (Artist Only)
```bash
# Upload song (multipart/form-data)
POST /artist/songs
title=Song Title&genre_id=1&album_id=2&file=<audio_file>

# List artist's own songs (all statuses)
GET /artist/songs?skip=0&limit=100

# Delete own song
DELETE /artist/songs/{song_id}
```

### Admin Endpoints
```bash
# List all users
GET /admin/users?skip=0&limit=50

# Toggle user active status
PUT /admin/users/{user_id}/toggle-status

# Change user role
PUT /admin/users/{user_id}/role
{
  "role": "admin" | "artist" | "user"
}

# List pending songs
GET /admin/songs/pending?skip=0&limit=100

# Approve/Reject songs
POST /admin/songs/{song_id}/approve
POST /admin/songs/{song_id}/reject
```

### Playlists
```bash
# List user's playlists
GET /playlists?skip=0&limit=20

# Create playlist
POST /playlists
{
  "name": "My Playlist",
  "description": "Description",
  "is_public": true
}

# Get playlist details
GET /playlists/{playlist_id}

# Update playlist
PUT /playlists/{playlist_id}
{
  "name": "Updated Name",
  "description": "New description",
  "is_public": false
}

# Delete playlist
DELETE /playlists/{playlist_id}

# Get playlist songs
GET /playlists/{playlist_id}/songs

# Add song to playlist
POST /playlists/{playlist_id}/songs
{
  "song_id": 123
}

# Remove song from playlist
DELETE /playlists/{playlist_id}/songs/{song_id}
```

### Search
```bash
# Search everything
GET /search?q=query&type=all&skip=0&limit=20

# Search specific type
GET /search?q=query&type=song
GET /search?q=query&type=artist
```

### User Profile
```bash
# Get current user
GET /users/me

# Update profile
PUT /users/me
{
  "email": "new@example.com"
}

# Get liked songs
GET /users/me/liked-songs?skip=0&limit=50

# Delete account
DELETE /users/me
```

### File Streaming
```bash
# Stream audio file (supports range requests)
GET /files/songs/{filename}

# Get cover image
GET /files/covers/{filename}
```

## Response Formats

### Success Response
```json
{
  "id": 1,
  "title": "Song Title",
  "artist_name": "Artist Name",
  "duration": 180,
  "status": "approved"
}
```

### Error Response
```json
{
  "detail": "Error message",
  "type": "validation_error"  // Optional
}
```

### Paginated Response
```json
{
  "items": [...],
  "total": 100,
  "skip": 0,
  "limit": 20
}
```

## Status Codes

### Success
- `200` - OK
- `201` - Created
- `204` - No Content

### Client Errors
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)

### Server Errors
- `500` - Internal Server Error

## Pagination Defaults

**Important**: Many endpoints have default limits that may be too small.

### Default Limits
- `/songs/` → **limit=10** (often too small!)
- `/playlists/` → limit=20
- `/admin/users/` → limit=50
- `/admin/songs/pending/` → limit=100
- `/search/` → limit=20

### Recommended Usage
```bash
# Always specify larger limits for browsing
GET /songs/?limit=100

# Use pagination for large datasets
GET /admin/users?skip=50&limit=50
```

## Common Patterns

### File Upload (Multipart)
```javascript
const formData = new FormData();
formData.append('title', 'Song Title');
formData.append('genre_id', '1');
formData.append('file', audioFile);

fetch('/artist/songs', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Streaming URL Construction
```javascript
// Frontend audio element
const audioSrc = `${API_BASE_URL}/songs/${songId}/stream`;

// This redirects to: /files/songs/{uuid}.mp3
```

### Error Handling
```javascript
try {
  const response = await api.get('/songs/');
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
  } else if (error.response?.status === 403) {
    // Show permission error
  }
  console.error(error.response?.data?.detail);
}
```

## Rate Limiting
Currently no rate limiting implemented. Consider adding for production:
- Login attempts: 5/minute
- File uploads: 10/hour per user
- Search requests: 100/minute
