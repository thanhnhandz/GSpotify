# Data Model & Relationships

## Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│    User     │       │    Song      │       │   Genre     │
│─────────────│       │──────────────│       │─────────────│
│ id (PK)     │◄──────│ artist_id    │──────►│ id (PK)     │
│ username    │       │ genre_id     │       │ name        │
│ email       │       │ album_id     │       │ description │
│ password    │       │ title        │       └─────────────┘
│ role        │       │ duration     │              
│ is_active   │       │ file_url     │       ┌─────────────┐
│ created_at  │       │ status       │       │   Album     │
└─────────────┘       │ play_count   │       │─────────────│
       │               │ created_at   │       │ id (PK)     │
       │               └──────────────┘       │ title       │
       │                      │               │ artist_id   │
       │                      │               │ cover_url   │
       │               ┌──────────────┐       │ created_at  │
       │               │  LikedSong   │       └─────────────┘
       │               │──────────────│              │
       └───────────────│ user_id      │              │
                       │ song_id      │◄─────────────┘
                       │ created_at   │
                       └──────────────┘
                              │
       ┌─────────────┐        │        ┌──────────────┐
       │  Playlist   │        │        │ PlaylistSong │
       │─────────────│        │        │──────────────│
       │ id (PK)     │◄───────┼────────│ playlist_id  │
       │ name        │        │        │ song_id      │
       │ owner_id    │        └───────►│ added_at     │
       │ description │                 └──────────────┘
       │ is_public   │
       │ created_at  │
       └─────────────┘
              │
       ┌──────────────┐
       │   Lyrics     │
       │──────────────│
       │ id (PK)      │
       │ song_id      │
       │ content      │
       │ created_at   │
       └──────────────┘
```

## Core Entities

### User
**Purpose**: System users with role-based permissions

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR UNIQUE NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    role user_role DEFAULT 'user' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    agreed_to_terms BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Roles**: `user`, `artist`, `admin`

### Song
**Purpose**: Music tracks with approval workflow

```sql
CREATE TABLE songs (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    artist_id INTEGER REFERENCES users(id) NOT NULL,
    album_id INTEGER REFERENCES albums(id),
    genre_id INTEGER REFERENCES genres(id) NOT NULL,
    duration_seconds INTEGER NOT NULL,
    file_url VARCHAR NOT NULL,
    status song_status DEFAULT 'pending_approval' NOT NULL,
    release_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    play_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Statuses**: `pending_approval`, `approved`, `rejected`

### Album
**Purpose**: Song collections by artists

```sql
CREATE TABLE albums (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    artist_id INTEGER REFERENCES users(id) NOT NULL,
    cover_art_url VARCHAR,
    release_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Genre
**Purpose**: Music categorization

```sql
CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL,
    description TEXT
);
```

### Playlist
**Purpose**: User-created song collections

```sql
CREATE TABLE playlists (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    owner_id INTEGER REFERENCES users(id) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Relationship Tables

### PlaylistSong
**Purpose**: Many-to-many between playlists and songs

```sql
CREATE TABLE playlist_songs (
    id SERIAL PRIMARY KEY,
    playlist_id INTEGER REFERENCES playlists(id) NOT NULL,
    song_id INTEGER REFERENCES songs(id) NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(playlist_id, song_id)
);
```

### LikedSong
**Purpose**: User's liked songs

```sql
CREATE TABLE liked_songs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    song_id INTEGER REFERENCES songs(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, song_id)
);
```

### Lyrics
**Purpose**: Song lyrics (one-to-one with songs)

```sql
CREATE TABLE lyrics (
    id SERIAL PRIMARY KEY,
    song_id INTEGER REFERENCES songs(id) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Key Relationships

### One-to-Many
- **User → Songs** (artist_id): Artist owns multiple songs
- **User → Albums** (artist_id): Artist owns multiple albums  
- **User → Playlists** (owner_id): User owns multiple playlists
- **Album → Songs** (album_id): Album contains multiple songs
- **Genre → Songs** (genre_id): Genre categorizes multiple songs

### Many-to-Many
- **Playlist ↔ Song** (via PlaylistSong): Playlists contain multiple songs, songs can be in multiple playlists
- **User ↔ Song** (via LikedSong): Users can like multiple songs, songs can be liked by multiple users

### One-to-One
- **Song → Lyrics** (song_id): Each song has at most one lyrics record

## Cascade Behavior

### Delete User
- **Songs**: Set artist_id to NULL or prevent deletion
- **Albums**: Set artist_id to NULL or prevent deletion
- **Playlists**: CASCADE delete (user's playlists removed)
- **LikedSongs**: CASCADE delete (user's likes removed)

### Delete Song
- **PlaylistSongs**: CASCADE delete (removed from all playlists)
- **LikedSongs**: CASCADE delete (removed from all likes)
- **Lyrics**: CASCADE delete (lyrics removed)

### Delete Playlist
- **PlaylistSongs**: CASCADE delete (all song associations removed)

## Indexes

### Performance Indexes
```sql
-- Frequently queried fields
CREATE INDEX idx_songs_artist_id ON songs(artist_id);
CREATE INDEX idx_songs_genre_id ON songs(genre_id);
CREATE INDEX idx_songs_status ON songs(status);
CREATE INDEX idx_songs_title ON songs(title);

-- Relationship lookups
CREATE INDEX idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
CREATE INDEX idx_playlist_songs_song_id ON playlist_songs(song_id);
CREATE INDEX idx_liked_songs_user_id ON liked_songs(user_id);

-- Search optimization
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_playlists_owner_id ON playlists(owner_id);
```

## Common Queries

### Get User's Playlists with Song Count
```sql
SELECT p.*, COUNT(ps.song_id) as song_count
FROM playlists p
LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
WHERE p.owner_id = ?
GROUP BY p.id;
```

### Get Approved Songs with Artist Info
```sql
SELECT s.*, u.username as artist_name, g.name as genre_name
FROM songs s
JOIN users u ON s.artist_id = u.id
JOIN genres g ON s.genre_id = g.id
WHERE s.status = 'approved'
ORDER BY s.created_at DESC;
```

### Get Playlist Songs
```sql
SELECT s.*, u.username as artist_name
FROM songs s
JOIN playlist_songs ps ON s.id = ps.song_id
JOIN users u ON s.artist_id = u.id
WHERE ps.playlist_id = ?
ORDER BY ps.added_at;
```

### Search Songs and Artists
```sql
-- Songs
SELECT s.*, u.username as artist_name
FROM songs s
JOIN users u ON s.artist_id = u.id
WHERE s.status = 'approved' 
  AND (s.title ILIKE '%query%' OR u.username ILIKE '%query%');

-- Artists
SELECT DISTINCT u.*
FROM users u
JOIN songs s ON u.id = s.artist_id
WHERE u.role IN ('artist', 'admin')
  AND u.username ILIKE '%query%'
  AND s.status = 'approved';
```

## Data Constraints

### Business Rules
- Only `artist` and `admin` roles can upload songs
- Only `admin` can approve/reject songs
- Users can only delete their own playlists
- Artists can only delete their own songs
- Songs must have valid audio file extensions
- Playlist names must be unique per user

### File Storage
- **Audio files**: `uploads/songs/{uuid}.mp3`
- **Cover images**: `uploads/covers/{uuid}.jpg`
- **File naming**: UUID to prevent conflicts
- **Validation**: File type and size limits enforced
