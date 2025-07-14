from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class UserRole(enum.Enum):
    USER = "user"
    ARTIST = "artist"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    agreed_to_terms = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    songs = relationship("Song", back_populates="artist")
    albums = relationship("Album", back_populates="artist")
    playlists = relationship("Playlist", back_populates="owner")
    comments = relationship("Comment", back_populates="user")
    liked_songs = relationship("LikedSong", back_populates="user")
    artist_profile = relationship("ArtistProfile", back_populates="user", uselist=False) 