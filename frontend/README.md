# GSpotify Frontend

A modern, responsive React.js frontend for the GSpotify music streaming platform.

## Features

- 🎵 **Modern Music Player** - Full-featured audio player with controls, queue management, and repeat/shuffle modes
- 🔐 **Authentication** - Secure login and signup with JWT token management
- 🎨 **Beautiful UI** - Modern, responsive design with styled-components
- 🔍 **Music Discovery** - Browse and search for songs, artists, and playlists
- 👤 **User Management** - Profile management, liked songs, and personal playlists
- 🎤 **Artist Features** - Upload songs, manage albums, and view analytics (for artists)
- 🛡️ **Admin Panel** - Content moderation and user management (for admins)
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **React 18** - Modern React with hooks and function components
- **TypeScript** - Type-safe development
- **Styled Components** - CSS-in-JS styling with theming
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **React Hook Form** - Form management and validation
- **React Hot Toast** - Beautiful notifications
- **Axios** - HTTP client for API communication
- **Howler.js** - Audio playback management
- **React Icons** - Beautiful icon library
- **Framer Motion** - Smooth animations

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── auth/            # Authentication forms
│   │   ├── layout/          # Layout components (Sidebar, etc.)
│   │   └── player/          # Music player components
│   ├── pages/               # Page components
│   │   ├── artist/          # Artist-specific pages
│   │   └── admin/           # Admin-specific pages
│   ├── services/            # API service layer
│   ├── store/               # State management (Zustand stores)
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main app component
│   └── index.tsx            # App entry point
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Running GSpotify backend API

### Setup Instructions

1. **Clone and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:8000
   ```

4. **Start the development server:**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## Usage

### For Regular Users

1. **Sign Up/Login** - Create an account or login with existing credentials
2. **Browse Music** - Explore songs, artists, and genres
3. **Create Playlists** - Organize your favorite music
4. **Like Songs** - Build your personal music library
5. **Search** - Find specific songs or artists
6. **Music Player** - Play, pause, skip, and control volume

### For Artists

1. **Artist Dashboard** - View analytics and manage your content
2. **Upload Music** - Upload new songs and albums
3. **Manage Content** - Edit song information and album details
4. **View Statistics** - See play counts, likes, and audience metrics

### For Administrators

1. **Admin Dashboard** - Overview of platform statistics
2. **Moderate Content** - Approve or reject submitted songs
3. **Manage Users** - Change user roles and manage accounts
4. **Platform Analytics** - View overall platform performance

## API Integration

The frontend integrates with the GSpotify backend API through a comprehensive service layer:

- **Authentication Service** - Handle login, signup, and token management
- **Music Service** - Manage songs, playlists, and music operations
- **User Service** - Profile management and user data
- **Artist Service** - Artist-specific functionality
- **Admin Service** - Administrative operations

## State Management

The application uses Zustand for state management with two main stores:

- **Auth Store** - User authentication and profile data
- **Player Store** - Music player state, queue, and playback controls

## Styling

The application uses styled-components for styling with:

- **Theme-based design** - Consistent color palette and spacing
- **Responsive breakpoints** - Mobile-first design approach
- **Component-scoped styles** - No CSS conflicts
- **Modern animations** - Smooth transitions and hover effects

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Code Style

- **TypeScript** - Strict type checking enabled
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting (recommended)
- **Conventional Commits** - Git commit message format

### Adding New Features

1. **Create TypeScript interfaces** in `src/types/`
2. **Add API services** in `src/services/`
3. **Create reusable components** in `src/components/`
4. **Add pages** in `src/pages/`
5. **Update routing** in `App.tsx`

## Performance Optimizations

- **Code Splitting** - Lazy loading of route components
- **Image Optimization** - Responsive images with proper sizing
- **Bundle Optimization** - Tree shaking and minification
- **Caching** - Service worker for offline functionality (production)

## Security Features

- **JWT Token Management** - Secure authentication flow
- **Route Protection** - Role-based access control
- **Input Validation** - Form validation and sanitization
- **XSS Protection** - Sanitized content rendering

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Deployment

### Production Build

```bash
npm run build
```

### Environment Variables for Production

```env
REACT_APP_API_URL=https://your-api-domain.com
```

### Deployment Options

- **Netlify** - Automatic deployments from Git
- **Vercel** - Serverless deployment platform
- **AWS S3 + CloudFront** - Static hosting with CDN
- **Docker** - Containerized deployment

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:

- Create an issue on GitHub
- Check the [API Documentation](../API_DOCUMENTATION.md)
- Review the [Backend README](../README.md)

## Roadmap

### Phase 1 (Current)
- ✅ Core authentication and routing
- ✅ Basic music player functionality
- ✅ User interface and navigation
- 🔄 Music discovery and search

### Phase 2 (Planned)
- 📝 Advanced playlist management
- 📝 Social features (following artists, sharing)
- 📝 Advanced search with filters
- 📝 Lyrics display integration

### Phase 3 (Future)
- 📝 Offline playback support
- 📝 Mobile app (React Native)
- 📝 Advanced analytics dashboard
- 📝 Real-time features (WebSocket integration)

---

**Built with ❤️ for music lovers** 