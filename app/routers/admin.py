from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models.song import Song, SongStatus
from app.models.user import User, UserRole
from app.models.genre import Genre
from app.models.comment import Comment
from app.schemas.song import SongResponse
from app.schemas.genre import GenreCreate, GenreUpdate, GenreResponse
from app.schemas.user import UserResponse
from app.auth import require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


# User management
@router.get("/users", response_model=List[UserResponse])
def list_all_users(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500)
):
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.put("/users/{user_id}/toggle-status")
def toggle_user_status(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = not user.is_active
    db.commit()
    
    return {"message": f"User {'activated' if user.is_active else 'deactivated'} successfully"}


@router.put("/users/{user_id}/role")
def change_user_role(
    user_id: int,
    role_data: dict,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    new_role = role_data.get('role')
    if new_role not in ['user', 'artist', 'admin']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role"
        )
    
    try:
        user.role = UserRole(new_role)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role"
        )
    db.commit()
    
    return {"message": f"User role changed to {new_role} successfully"}


# Song moderation
@router.get("/songs", response_model=List[SongResponse])
def list_all_songs(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500)
):
    songs = db.query(Song).offset(skip).limit(limit).all()
    return songs


@router.get("/songs/pending", response_model=List[SongResponse])
def list_pending_songs(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500)
):
    songs = db.query(Song).filter(
        Song.status == SongStatus.PENDING_APPROVAL
    ).offset(skip).limit(limit).all()
    return songs


@router.post("/songs/{song_id}/approve")
def approve_song(
    song_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    song = db.query(Song).filter(Song.id == song_id).first()
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )
    
    song.status = SongStatus.APPROVED
    db.commit()
    
    return {"message": "Song approved successfully"}


@router.post("/songs/{song_id}/reject")
def reject_song(
    song_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    song = db.query(Song).filter(Song.id == song_id).first()
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )
    
    song.status = SongStatus.REJECTED
    db.commit()
    
    return {"message": "Song rejected successfully"}


@router.delete("/songs/{song_id}")
def force_delete_song(
    song_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    song = db.query(Song).filter(Song.id == song_id).first()
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )
    
    # TODO: Delete file from S3
    # file_key = s3_service.extract_key_from_url(song.file_url)
    # s3_service.delete_file(file_key)
    
    db.delete(song)
    db.commit()
    
    return {"message": "Song deleted successfully"}


@router.delete("/comments/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    db.delete(comment)
    db.commit()
    
    return {"message": "Comment deleted successfully"}


# Genre management
@router.post("/genres", response_model=GenreResponse, status_code=status.HTTP_201_CREATED)
def create_genre(
    genre_data: GenreCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    # Check if genre already exists
    existing_genre = db.query(Genre).filter(Genre.name == genre_data.name).first()
    if existing_genre:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Genre already exists"
        )
    
    new_genre = Genre(name=genre_data.name)
    db.add(new_genre)
    db.commit()
    db.refresh(new_genre)
    
    return new_genre


@router.put("/genres/{genre_id}", response_model=GenreResponse)
def update_genre(
    genre_id: int,
    genre_data: GenreUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    genre = db.query(Genre).filter(Genre.id == genre_id).first()
    if not genre:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Genre not found"
        )
    
    # Check if new name conflicts with existing genre
    existing_genre = db.query(Genre).filter(
        Genre.name == genre_data.name,
        Genre.id != genre_id
    ).first()
    if existing_genre:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Genre name already exists"
        )
    
    genre.name = genre_data.name
    db.commit()
    db.refresh(genre)
    
    return genre


@router.delete("/genres/{genre_id}")
def delete_genre(
    genre_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    genre = db.query(Genre).filter(Genre.id == genre_id).first()
    if not genre:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Genre not found"
        )
    
    # Check if genre is being used by any songs
    songs_count = db.query(Song).filter(Song.genre_id == genre_id).count()
    if songs_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete genre. It is used by {songs_count} songs."
        )
    
    db.delete(genre)
    db.commit()
    
    return {"message": "Genre deleted successfully"}


# Platform statistics
@router.get("/dashboard/stats")
def get_platform_stats(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    # Basic counts
    total_users = db.query(User).count()
    total_artists = db.query(User).filter(User.role == "artist").count()
    total_songs = db.query(Song).count()
    approved_songs = db.query(Song).filter(Song.status == SongStatus.APPROVED).count()
    pending_songs = db.query(Song).filter(Song.status == SongStatus.PENDING_APPROVAL).count()
    
    # Total plays
    total_plays = db.query(func.sum(Song.play_count)).scalar() or 0
    
    # Recent activity (placeholder - you might want to add created_at filters)
    recent_users = db.query(User).order_by(User.created_at.desc()).limit(5).all()
    recent_songs = db.query(Song).order_by(Song.created_at.desc()).limit(5).all()
    
    return {
        "total_users": total_users,
        "total_artists": total_artists,
        "total_songs": total_songs,
        "approved_songs": approved_songs,
        "pending_songs": pending_songs,
        "total_plays": total_plays,
        "recent_users": [{"id": u.id, "username": u.username, "created_at": u.created_at} for u in recent_users],
        "recent_songs": [{"id": s.id, "title": s.title, "artist_id": s.artist_id, "created_at": s.created_at} for s in recent_songs]
    } 