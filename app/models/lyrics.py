from sqlalchemy import Column, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Lyrics(Base):
    __tablename__ = "lyrics"

    id = Column(Integer, primary_key=True, index=True)
    song_id = Column(Integer, ForeignKey("songs.id"), nullable=False, unique=True)
    text = Column(Text, nullable=False)
    
    # Relationships
    song = relationship("Song", back_populates="lyrics") 