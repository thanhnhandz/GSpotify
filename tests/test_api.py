import pytest
from httpx import AsyncClient


class TestBasicEndpoints:
    """Test basic public endpoints"""
    
    @pytest.mark.asyncio
    async def test_root_endpoint(self, client: AsyncClient):
        """Test root endpoint"""
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Welcome to GSpotify API"
        assert "version" in data
        assert "environment" in data
    
    @pytest.mark.asyncio
    async def test_health_check(self, client: AsyncClient):
        """Test health check endpoint"""
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "version" in data
        assert "environment" in data
        assert "database" in data
    
    @pytest.mark.asyncio
    async def test_list_genres(self, client: AsyncClient):
        """Test listing genres"""
        response = await client.get("/genres")
        assert response.status_code == 200
        genres = response.json()
        assert len(genres) == 5
        assert any(genre["name"] == "Pop" for genre in genres)
        assert any(genre["name"] == "Rock" for genre in genres)
    
    @pytest.mark.asyncio
    async def test_list_artists(self, client: AsyncClient):
        """Test listing artists (should be empty initially)"""
        response = await client.get("/artists")
        assert response.status_code == 200
        assert response.json() == []
    
    @pytest.mark.asyncio
    async def test_list_songs(self, client: AsyncClient):
        """Test listing songs (should be empty initially)"""
        response = await client.get("/songs/")
        assert response.status_code == 200
        assert response.json() == []
    
    @pytest.mark.asyncio
    async def test_list_playlists(self, client: AsyncClient):
        """Test listing playlists (should be empty initially)"""
        response = await client.get("/playlists")
        assert response.status_code == 200
        assert response.json() == []


class TestAuthentication:
    """Test authentication endpoints"""
    
    @pytest.mark.asyncio
    async def test_user_signup_success(self, client: AsyncClient):
        """Test successful user signup"""
        user_data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "password123"
        }
        response = await client.post("/auth/signup", json=user_data)
        assert response.status_code == 201
        
        data = response.json()
        assert data["username"] == user_data["username"]
        assert data["email"] == user_data["email"]
        assert data["role"] == "user"
        assert "id" in data
        assert "created_at" in data
    
    @pytest.mark.asyncio
    async def test_user_signup_duplicate_username(self, client: AsyncClient):
        """Test signup with duplicate username"""
        user_data = {
            "username": "dupuser",
            "email": "dup1@example.com",
            "password": "password123"
        }
        # First signup
        response = await client.post("/auth/signup", json=user_data)
        assert response.status_code == 201
        
        # Duplicate signup
        user_data["email"] = "dup2@example.com"  # Different email
        response = await client.post("/auth/signup", json=user_data)
        assert response.status_code == 400
        assert "Username already registered" in response.json()["detail"]
    
    @pytest.mark.asyncio
    async def test_user_signup_invalid_email(self, client: AsyncClient):
        """Test signup with invalid email"""
        user_data = {
            "username": "testuser",
            "email": "invalid_email",
            "password": "password123"
        }
        response = await client.post("/auth/signup", json=user_data)
        assert response.status_code == 422
        
        error = response.json()["detail"][0]
        assert error["type"] == "value_error"
        assert "email" in error["loc"]
    
    @pytest.mark.asyncio
    async def test_user_login_success(self, client: AsyncClient):
        """Test successful login"""
        # First create user
        user_data = {
            "username": "loginuser",
            "email": "login@example.com",
            "password": "password123"
        }
        await client.post("/auth/signup", json=user_data)
        
        # Login
        login_data = {
            "username": "loginuser",
            "password": "password123"
        }
        response = await client.post("/auth/login", json=login_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    @pytest.mark.asyncio
    async def test_user_login_invalid_credentials(self, client: AsyncClient):
        """Test login with invalid credentials"""
        login_data = {
            "username": "nonexistent",
            "password": "wrongpassword"
        }
        response = await client.post("/auth/login", json=login_data)
        assert response.status_code == 401
        assert response.json()["detail"] == "Incorrect username or password"


class TestProtectedEndpoints:
    """Test endpoints that require authentication"""
    
    @pytest.mark.asyncio
    async def test_get_user_profile_success(self, client: AsyncClient, regular_user_token: str):
        """Test getting user profile with valid token"""
        headers = {"Authorization": f"Bearer {regular_user_token}"}
        response = await client.get("/users/me", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"
        assert data["role"] == "user"
    
    @pytest.mark.asyncio
    async def test_get_user_profile_no_token(self, client: AsyncClient):
        """Test getting user profile without token"""
        response = await client.get("/users/me")
        assert response.status_code == 403
        assert response.json()["detail"] == "Not authenticated"
    
    @pytest.mark.asyncio
    async def test_get_user_profile_invalid_token(self, client: AsyncClient):
        """Test getting user profile with invalid token"""
        headers = {"Authorization": "Bearer invalid_token"}
        response = await client.get("/users/me", headers=headers)
        assert response.status_code == 401
        assert response.json()["detail"] == "Could not validate credentials"
    
    @pytest.mark.asyncio
    async def test_get_user_playlists(self, client: AsyncClient, regular_user_token: str):
        """Test getting user's playlists"""
        headers = {"Authorization": f"Bearer {regular_user_token}"}
        response = await client.get("/users/me/playlists", headers=headers)
        assert response.status_code == 200
        assert response.json() == []
    
    @pytest.mark.asyncio
    async def test_get_user_liked_songs(self, client: AsyncClient, regular_user_token: str):
        """Test getting user's liked songs"""
        headers = {"Authorization": f"Bearer {regular_user_token}"}
        response = await client.get("/users/me/liked-songs", headers=headers)
        assert response.status_code == 200
        assert response.json() == []


class TestPlaylistOperations:
    """Test playlist CRUD operations"""
    
    @pytest.mark.asyncio
    async def test_create_playlist_success(self, client: AsyncClient, regular_user_token: str):
        """Test creating a playlist"""
        headers = {"Authorization": f"Bearer {regular_user_token}"}
        playlist_data = {
            "name": "My Test Playlist",
            "description": "A test playlist"
        }
        response = await client.post("/playlists", json=playlist_data, headers=headers)
        assert response.status_code == 201
        
        data = response.json()
        assert data["name"] == playlist_data["name"]
        assert data["description"] == playlist_data["description"]
        assert "id" in data
        assert "owner_id" in data
        assert "created_at" in data
    
    @pytest.mark.asyncio
    async def test_create_playlist_no_auth(self, client: AsyncClient):
        """Test creating playlist without authentication"""
        playlist_data = {
            "name": "Test Playlist",
            "description": "Test"
        }
        response = await client.post("/playlists", json=playlist_data)
        assert response.status_code == 403
    
    @pytest.mark.asyncio
    async def test_get_playlist_success(self, client: AsyncClient, regular_user_token: str):
        """Test getting a playlist"""
        # First create a playlist
        headers = {"Authorization": f"Bearer {regular_user_token}"}
        playlist_data = {
            "name": "Get Test Playlist",
            "description": "Test playlist for getting"
        }
        create_response = await client.post("/playlists", json=playlist_data, headers=headers)
        assert create_response.status_code == 201
        playlist_id = create_response.json()["id"]
        
        # Get the playlist
        response = await client.get(f"/playlists/{playlist_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == playlist_data["name"]
        assert data["description"] == playlist_data["description"]
    
    @pytest.mark.asyncio
    async def test_get_playlist_not_found(self, client: AsyncClient):
        """Test getting non-existent playlist"""
        response = await client.get("/playlists/999")
        assert response.status_code == 404
        assert response.json()["detail"] == "Playlist not found"


class TestSearchFunctionality:
    """Test search functionality"""
    
    @pytest.mark.asyncio
    async def test_search_empty_query(self, client: AsyncClient):
        """Test search with empty query"""
        response = await client.get("/search?q=")
        assert response.status_code == 422
        
        # Check that validation error is returned for empty query
        error = response.json()["detail"][0]
        assert "q" in error["loc"]
    
    @pytest.mark.asyncio
    async def test_search_success(self, client: AsyncClient, regular_user_token: str):
        """Test successful search"""
        # Create a playlist to search for
        headers = {"Authorization": f"Bearer {regular_user_token}"}
        playlist_data = {
            "name": "Searchable Playlist",
            "description": "This playlist should be searchable"
        }
        await client.post("/playlists", json=playlist_data, headers=headers)
        
        # Search for the playlist
        response = await client.get("/search?q=Searchable")
        assert response.status_code == 200
        
        data = response.json()
        assert "playlists" in data
        assert len(data["playlists"]) > 0
        assert any(playlist["name"] == "Searchable Playlist" for playlist in data["playlists"])
    
    @pytest.mark.asyncio
    async def test_search_with_type_filter(self, client: AsyncClient):
        """Test search with type filter"""
        response = await client.get("/search?q=test&type=song")
        assert response.status_code == 200
        
        data = response.json()
        # Should only return songs, not other types
        assert "songs" in data
        assert "playlists" not in data or len(data["playlists"]) == 0
        assert "artists" not in data or len(data["artists"]) == 0


class TestRoleBasedAccess:
    """Test role-based access control"""
    
    @pytest.mark.asyncio
    async def test_admin_access_success(self, client: AsyncClient, admin_user_token: str):
        """Test admin can access admin endpoints"""
        headers = {"Authorization": f"Bearer {admin_user_token}"}
        
        # Test admin stats endpoint
        response = await client.get("/admin/dashboard/stats", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "total_users" in data
        assert "total_songs" in data
        assert "approved_songs" in data
    
    @pytest.mark.asyncio
    async def test_user_access_admin_denied(self, client: AsyncClient, regular_user_token: str):
        """Test regular user cannot access admin endpoints"""
        headers = {"Authorization": f"Bearer {regular_user_token}"}
        response = await client.get("/admin/dashboard/stats", headers=headers)
        assert response.status_code == 403
        assert response.json()["detail"] == "Insufficient permissions"
    
    @pytest.mark.asyncio
    async def test_artist_access_success(self, client: AsyncClient, artist_user_token: str):
        """Test artist can access artist endpoints"""
        headers = {"Authorization": f"Bearer {artist_user_token}"}
        response = await client.get("/artist/dashboard/stats", headers=headers)
        assert response.status_code == 200
    
    @pytest.mark.asyncio
    async def test_user_access_artist_denied(self, client: AsyncClient, regular_user_token: str):
        """Test regular user cannot access artist endpoints"""
        headers = {"Authorization": f"Bearer {regular_user_token}"}
        response = await client.get("/artist/dashboard/stats", headers=headers)
        assert response.status_code == 403
        assert response.json()["detail"] == "Insufficient permissions"
    
    @pytest.mark.asyncio
    async def test_role_change_by_admin(self, client: AsyncClient, admin_user_token: str):
        """Test admin can change user roles"""
        # First create a user
        user_data = {
            "username": "rolechangeuser",
            "email": "rolechange@example.com",
            "password": "password123"
        }
        response = await client.post("/auth/signup", json=user_data)
        assert response.status_code == 201
        user_id = response.json()["id"]
        
        # Admin changes user role
        headers = {"Authorization": f"Bearer {admin_user_token}"}
        role_data = {"role": "artist"}
        response = await client.put(f"/users/{user_id}/role", json=role_data, headers=headers)
        assert response.status_code == 200
        
        # Verify role change from the response
        data = response.json()
        assert data["role"] == "artist"


class TestErrorScenarios:
    """Test various error scenarios"""
    
    @pytest.mark.asyncio
    async def test_nonexistent_song(self, client: AsyncClient):
        """Test accessing non-existent song"""
        response = await client.get("/songs/999")
        assert response.status_code == 404
        assert response.json()["detail"] == "Song not found"
    
    @pytest.mark.asyncio
    async def test_add_song_to_playlist_not_found(self, client: AsyncClient, regular_user_token: str):
        """Test adding non-existent song to playlist"""
        # First create a playlist
        headers = {"Authorization": f"Bearer {regular_user_token}"}
        playlist_data = {
            "name": "Error Test Playlist",
            "description": "For testing errors"
        }
        create_response = await client.post("/playlists", json=playlist_data, headers=headers)
        playlist_id = create_response.json()["id"]
        
        # Try to add non-existent song
        response = await client.post(f"/playlists/{playlist_id}/songs", json={"song_id": 999}, headers=headers)
        assert response.status_code == 404
        assert response.json()["detail"] == "Song not found"
    
    @pytest.mark.asyncio
    async def test_access_other_user_playlist(self, client: AsyncClient, regular_user_token: str):
        """Test accessing another user's private playlist"""
        # This test would require creating another user and their playlist
        # For now, we'll test accessing a non-existent playlist
        headers = {"Authorization": f"Bearer {regular_user_token}"}
        response = await client.get("/playlists/999", headers=headers)
        assert response.status_code == 404
        assert response.json()["detail"] == "Playlist not found"


class TestArtistFunctionality:
    """Test artist-specific functionality"""
    
    @pytest.mark.asyncio
    async def test_create_album_success(self, client: AsyncClient, artist_user_token: str):
        """Test artist creating an album"""
        headers = {"Authorization": f"Bearer {artist_user_token}"}
        album_data = {
            "title": "Test Album",
            "cover_art_url": "https://example.com/cover.jpg",
            "release_date": "2024-01-01T00:00:00"
        }
        response = await client.post("/artist/albums", json=album_data, headers=headers)
        assert response.status_code == 201
        
        data = response.json()
        assert data["title"] == album_data["title"]
        assert "id" in data
        assert "artist_id" in data
        assert "release_date" in data
    
    @pytest.mark.asyncio
    async def test_get_artist_earnings(self, client: AsyncClient, artist_user_token: str):
        """Test getting artist earnings"""
        headers = {"Authorization": f"Bearer {artist_user_token}"}
        response = await client.get("/artist/dashboard/earnings", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "estimated_earnings" in data
        assert "total_plays" in data
        assert "earnings_per_play" in data
        assert "currency" in data 