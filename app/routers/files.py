from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse, StreamingResponse
from pathlib import Path
import os
from typing import Generator

router = APIRouter(prefix="/files", tags=["Files"])

@router.get("/songs/{filename}")
async def stream_song(filename: str, request: Request):
    """Stream audio files with support for range requests"""
    
    # Construct file path
    file_path = Path("uploads") / "songs" / filename
    
    # Check if file exists
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    # Get file info
    file_size = file_path.stat().st_size
    
    # Handle range requests for audio streaming
    range_header = request.headers.get('Range')
    
    if not range_header:
        # Return entire file
        return FileResponse(
            path=str(file_path),
            media_type="audio/mpeg",
            headers={
                "Accept-Ranges": "bytes",
                "Content-Length": str(file_size)
            }
        )
    
    # Parse range header
    range_match = range_header.replace('bytes=', '').split('-')
    start = int(range_match[0]) if range_match[0] else 0
    end = int(range_match[1]) if range_match[1] else file_size - 1
    
    # Validate range
    if start >= file_size or end >= file_size:
        raise HTTPException(status_code=416, detail="Range not satisfiable")
    
    # Calculate chunk size
    chunk_size = end - start + 1
    
    def generate_chunk():
        with open(file_path, "rb") as file:
            file.seek(start)
            remaining = chunk_size
            while remaining:
                chunk = file.read(min(8192, remaining))  # Read in 8KB chunks
                if not chunk:
                    break
                remaining -= len(chunk)
                yield chunk
    
    return StreamingResponse(
        generate_chunk(),
        status_code=206,  # Partial Content
        media_type="audio/mpeg",
        headers={
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(chunk_size)
        }
    )

@router.get("/covers/{filename}")
async def get_cover(filename: str):
    """Serve cover images"""
    file_path = Path("uploads") / "covers" / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Cover not found")
    
    return FileResponse(
        path=str(file_path),
        media_type="image/jpeg"
    )
