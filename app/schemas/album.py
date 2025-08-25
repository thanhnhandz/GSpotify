from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class AlbumBase(BaseModel):
    title: str
    cover_art_url: Optional[str] = None


class AlbumCreate(AlbumBase):
    release_date: Optional[datetime] = None


class AlbumUpdate(AlbumBase):
    release_date: Optional[datetime] = None


class AlbumResponse(AlbumBase):
    id: int
    artist_id: int
    release_date: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True


# Simplified version without circular references
class AlbumWithSongs(AlbumResponse):
    song_count: Optional[int] = 0
    artist_name: Optional[str] = None
    
    class Config:
        from_attributes = True 