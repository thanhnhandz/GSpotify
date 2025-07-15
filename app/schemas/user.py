from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from app.models.user import UserRole


class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str
    agreed_to_terms: bool = True


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    profile_image_url: Optional[str] = None


class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Simplified without circular reference
class UserProfileResponse(UserResponse):
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None
    
    class Config:
        from_attributes = True


class ArtistProfileBase(BaseModel):
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None


class ArtistProfileResponse(ArtistProfileBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True


class RoleUpdate(BaseModel):
    role: UserRole


class NotificationSettings(BaseModel):
    email_notifications: bool = True
    playlist_updates: bool = True
    new_followers: bool = False 