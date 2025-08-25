from pydantic import BaseModel


class LyricsBase(BaseModel):
    text: str


class LyricsCreate(LyricsBase):
    pass


class LyricsUpdate(LyricsBase):
    pass


class LyricsResponse(LyricsBase):
    id: int
    song_id: int
    
    class Config:
        from_attributes = True 