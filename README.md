# GSpotify - Quick Start Guide

## Prerequisites
- Python 3.9+
- Node.js 16+

## Setup & Run

### 1. Backend Setup
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup
```bash
# In a new terminal
cd frontend
npm install
npm start
```

## Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Test Accounts

### User Account
- **Username**: `testuser`
- **Password**: `test123`
- **Role**: User (can browse, search, create playlists, like songs)

### Artist Account
- **Username**: `artist`
- **Password**: `Hahaha3623!`
- **Role**: Artist (can upload songs + all user features)

### Admin Account
- **Username**: `lkn`
- **Password**: `admin123`
- **Role**: Admin (can manage users, approve songs + all features)

## Database
The project uses SQLite (`test_gspotify.db`) with pre-populated data. No database setup required if you have the `.env` and `test_gspotify.db` files.

## File Structure
```
GSpotify-BE/
├── app/                 # Backend code
├── frontend/           # React frontend
├── uploads/           # Local file storage (songs/covers)
├── test_gspotify.db   # SQLite database
├── .env              # Environment configuration
└── venv/             # Python virtual environment
```

## Troubleshooting

### Backend won't start
- Make sure virtual environment is activated: `source venv/bin/activate`
- Check if port 8000 is available: `lsof -i :8000`

### Frontend won't start
- Make sure you're in the frontend directory: `cd frontend`
- Check if port 3000 is available: `lsof -i :3000`

### Database issues
- If database errors occur, the SQLite file (`test_gspotify.db`) might be corrupted
- You can run migrations to recreate: `alembic upgrade head`

That's it! The application should be running with sample data and test accounts ready to use.
