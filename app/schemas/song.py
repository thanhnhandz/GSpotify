from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.song import SongStatus


class SongBase(BaseModel):
    title: str
    genre_id: int
    album_id: Optional[int] = None


class SongCreate(SongBase):
    duration_seconds: int


class SongUpdate(BaseModel):
    title: Optional[str] = None
    genre_id: Optional[int] = None
    album_id: Optional[int] = None


class SongResponse(SongBase):
    id: int
    artist_id: int
    duration_seconds: int
    file_url: str
    status: SongStatus
    release_date: datetime
    play_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Simplified version without circular references
class SongWithDetails(SongResponse):
    artist_name: Optional[str] = None
    genre_name: Optional[str] = None
    album_title: Optional[str] = None
    cover_image_url: Optional[str] = None  # Album cover art URL
    
    class Config:
        from_attributes = True 