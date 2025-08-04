from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CommentBase(BaseModel):
    text: str


class CommentCreate(CommentBase):
    pass


class CommentResponse(CommentBase):
    id: int
    user_id: int
    song_id: int
    created_at: datetime
    username: Optional[str] = None
    
    class Config:
        from_attributes = True 