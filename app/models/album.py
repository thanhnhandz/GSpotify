from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Album(Base):
    __tablename__ = "albums"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    artist_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cover_art_url = Column(String, nullable=True)
    release_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    artist = relationship("User", back_populates="albums")
    songs = relationship("Song", back_populates="album") 