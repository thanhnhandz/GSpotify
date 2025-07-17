import os
import uuid
import shutil
from pathlib import Path
from fastapi import HTTPException, UploadFile
from app.config import settings

class LocalFileService:
    def __init__(self):
        # Create uploads directory if it doesn't exist
        self.base_upload_path = Path("uploads")
        self.songs_path = self.base_upload_path / "songs"
        self.covers_path = self.base_upload_path / "covers"
        
        # Create directories
        self.songs_path.mkdir(parents=True, exist_ok=True)
        self.covers_path.mkdir(parents=True, exist_ok=True)
    
    def save_song_file(self, file_content: bytes, file_extension: str) -> str:
        """Save audio file locally and return the relative file path"""
        try:
            # Generate unique filename
            filename = f"{uuid.uuid4()}.{file_extension}"
            file_path = self.songs_path / filename
            
            # Write file to disk
            with open(file_path, "wb") as f:
                f.write(file_content)
            
            # Return relative path for database storage
            return f"uploads/songs/{filename}"
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    def save_cover_file(self, file_content: bytes, file_extension: str) -> str:
        """Save cover image file locally and return the relative file path"""
        try:
            # Generate unique filename
            filename = f"{uuid.uuid4()}.{file_extension}"
            file_path = self.covers_path / filename
            
            # Write file to disk
            with open(file_path, "wb") as f:
                f.write(file_content)
            
            # Return relative path for database storage
            return f"uploads/covers/{filename}"
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save cover: {str(e)}")
    
    def delete_file(self, file_path: str) -> bool:
        """Delete file from local storage"""
        try:
            full_path = Path(file_path)
            if full_path.exists():
                full_path.unlink()
                return True
            return False
        except Exception as e:
            print(f"Failed to delete file {file_path}: {str(e)}")
            return False
    
    def file_exists(self, file_path: str) -> bool:
        """Check if file exists"""
        return Path(file_path).exists()
    
    def get_file_size(self, file_path: str) -> int:
        """Get file size in bytes"""
        try:
            return Path(file_path).stat().st_size
        except:
            return 0

# Create global instance
local_file_service = LocalFileService()
