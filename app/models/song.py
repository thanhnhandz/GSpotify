from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class SongStatus(enum.Enum):
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    REJECTED = "rejected"


class Song(Base):
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    artist_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    album_id = Column(Integer, ForeignKey("albums.id"), nullable=True)
    genre_id = Column(Integer, ForeignKey("genres.id"), nullable=False)
    duration_seconds = Column(Integer, nullable=False)
    file_url = Column(String, nullable=False)
    status = Column(Enum(SongStatus), default=SongStatus.PENDING_APPROVAL, nullable=False)
    release_date = Column(DateTime(timezone=True), server_default=func.now())
    play_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    artist = relationship("User", back_populates="songs")
    album = relationship("Album", back_populates="songs")
    genre = relationship("Genre", back_populates="songs")
    comments = relationship("Comment", back_populates="song")
    lyrics = relationship("Lyrics", back_populates="song", uselist=False)
    liked_by = relationship("LikedSong", back_populates="song")
    playlist_songs = relationship("PlaylistSong", back_populates="song") 