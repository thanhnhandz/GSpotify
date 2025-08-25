from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.song import Song, SongStatus
from app.models.album import Album
from app.models.genre import Genre
from app.models.playlist import Playlist, PlaylistSong
from app.schemas.user import UserResponse
from app.schemas.song import SongResponse, SongWithDetails
from app.schemas.album import AlbumResponse
from app.schemas.genre import GenreResponse
from app.schemas.playlist import PlaylistResponse, PlaylistWithSongs, PlaylistCreate, PlaylistUpdate, AddSongToPlaylist
from app.auth import get_current_user

router = APIRouter(tags=["General"])


# Artists
@router.get("/artists", response_model=List[UserResponse])
def list_artists(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    artists = db.query(User).filter(User.role == "artist").offset(skip).limit(limit).all()
    return artists


# Albums
@router.get("/albums", response_model=List[AlbumResponse])
def list_albums(
    db: Session = Depends(get_db),
    artist_id: Optional[int] = Query(None, description="Filter albums by artist ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    query = db.query(Album)
    
    if artist_id:
        query = query.filter(Album.artist_id == artist_id)
    
    albums = query.offset(skip).limit(limit).all()
    return albums


# Genres
@router.get("/genres", response_model=List[GenreResponse])
def list_genres(db: Session = Depends(get_db)):
    genres = db.query(Genre).all()
    return genres


# Playlists
@router.get("/playlists", response_model=List[PlaylistResponse])
def list_playlists(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    # For now, return all playlists. In a real app, you might want to filter by public playlists
    playlists = db.query(Playlist).offset(skip).limit(limit).all()
    return playlists


@router.post("/playlists", response_model=PlaylistResponse, status_code=status.HTTP_201_CREATED)
def create_playlist(
    playlist_data: PlaylistCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_playlist = Playlist(
        name=playlist_data.name,
        description=playlist_data.description,
        owner_id=current_user.id
    )
    
    db.add(new_playlist)
    db.commit()
    db.refresh(new_playlist)
    
    return new_playlist


@router.get("/playlists/{playlist_id}", response_model=PlaylistWithSongs)
def get_playlist(playlist_id: int, db: Session = Depends(get_db)):
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Playlist not found"
        )
    
    # Get songs count
    songs_count = db.query(PlaylistSong).filter(PlaylistSong.playlist_id == playlist_id).count()
    
    # Create response with additional fields
    playlist_dict = {
        **PlaylistResponse.model_validate(playlist).model_dump(),
        "song_count": songs_count,
        "owner_name": playlist.owner.username if playlist.owner else None
    }
    
    return PlaylistWithSongs.model_validate(playlist_dict)


@router.get("/playlists/{playlist_id}/songs", response_model=List[SongResponse])
def get_playlist_songs(playlist_id: int, db: Session = Depends(get_db)):
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Playlist not found"
        )
    
    playlist_songs = db.query(PlaylistSong).filter(PlaylistSong.playlist_id == playlist_id).all()
    return [ps.song for ps in playlist_songs]


@router.put("/playlists/{playlist_id}", response_model=PlaylistResponse)
def update_playlist(
    playlist_id: int,
    playlist_data: PlaylistUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    playlist = db.query(Playlist).filter(
        Playlist.id == playlist_id,
        Playlist.owner_id == current_user.id
    ).first()
    
    if not playlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Playlist not found or you don't have permission to edit it"
        )
    
    playlist.name = playlist_data.name
    playlist.description = playlist_data.description
    db.commit()
    db.refresh(playlist)
    
    return playlist


@router.delete("/playlists/{playlist_id}")
def delete_playlist(
    playlist_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    playlist = db.query(Playlist).filter(
        Playlist.id == playlist_id,
        Playlist.owner_id == current_user.id
    ).first()
    
    if not playlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Playlist not found or you don't have permission to delete it"
        )
    
    # First delete all playlist_songs entries for this playlist
    deleted_songs_count = db.query(PlaylistSong).filter(PlaylistSong.playlist_id == playlist_id).delete()
    
    # Then delete the playlist itself
    db.delete(playlist)
    db.commit()
    
    # Log the deletion for debugging
    print(f"Deleted playlist '{playlist.name}' (ID: {playlist_id}) with {deleted_songs_count} songs")
    
    return {"message": "Playlist deleted successfully"}


@router.post("/playlists/{playlist_id}/songs")
def add_song_to_playlist(
    playlist_id: int,
    song_data: AddSongToPlaylist,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    playlist = db.query(Playlist).filter(
        Playlist.id == playlist_id,
        Playlist.owner_id == current_user.id
    ).first()
    
    if not playlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Playlist not found or you don't have permission to edit it"
        )
    
    # Check if song exists and is approved
    song = db.query(Song).filter(
        Song.id == song_data.song_id,
        Song.status == SongStatus.APPROVED
    ).first()
    
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )
    
    # Check if song is already in playlist
    existing_entry = db.query(PlaylistSong).filter(
        PlaylistSong.playlist_id == playlist_id,
        PlaylistSong.song_id == song_data.song_id
    ).first()
    
    if existing_entry:
        return {"message": "Song already in playlist"}
    
    # Add song to playlist
    playlist_song = PlaylistSong(
        playlist_id=playlist_id,
        song_id=song_data.song_id
    )
    
    db.add(playlist_song)
    db.commit()
    
    return {"message": "Song added to playlist successfully"}


@router.delete("/playlists/{playlist_id}/songs/{song_id}")
def remove_song_from_playlist(
    playlist_id: int,
    song_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    playlist = db.query(Playlist).filter(
        Playlist.id == playlist_id,
        Playlist.owner_id == current_user.id
    ).first()
    
    if not playlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Playlist not found or you don't have permission to edit it"
        )
    
    playlist_song = db.query(PlaylistSong).filter(
        PlaylistSong.playlist_id == playlist_id,
        PlaylistSong.song_id == song_id
    ).first()
    
    if not playlist_song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found in playlist"
        )
    
    db.delete(playlist_song)
    db.commit()
    
    return {"message": "Song removed from playlist successfully"}


# Search
@router.get("/search")
def search(
    q: str = Query(..., min_length=1),
    type: str = Query("all", regex="^(song|artist|playlist|all)$"),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    results = {}
    
    if type in ["song", "all"]:
        # Search songs
        songs = db.query(Song).filter(
            Song.status == SongStatus.APPROVED,
            or_(
                Song.title.ilike(f"%{q}%"),
                # You might want to join with User table to search by artist name
            )
        ).offset(skip).limit(limit).all()
        results["songs"] = songs
    
    if type in ["artist", "all"]:
        # Search artists
        artists = db.query(User).filter(
            User.role == "artist",
            or_(
                User.username.ilike(f"%{q}%"),
                User.email.ilike(f"%{q}%")
            )
        ).offset(skip).limit(limit).all()
        results["artists"] = artists
    
    if type in ["playlist", "all"]:
        # Search playlists
        playlists = db.query(Playlist).filter(
            or_(
                Playlist.name.ilike(f"%{q}%"),
                Playlist.description.ilike(f"%{q}%")
            )
        ).offset(skip).limit(limit).all()
        results["playlists"] = playlists
    
    return results 