# GSpotify - System Overview

## Architecture Diagram

```
┌─────────────────┐    HTTP/REST    ┌──────────────────┐
│   React Frontend │ ◄──────────────► │  FastAPI Backend │
│   (Port 3000)   │                 │   (Port 8000)    │
└─────────────────┘                 └──────────────────┘
         │                                     │
         │                                     │
         ▼                                     ▼
┌─────────────────┐                 ┌──────────────────┐
│  Browser Audio  │                 │   PostgreSQL     │
│   HTML5 <audio> │                 │    Database      │
└─────────────────┘                 └──────────────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │  Local File      │
                                    │  Storage         │
                                    │  uploads/songs/  │
                                    │  uploads/covers/ │
                                    └──────────────────┘
```

## Tech Stack

### Backend
- **FastAPI** - Python web framework
- **PostgreSQL** - Primary database
- **SQLAlchemy** - ORM with Alembic migrations
- **JWT** - Stateless authentication
- **Pydantic** - Data validation
- **Local File Storage** - Audio/cover files

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Zustand** - State management
- **React Router** - Client-side routing
- **Styled Components** - CSS-in-JS
- **Axios** - HTTP client

## Folder Structure

```
GSpotify-BE/
├── app/                    # Backend application
│   ├── models/            # SQLAlchemy database models
│   ├── routers/           # FastAPI route handlers
│   ├── schemas/           # Pydantic request/response schemas
│   ├── auth.py           # JWT authentication logic
│   ├── database.py       # DB connection & session
│   ├── main.py           # FastAPI app entry point
│   └── local_file_service.py # File upload/storage
├── frontend/
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/        # Route-level page components
│       ├── services/     # API client functions
│       ├── store/        # Zustand state stores
│       ├── types/        # TypeScript interfaces
│       └── App.tsx       # Main app with routing
├── uploads/              # Local file storage
│   ├── songs/           # Audio files (.mp3)
│   └── covers/          # Album cover images
└── alembic/             # Database migrations
```

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL

### Backend Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp env.example .env
# Edit .env with your database URL

# Run migrations
alembic upgrade head

# Create admin user
python app/cli.py create-admin

# Start server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm start  # Runs on port 3000
```

## Environment Variables

### Backend (.env)
```bash
DATABASE_URL=postgresql://user:password@localhost/gspotify
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:8000
```

## Default Ports & URLs
- **Backend API**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:5432 (PostgreSQL)

## Key Features
- **Multi-role system**: User, Artist, Admin
- **Music streaming**: Local file storage with HTTP streaming
- **Playlist management**: Create, edit, add/remove songs
- **Artist uploads**: Song upload with admin approval workflow
- **Search & Browse**: Full-text search across songs and artists
- **Like system**: Personal liked songs collection
- **Admin panel**: User management and content moderation
