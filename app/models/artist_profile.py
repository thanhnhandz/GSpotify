from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class ArtistProfile(Base):
    __tablename__ = "artist_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    bio = Column(Text, nullable=True)
    profile_image_url = Column(String, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="artist_profile") 