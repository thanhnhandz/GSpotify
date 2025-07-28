from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.song import Song, SongStatus
from app.models.album import Album
from app.models.lyrics import Lyrics
from app.models.user import User
from app.schemas.song import SongResponse, SongCreate, SongWithDetails
from app.schemas.album import AlbumResponse, AlbumCreate, AlbumUpdate
from app.schemas.lyrics import LyricsCreate, LyricsResponse
from app.auth import require_artist
from app.local_file_service import local_file_service
import os

router = APIRouter(prefix="/artist", tags=["Artist"])


@router.post("/songs", response_model=SongResponse, status_code=status.HTTP_201_CREATED)
async def upload_song(
    title: str = Form(...),
    genre_id: int = Form(...),
    album_id: Optional[int] = Form(None),
    file: UploadFile = File(...),
    current_user: User = Depends(require_artist),
    db: Session = Depends(get_db)
):
    # Validate file type
    allowed_extensions = ['.mp3', '.wav', '.flac', '.aac', '.ogg']
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    # Read file content
    file_content = await file.read()
    
    # Save to local storage
    file_url = local_file_service.save_song_file(file_content, file_extension[1:])
    
    # Create song record (duration can be updated later if needed)
    new_song = Song(
        title=title,
        artist_id=current_user.id,
        genre_id=genre_id,
        album_id=album_id,
        duration_seconds=180,  # Default 3 minutes - can be updated later
        file_url=file_url,
        status=SongStatus.PENDING_APPROVAL
    )
    
    db.add(new_song)
    db.commit()
    db.refresh(new_song)
    
    return new_song


@router.delete("/songs/{song_id}")
def delete_song(
    song_id: int,
    current_user: User = Depends(require_artist),
    db: Session = Depends(get_db)
):
    song = db.query(Song).filter(
        Song.id == song_id,
        Song.artist_id == current_user.id
    ).first()
    
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found or you don't have permission to delete it"
        )
    
    # Delete file from local storage
    if local_file_service.file_exists(song.file_url):
        local_file_service.delete_file(song.file_url)
    
    # Delete song from database
    db.delete(song)
    db.commit()
    
    return {"message": "Song deleted successfully"}


@router.post("/albums", response_model=AlbumResponse, status_code=status.HTTP_201_CREATED)
def create_album(
    album_data: AlbumCreate,
    current_user: User = Depends(require_artist),
    db: Session = Depends(get_db)
):
    new_album = Album(
        title=album_data.title,
        artist_id=current_user.id,
        cover_art_url=album_data.cover_art_url,
        release_date=album_data.release_date
    )
    
    db.add(new_album)
    db.commit()
    db.refresh(new_album)
    
    return new_album


@router.put("/albums/{album_id}", response_model=AlbumResponse)
def update_album(
    album_id: int,
    album_data: AlbumUpdate,
    current_user: User = Depends(require_artist),
    db: Session = Depends(get_db)
):
    album = db.query(Album).filter(
        Album.id == album_id,
        Album.artist_id == current_user.id
    ).first()
    
    if not album:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Album not found or you don't have permission to edit it"
        )
    
    # Update album fields
    if album_data.title:
        album.title = album_data.title
    if album_data.cover_art_url is not None:
        album.cover_art_url = album_data.cover_art_url
    if album_data.release_date is not None:
        album.release_date = album_data.release_date
    
    db.commit()
    db.refresh(album)
    return album


@router.delete("/albums/{album_id}")
def delete_album(
    album_id: int,
    current_user: User = Depends(require_artist),
    db: Session = Depends(get_db)
):
    album = db.query(Album).filter(
        Album.id == album_id,
        Album.artist_id == current_user.id
    ).first()
    
    if not album:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Album not found or you don't have permission to delete it"
        )
    
    # Check if album has songs
    songs_count = db.query(Song).filter(Song.album_id == album_id).count()
    if songs_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete album with {songs_count} songs. Remove songs first."
        )
    
    db.delete(album)
    db.commit()
    
    return {"message": "Album deleted successfully"}


@router.get("/songs", response_model=List[SongWithDetails])
def get_artist_songs(
    current_user: User = Depends(require_artist),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500)
):
    """
    Get all songs for the current artist (regardless of status).
    This is different from the public /songs/ endpoint which only returns approved songs.
    """
    songs = db.query(Song).filter(
        Song.artist_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    # Populate additional fields for detailed response
    result = []
    for song in songs:
        song_dict = {
            **SongResponse.model_validate(song).model_dump(),
            "artist_name": song.artist.username if song.artist else None,
            "genre_name": song.genre.name if song.genre else None,
            "album_title": song.album.title if song.album else None,
            "cover_image_url": song.album.cover_art_url if song.album else None
        }
        result.append(SongWithDetails.model_validate(song_dict))
    
    return result


@router.put("/songs/{song_id}/lyrics", response_model=LyricsResponse)
def add_or_update_lyrics(
    song_id: int,
    lyrics_data: LyricsCreate,
    current_user: User = Depends(require_artist),
    db: Session = Depends(get_db)
):
    # Check if song belongs to current artist
    song = db.query(Song).filter(
        Song.id == song_id,
        Song.artist_id == current_user.id
    ).first()
    
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found or you don't have permission to edit it"
        )
    
    # Check if lyrics already exist
    existing_lyrics = db.query(Lyrics).filter(Lyrics.song_id == song_id).first()
    
    if existing_lyrics:
        # Update existing lyrics
        existing_lyrics.text = lyrics_data.text
        db.commit()
        db.refresh(existing_lyrics)
        return existing_lyrics
    else:
        # Create new lyrics
        new_lyrics = Lyrics(
            song_id=song_id,
            text=lyrics_data.text
        )
        db.add(new_lyrics)
        db.commit()
        db.refresh(new_lyrics)
        return new_lyrics


@router.get("/dashboard/stats")
def get_artist_stats(
    current_user: User = Depends(require_artist),
    db: Session = Depends(get_db)
):
    # Get artist's songs
    songs = db.query(Song).filter(Song.artist_id == current_user.id).all()
    
    total_plays = sum(song.play_count for song in songs)
    total_songs = len(songs)
    approved_songs = len([song for song in songs if song.status == SongStatus.APPROVED])
    pending_songs = len([song for song in songs if song.status == SongStatus.PENDING_APPROVAL])
    
    # Get top songs (limit to 5)
    top_songs = sorted(songs, key=lambda x: x.play_count, reverse=True)[:5]
    
    return {
        "total_plays": total_plays,
        "total_songs": total_songs,
        "approved_songs": approved_songs,
        "pending_songs": pending_songs,
        "top_songs": [{"title": song.title, "plays": song.play_count} for song in top_songs]
    }


@router.get("/dashboard/earnings")
def get_earnings(
    current_user: User = Depends(require_artist),
    db: Session = Depends(get_db)
):
    # Get artist's songs
    songs = db.query(Song).filter(Song.artist_id == current_user.id).all()
    total_plays = sum(song.play_count for song in songs)
    
    # Placeholder calculation: $0.003 per play
    earnings_per_play = 0.003
    estimated_earnings = total_plays * earnings_per_play
    
    return {
        "total_plays": total_plays,
        "earnings_per_play": earnings_per_play,
        "estimated_earnings": round(estimated_earnings, 2),
        "currency": "USD",
        "note": "These are estimated earnings. Actual earnings may vary."
    } 