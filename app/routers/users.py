from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.liked_song import LikedSong
from app.models.song import Song
from app.schemas.user import UserResponse, UserUpdate, UserProfileResponse, RoleUpdate, NotificationSettings
from app.schemas.song import SongResponse
from app.schemas.playlist import PlaylistResponse
from app.auth import get_current_user, require_admin

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserProfileResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_update.email:
        # Check if email is already taken by another user
        existing_user = db.query(User).filter(
            User.email == user_update.email,
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        current_user.email = user_update.email
    
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/me/playlists", response_model=List[PlaylistResponse])
def get_my_playlists(
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    return current_user.playlists[skip:skip + limit]


@router.get("/me/liked-songs", response_model=List[SongResponse])
def get_liked_songs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    liked_songs = db.query(LikedSong).filter(
        LikedSong.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return [liked_song.song for liked_song in liked_songs]


@router.put("/notification-settings")
def update_notification_settings(
    settings: NotificationSettings,
    current_user: User = Depends(get_current_user)
):
    """
    Update user notification settings.
    Note: This is a placeholder implementation. In production, you would
    store these settings in the database.
    """
    # TODO: Implement database storage for notification settings
    return {
        "message": "Notification settings updated successfully",
        "settings": settings.dict()
    }


@router.delete("/me")
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete the current user's account.
    This will permanently delete all user data.
    """
    # TODO: Add proper data cleanup (songs, playlists, comments, etc.)
    # For now, just delete the user record
    db.delete(current_user)
    db.commit()
    
    return {"message": "Account deleted successfully"}


# Admin endpoints
@router.put("/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    role_update: RoleUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.role = role_update.role
    db.commit()
    db.refresh(user)
    return user 