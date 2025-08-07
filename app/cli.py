import asyncio
import sys
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.user import User, UserRole
from app.models.genre import Genre
from app.models.song import Song, SongStatus
from app.models.album import Album
from app.models.playlist import Playlist, PlaylistSong
from app.auth import get_password_hash
from app.database import Base

def create_admin_user():
    """Create the first admin user"""
    print("Creating first admin user...")
    
    username = input("Enter admin username: ")
    email = input("Enter admin email: ")
    password = input("Enter admin password: ")
    
    if not username or not email or not password:
        print("All fields are required!")
        return
    
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if existing_admin:
            print(f"Admin user already exists: {existing_admin.username}")
            return
        
        # Check if username/email already exists
        existing_user = db.query(User).filter(
            (User.username == username) | (User.email == email)
        ).first()
        
        if existing_user:
            print("Username or email already exists!")
            return
        
        # Create admin user
        admin_user = User(
            username=username,
            email=email,
            hashed_password=get_password_hash(password),
            role=UserRole.ADMIN,
            agreed_to_terms=True
        )
        
        db.add(admin_user)
        db.commit()
        
        print(f"Admin user '{username}' created successfully!")
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

def init_db():
    """Initialize database tables"""
    print("Initializing database...")
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully!")
    except Exception as e:
        print(f"Error initializing database: {e}")

def create_sample_genres():
    """Create sample music genres"""
    print("Creating sample genres...")
    
    genre_names = [
        "Rock", "Pop", "Hip-Hop", "Electronic", "Jazz", "Classical", 
        "Country", "R&B", "Reggae", "Folk"
    ]
    
    db = SessionLocal()
    try:
        for genre_name in genre_names:
            existing_genre = db.query(Genre).filter(Genre.name == genre_name).first()
            if not existing_genre:
                genre = Genre(name=genre_name)
                db.add(genre)
        
        db.commit()
        print(f"Created {len(genre_names)} genres successfully!")
        
    except Exception as e:
        print(f"Error creating genres: {e}")
        db.rollback()
    finally:
        db.close()

def create_sample_artists():
    """Create sample artist accounts"""
    print("Creating sample artists...")
    
    artists_data = [
        {"username": "queen_band", "email": "queen@music.com", "password": "queenpass123"},
        {"username": "beatles_official", "email": "beatles@music.com", "password": "beatlespass123"},
        {"username": "drake_artist", "email": "drake@music.com", "password": "drakepass123"},
        {"username": "taylor_swift", "email": "taylor@music.com", "password": "taylorpass123"},
        {"username": "ed_sheeran", "email": "ed@music.com", "password": "edpass123"},
    ]
    
    db = SessionLocal()
    try:
        created_count = 0
        for artist_data in artists_data:
            existing_user = db.query(User).filter(User.username == artist_data["username"]).first()
            if not existing_user:
                user = User(
                    username=artist_data["username"],
                    email=artist_data["email"],
                    hashed_password=get_password_hash(artist_data["password"]),
                    role=UserRole.ARTIST,
                    agreed_to_terms=True
                )
                db.add(user)
                created_count += 1
        
        db.commit()
        print(f"Created {created_count} artist accounts successfully!")
        
    except Exception as e:
        print(f"Error creating artists: {e}")
        db.rollback()
    finally:
        db.close()

def create_sample_albums():
    """Create sample albums"""
    print("Creating sample albums...")
    
    db = SessionLocal()
    try:
        # Get artists and genres
        queen = db.query(User).filter(User.username == "queen_band").first()
        beatles = db.query(User).filter(User.username == "beatles_official").first()
        drake = db.query(User).filter(User.username == "drake_artist").first()
        
        rock_genre = db.query(Genre).filter(Genre.name == "Rock").first()
        pop_genre = db.query(Genre).filter(Genre.name == "Pop").first()
        hiphop_genre = db.query(Genre).filter(Genre.name == "Hip-Hop").first()
        
        if not all([queen, beatles, drake, rock_genre, pop_genre, hiphop_genre]):
            print("Missing required artists or genres!")
            return
        
        albums_data = [
            {"title": "A Night at the Opera", "artist_id": queen.id, "genre_id": rock_genre.id, "description": "Queen's fourth studio album"},
            {"title": "Abbey Road", "artist_id": beatles.id, "genre_id": rock_genre.id, "description": "The Beatles' eleventh studio album"},
            {"title": "Scorpion", "artist_id": drake.id, "genre_id": hiphop_genre.id, "description": "Drake's fifth studio album"},
        ]
        
        created_count = 0
        for album_data in albums_data:
            existing_album = db.query(Album).filter(
                Album.title == album_data["title"],
                Album.artist_id == album_data["artist_id"]
            ).first()
            if not existing_album:
                album = Album(**album_data)
                db.add(album)
                created_count += 1
        
        db.commit()
        print(f"Created {created_count} albums successfully!")
        
    except Exception as e:
        print(f"Error creating albums: {e}")
        db.rollback()
    finally:
        db.close()

def create_sample_songs():
    """Create sample songs"""
    print("Creating sample songs...")
    
    db = SessionLocal()
    try:
        # Get artists, albums, and genres
        queen = db.query(User).filter(User.username == "queen_band").first()
        beatles = db.query(User).filter(User.username == "beatles_official").first()
        drake = db.query(User).filter(User.username == "drake_artist").first()
        taylor = db.query(User).filter(User.username == "taylor_swift").first()
        ed = db.query(User).filter(User.username == "ed_sheeran").first()
        
        opera_album = db.query(Album).filter(Album.title == "A Night at the Opera").first()
        abbey_album = db.query(Album).filter(Album.title == "Abbey Road").first()
        scorpion_album = db.query(Album).filter(Album.title == "Scorpion").first()
        
        rock_genre = db.query(Genre).filter(Genre.name == "Rock").first()
        pop_genre = db.query(Genre).filter(Genre.name == "Pop").first()
        hiphop_genre = db.query(Genre).filter(Genre.name == "Hip-Hop").first()
        
        songs_data = [
            # Queen songs
            {"title": "Bohemian Rhapsody", "artist_id": queen.id, "album_id": opera_album.id if opera_album else None, "genre_id": rock_genre.id, "duration_seconds": 355, "file_url": "https://example.com/bohemian-rhapsody.mp3"},
            {"title": "We Will Rock You", "artist_id": queen.id, "genre_id": rock_genre.id, "duration_seconds": 122, "file_url": "https://example.com/we-will-rock-you.mp3"},
            {"title": "Don't Stop Me Now", "artist_id": queen.id, "genre_id": rock_genre.id, "duration_seconds": 209, "file_url": "https://example.com/dont-stop-me-now.mp3"},
            
            # Beatles songs
            {"title": "Come Together", "artist_id": beatles.id, "album_id": abbey_album.id if abbey_album else None, "genre_id": rock_genre.id, "duration_seconds": 259, "file_url": "https://example.com/come-together.mp3"},
            {"title": "Here Comes the Sun", "artist_id": beatles.id, "album_id": abbey_album.id if abbey_album else None, "genre_id": rock_genre.id, "duration_seconds": 185, "file_url": "https://example.com/here-comes-the-sun.mp3"},
            
            # Drake songs
            {"title": "God's Plan", "artist_id": drake.id, "album_id": scorpion_album.id if scorpion_album else None, "genre_id": hiphop_genre.id, "duration_seconds": 198, "file_url": "https://example.com/gods-plan.mp3"},
            {"title": "In My Feelings", "artist_id": drake.id, "album_id": scorpion_album.id if scorpion_album else None, "genre_id": hiphop_genre.id, "duration_seconds": 217, "file_url": "https://example.com/in-my-feelings.mp3"},
            
            # Taylor Swift songs (if artist exists)
            {"title": "Shake It Off", "artist_id": taylor.id if taylor else queen.id, "genre_id": pop_genre.id, "duration_seconds": 219, "file_url": "https://example.com/shake-it-off.mp3"},
            {"title": "Love Story", "artist_id": taylor.id if taylor else queen.id, "genre_id": pop_genre.id, "duration_seconds": 236, "file_url": "https://example.com/love-story.mp3"},
            
            # Ed Sheeran songs (if artist exists)
            {"title": "Shape of You", "artist_id": ed.id if ed else queen.id, "genre_id": pop_genre.id, "duration_seconds": 233, "file_url": "https://example.com/shape-of-you.mp3"},
            {"title": "Perfect", "artist_id": ed.id if ed else queen.id, "genre_id": pop_genre.id, "duration_seconds": 263, "file_url": "https://example.com/perfect.mp3"},
        ]
        
        created_count = 0
        for song_data in songs_data:
            if song_data["artist_id"]:  # Only create if artist exists
                existing_song = db.query(Song).filter(
                    Song.title == song_data["title"],
                    Song.artist_id == song_data["artist_id"]
                ).first()
                if not existing_song:
                    song = Song(status=SongStatus.APPROVED, **song_data)  # Pre-approve for testing
                    db.add(song)
                    created_count += 1
        
        db.commit()
        print(f"Created {created_count} songs successfully!")
        
    except Exception as e:
        print(f"Error creating songs: {e}")
        db.rollback()
    finally:
        db.close()

def create_sample_playlists():
    """Create sample playlists"""
    print("Creating sample playlists...")
    
    db = SessionLocal()
    try:
        # Get testuser
        testuser = db.query(User).filter(User.username == "testuser").first()
        if not testuser:
            print("testuser not found! Create a user account first.")
            return
        
        # Get some songs
        songs = db.query(Song).limit(5).all()
        if not songs:
            print("No songs found! Create songs first.")
            return
        
        playlists_data = [
            {"name": "My Favorites", "description": "My favorite songs collection", "owner_id": testuser.id},
            {"name": "Rock Classics", "description": "Best rock songs of all time", "owner_id": testuser.id},
            {"name": "Chill Vibes", "description": "Relaxing music for any mood", "owner_id": testuser.id},
        ]
        
        created_count = 0
        for playlist_data in playlists_data:
            existing_playlist = db.query(Playlist).filter(
                Playlist.name == playlist_data["name"],
                Playlist.owner_id == playlist_data["owner_id"]
            ).first()
            if not existing_playlist:
                playlist = Playlist(**playlist_data)
                db.add(playlist)
                db.flush()  # Get the ID
                
                # Add some songs to the playlist
                for song in songs[:3]:  # Add first 3 songs
                    playlist_song = PlaylistSong(playlist_id=playlist.id, song_id=song.id)
                    db.add(playlist_song)
                
                created_count += 1
        
        db.commit()
        print(f"Created {created_count} playlists successfully!")
        
    except Exception as e:
        print(f"Error creating playlists: {e}")
        db.rollback()
    finally:
        db.close()

def create_all_sample_data():
    """Create all sample data in correct order"""
    print("🎵 Creating comprehensive test data for GSpotify...")
    print("=" * 50)
    
    create_sample_genres()
    create_sample_artists()
    create_sample_albums()
    create_sample_songs()
    create_sample_playlists()
    
    print("=" * 50)
    print("✅ All sample data created successfully!")
    print("\nYou now have:")
    print("- 10 music genres")
    print("- 5 artist accounts")
    print("- 3 albums")
    print("- 11 songs (pre-approved)")
    print("- 3 playlists for testuser")
    print("\nEnjoy testing your GSpotify frontend! 🎶")

def show_help():
    """Show available commands"""
    print("Available commands:")
    print("  init-db         - Initialize database tables")
    print("  create-admin    - Create first admin user")
    print("  create-genres   - Create sample music genres")
    print("  create-artists  - Create sample artist accounts")
    print("  create-albums   - Create sample albums")
    print("  create-songs    - Create sample songs")
    print("  create-playlists - Create sample playlists")
    print("  create-all-data - Create all sample data (recommended)")
    print("  help            - Show this help message")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        show_help()
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "init-db":
        init_db()
    elif command == "create-admin":
        create_admin_user()
    elif command == "create-genres":
        create_sample_genres()
    elif command == "create-artists":
        create_sample_artists()
    elif command == "create-albums":
        create_sample_albums()
    elif command == "create-songs":
        create_sample_songs()
    elif command == "create-playlists":
        create_sample_playlists()
    elif command == "create-all-data":
        create_all_sample_data()
    elif command == "help":
        show_help()
    else:
        print(f"Unknown command: {command}")
        show_help()
        sys.exit(1) 