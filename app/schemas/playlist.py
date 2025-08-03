from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class PlaylistBase(BaseModel):
    name: str
    description: Optional[str] = None


class PlaylistCreate(PlaylistBase):
    pass


class PlaylistUpdate(PlaylistBase):
    pass


class PlaylistResponse(PlaylistBase):
    id: int
    owner_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class PlaylistWithSongs(PlaylistResponse):
    song_count: Optional[int] = 0
    owner_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class AddSongToPlaylist(BaseModel):
    song_id: int 