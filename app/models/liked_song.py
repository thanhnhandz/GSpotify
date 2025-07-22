from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class LikedSong(Base):
    __tablename__ = "liked_songs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    song_id = Column(Integer, ForeignKey("songs.id"), nullable=False)
    liked_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Ensure a user can't like the same song twice
    __table_args__ = (UniqueConstraint('user_id', 'song_id', name='unique_user_song_like'),)
    
    # Relationships
    user = relationship("User", back_populates="liked_songs")
    song = relationship("Song", back_populates="liked_by") 