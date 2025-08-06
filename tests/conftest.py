import pytest
import pytest_asyncio
import asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import get_db, Base
from app.models.user import User, UserRole
from app.models.genre import Genre
from app.auth import get_password_hash
import os


# Test database URL
TEST_DATABASE_URL = "sqlite:///./test_gspotify.db"

# Create test database engine
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


# Override the database dependency
app.dependency_overrides[get_db] = override_get_db





@pytest_asyncio.fixture
async def client():
    """Create a test client"""
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Add test genres
    db = TestingSessionLocal()
    genres = [
        Genre(name="Pop"),
        Genre(name="Rock"),
        Genre(name="Hip Hop"),
        Genre(name="Electronic"),
        Genre(name="Jazz")
    ]
    
    for genre in genres:
        existing = db.query(Genre).filter(Genre.name == genre.name).first()
        if not existing:
            db.add(genre)
    
    db.commit()
    db.close()
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    
    # Clean up
    Base.metadata.drop_all(bind=engine)


@pytest_asyncio.fixture
async def regular_user_token(client: AsyncClient):
    """Create a regular user and return auth token"""
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123"
    }
    
    # Create user
    response = await client.post("/auth/signup", json=user_data)
    assert response.status_code == 201
    
    # Login to get token
    login_data = {
        "username": user_data["username"],
        "password": user_data["password"]
    }
    response = await client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    
    token_data = response.json()
    return token_data["access_token"]


@pytest_asyncio.fixture
async def artist_user_token(client: AsyncClient):
    """Create an artist user and return auth token"""
    # First create admin user to change roles
    admin_data = {
        "username": "admin",
        "email": "admin@example.com", 
        "password": "adminpass123"
    }
    
    # Create admin user directly in database
    db = TestingSessionLocal()
    hashed_password = get_password_hash(admin_data["password"])
    admin_user = User(
        username=admin_data["username"],
        email=admin_data["email"],
        hashed_password=hashed_password,
        role=UserRole.ADMIN
    )
    db.add(admin_user)
    db.commit()
    
    # Create artist user
    artist_data = {
        "username": "artist",
        "email": "artist@example.com",
        "password": "artistpass123"
    }
    
    response = await client.post("/auth/signup", json=artist_data)
    assert response.status_code == 201
    user_id = response.json()["id"]
    
    # Login as admin
    admin_login = {
        "username": admin_data["username"],
        "password": admin_data["password"]
    }
    response = await client.post("/auth/login", json=admin_login)
    admin_token = response.json()["access_token"]
    
    # Change user role to artist
    headers = {"Authorization": f"Bearer {admin_token}"}
    role_data = {"role": "artist"}
    response = await client.put(f"/users/{user_id}/role", json=role_data, headers=headers)
    assert response.status_code == 200
    
    # Login as artist
    artist_login = {
        "username": artist_data["username"],
        "password": artist_data["password"]
    }
    response = await client.post("/auth/login", json=artist_login)
    assert response.status_code == 200
    
    db.close()
    token_data = response.json()
    return token_data["access_token"]


@pytest_asyncio.fixture
async def admin_user_token(client: AsyncClient):
    """Create an admin user and return auth token"""
    admin_data = {
        "username": "adminuser",
        "email": "adminuser@example.com",
        "password": "adminpass123"
    }
    
    # Create admin user directly in database
    db = TestingSessionLocal()
    hashed_password = get_password_hash(admin_data["password"])
    admin_user = User(
        username=admin_data["username"],
        email=admin_data["email"],
        hashed_password=hashed_password,
        role=UserRole.ADMIN
    )
    db.add(admin_user)
    db.commit()
    db.close()
    
    # Login as admin
    login_data = {
        "username": admin_data["username"],
        "password": admin_data["password"]
    }
    response = await client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    
    token_data = response.json()
    return token_data["access_token"] 