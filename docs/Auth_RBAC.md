# Authentication & Role-Based Access Control

## Overview
GSpotify uses JWT-based stateless authentication with three user roles: `user`, `artist`, and `admin`.

## User Roles

### User (Default)
- Browse and search songs
- Create and manage playlists
- Like/unlike songs
- Stream approved music

### Artist
- All user permissions +
- Upload songs (pending approval)
- Manage personal albums
- View upload statistics

### Admin
- All permissions +
- Approve/reject pending songs
- Manage all users (activate/deactivate)
- Change user roles
- Force delete content

## Authentication Flow

### 1. Signup Process
```typescript
// Frontend: SignupForm.tsx
const signupData = {
  username: "john_doe",
  email: "john@example.com", 
  password: "securepass123",
  role: "user" | "artist"  // Optional, defaults to "user"
}

// POST /auth/signup
```

### 2. Login Process
```typescript
// Frontend: LoginForm.tsx
const loginData = {
  username: "john_doe",
  password: "securepass123"
}

// POST /auth/login
// Returns: { access_token: "jwt...", user: {...} }
```

### 3. Token Storage
```typescript
// Frontend: authService.ts
localStorage.setItem('access_token', authData.access_token);
localStorage.setItem('user', JSON.stringify(authData.user));
```

### 4. Token Usage
```typescript
// Frontend: api.ts interceptor
config.headers.Authorization = `Bearer ${token}`;
```

## Backend Authentication Guards

### Basic Authentication
```python
# app/auth.py
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Validates JWT and returns User object
```

### Role-Based Guards
```python
# Require specific role
def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def require_artist(current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ARTIST, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Artist access required") 
    return current_user
```

### Usage in Routes
```python
# app/routers/admin.py
@router.get("/users")
def list_users(admin_user: User = Depends(require_admin)):
    # Only admins can access

# app/routers/artist.py  
@router.post("/songs")
def upload_song(current_user: User = Depends(require_artist)):
    # Only artists and admins can access
```

## Frontend Route Protection

### Protected Route Component
```typescript
// App.tsx
<Route path="/admin/dashboard" element={
  <ProtectedRoute requireRole="admin">
    <AdminDashboard />
  </ProtectedRoute>
} />
```

### Implementation
```typescript
// ProtectedRoute logic in App.tsx
const ProtectedRoute = ({ children, requireRole }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requireRole && user?.role !== requireRole) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};
```

## State Management

### Auth Store (Zustand)
```typescript
// store/authStore.ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginData) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}
```

### Auto-login Check
```typescript
// App.tsx useEffect
useEffect(() => {
  checkAuth(); // Validates stored token on app load
}, []);
```

## JWT Token Details

### Token Structure
```json
{
  "sub": "username",
  "exp": 1640995200,
  "iat": 1640908800
}
```

### Token Expiration
- **Default**: 30 minutes
- **Refresh**: Manual re-login required
- **Storage**: localStorage (consider httpOnly cookies for production)

## Security Considerations

### Current Implementation
- JWT stored in localStorage
- No refresh token mechanism
- Password hashing with bcrypt
- Role validation on every protected endpoint

### Production Recommendations
- Move JWT to httpOnly cookies
- Implement refresh token rotation
- Add rate limiting
- Consider session timeout warnings
- Implement CSRF protection

## Common Auth Patterns

### Check User Role in Frontend
```typescript
const { user } = useAuthStore();
const isAdmin = user?.role === 'admin';
const isArtist = user?.role === 'artist' || user?.role === 'admin';
```

### Conditional Rendering
```typescript
{isAdmin && (
  <AdminDashboard />
)}

{isArtist && (
  <UploadSong />
)}
```

### API Error Handling
```typescript
// api.ts interceptor
if (error.response?.status === 401) {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}
```
