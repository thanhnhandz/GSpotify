import os
import secrets
from pydantic_settings import BaseSettings
from typing import Optional, List
from functools import lru_cache


class Settings(BaseSettings):
    # Application Configuration
    app_name: str = "GSpotify API"
    app_version: str = "1.0.0"
    environment: str = "development"
    debug: bool = False
    
    # Security Configuration
    secret_key: str = secrets.token_urlsafe(32)  # Auto-generate if not provided
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Database Configuration
    database_url: str = "postgresql://gspotify:gspotify123@localhost:5432/gspotify"
    database_pool_size: int = 10
    database_max_overflow: int = 20
    database_pool_timeout: int = 30
    database_pool_recycle: int = 3600
    
    # Redis Configuration (for caching and sessions)
    redis_url: str = "redis://localhost:6379"
    redis_password: Optional[str] = None
    
    # S3 Configuration
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "us-east-1"
    s3_bucket_name: str = "gspotify-music-files"
    s3_endpoint_url: Optional[str] = None
    
    # CORS Configuration
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:8080"]
    cors_allow_credentials: bool = True
    cors_allow_methods: List[str] = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    cors_allow_headers: List[str] = ["*"]
    
    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 60  # seconds
    
    # Logging Configuration
    log_level: str = "INFO"
    log_format: str = "colored"  # colored, json, compact, or text
    
    # File Upload Configuration
    max_file_size: int = 50 * 1024 * 1024  # 50MB
    allowed_file_types: List[str] = [".mp3", ".wav", ".flac", ".aac", ".ogg"]
    
    # Monitoring Configuration
    enable_metrics: bool = True
    metrics_port: int = 9090
    
    # Email Configuration (for notifications)
    smtp_host: Optional[str] = None
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_use_tls: bool = True
    
    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        return self.environment.lower() == "development"
    
    @property
    def is_testing(self) -> bool:
        return self.environment.lower() == "testing"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings() 