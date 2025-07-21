from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile, Form
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.song import Song, SongStatus
from app.models.liked_song import LikedSong
from app.models.comment import Comment
from app.models.lyrics import Lyrics
from app.models.user import User
from app.schemas.song import SongResponse, SongWithDetails
from app.schemas.comment import CommentResponse, CommentCreate
from app.schemas.lyrics import LyricsResponse
from app.auth import get_current_user, require_artist
from app.local_file_service import local_file_service
import os
from pathlib import Path

router = APIRouter(prefix="/songs", tags=["Songs"])


@router.get("/", response_model=List[SongWithDetails])
def list_songs(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    genre_id: Optional[int] = Query(None),
    artist_id: Optional[int] = Query(None)
):
    query = db.query(Song).filter(Song.status == SongStatus.APPROVED)
    
    if genre_id:
        query = query.filter(Song.genre_id == genre_id)
    if artist_id:
        query = query.filter(Song.artist_id == artist_id)
    
    songs = query.offset(skip).limit(limit).all()
    
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


@router.get("/{song_id}", response_model=SongWithDetails)
def get_song(song_id: int, db: Session = Depends(get_db)):
    song = db.query(Song).filter(Song.id == song_id, Song.status == SongStatus.APPROVED).first()
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )
    
    # Create detailed response
    song_dict = {
        **SongResponse.model_validate(song).model_dump(),
        "artist_name": song.artist.username if song.artist else None,
        "genre_name": song.genre.name if song.genre else None,
        "album_title": song.album.title if song.album else None,
        "cover_image_url": song.album.cover_art_url if song.album else None
    }
    
    return SongWithDetails.model_validate(song_dict)


@router.get("/{song_id}/stream")
def stream_song(song_id: int, db: Session = Depends(get_db)):
    song = db.query(Song).filter(Song.id == song_id, Song.status == SongStatus.APPROVED).first()
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )
    
    # Check if file exists
    if not local_file_service.file_exists(song.file_url):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song file not found"
        )
    
    # Increment play count
    song.play_count += 1
    db.commit()
    
    # Extract filename from file path and redirect to file streaming endpoint
    filename = Path(song.file_url).name
    stream_url = f"/files/songs/{filename}"
    
    return RedirectResponse(url=stream_url)


@router.post("/{song_id}/like")
def like_song(
    song_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    song = db.query(Song).filter(Song.id == song_id, Song.status == SongStatus.APPROVED).first()
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )
    
    # Check if already liked
    existing_like = db.query(LikedSong).filter(
        LikedSong.user_id == current_user.id,
        LikedSong.song_id == song_id
    ).first()
    
    if existing_like:
        return {"message": "Song already liked"}
    
    # Create new like
    new_like = LikedSong(user_id=current_user.id, song_id=song_id)
    db.add(new_like)
    db.commit()
    
    return {"message": "Song liked successfully"}


@router.delete("/{song_id}/like")
def unlike_song(
    song_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    like = db.query(LikedSong).filter(
        LikedSong.user_id == current_user.id,
        LikedSong.song_id == song_id
    ).first()
    
    if not like:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Like not found"
        )
    
    db.delete(like)
    db.commit()
    
    return {"message": "Song unliked successfully"}


@router.get("/{song_id}/lyrics", response_model=LyricsResponse)
def get_lyrics(song_id: int, db: Session = Depends(get_db)):
    song = db.query(Song).filter(Song.id == song_id, Song.status == SongStatus.APPROVED).first()
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )
    
    lyrics = db.query(Lyrics).filter(Lyrics.song_id == song_id).first()
    if not lyrics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lyrics not found"
        )
    
    return lyrics


@router.get("/{song_id}/comments", response_model=List[CommentResponse])
def get_comments(
    song_id: int,
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    song = db.query(Song).filter(Song.id == song_id, Song.status == SongStatus.APPROVED).first()
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )
    
    comments = db.query(Comment).filter(Comment.song_id == song_id).offset(skip).limit(limit).all()
    return comments


@router.post("/{song_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment(
    song_id: int,
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    song = db.query(Song).filter(Song.id == song_id, Song.status == SongStatus.APPROVED).first()
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )
    
    new_comment = Comment(
        text=comment_data.text,
        user_id=current_user.id,
        song_id=song_id
    )
    
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    return new_comment 