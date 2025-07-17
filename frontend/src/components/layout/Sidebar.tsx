import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FiHome, 
  FiSearch, 
  FiMusic, 
  FiHeart, 
  FiUser, 
  FiSettings,
  FiUpload,
  FiUsers,
  FiBarChart
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';

const SidebarContainer = styled.aside`
  width: 280px;
  height: 100vh;
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur-strong);
  border-right: 1px solid var(--glass-border);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  
  /* Hide scrollbar but maintain functionality */
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  
  &::-webkit-scrollbar {
    display: none; /* WebKit */
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(145deg, 
      rgba(99, 102, 241, 0.08) 0%, 
      rgba(139, 92, 246, 0.06) 50%, 
      rgba(217, 70, 239, 0.04) 100%);
    pointer-events: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 1px;
    height: 100%;
    background: linear-gradient(180deg, 
      transparent 0%, 
      var(--border-accent) 20%, 
      var(--border-accent) 80%, 
      transparent 100%);
    pointer-events: none;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-xl) var(--space-lg);
  position: relative;
  z-index: 2;
  justify-content: center;
  
  /* Music note icon */
  &::before {
    content: '♪';
    font-size: 2.5rem;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 900;
    display: flex;
    align-items: center;
    margin-right: var(--space-xs);
  }
  
  /* GSpotify text */
  span {
    font-size: 1.875rem;
    font-weight: 900;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.025em;
  }
  
  /* Animated underline */
  &::after {
    content: '';
    position: absolute;
    bottom: var(--space-md);
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: var(--primary-gradient);
    border-radius: var(--radius-full);
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  }
  
  /* Hover effects */
  transition: all var(--transition-normal);
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    
    &::before {
      animation: bounce 0.6s ease-in-out;
    }
    
    span {
      background: var(--primary-gradient-hover);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
`;

const Navigation = styled.nav`
  flex: 1;
  padding: var(--space-md) 0;
  position: relative;
  z-index: 2;
  
  /* Custom scrollbar for navigation content */
  &::-webkit-scrollbar {
    display: none;
  }
`;

const NavSection = styled.div`
  margin-bottom: var(--space-3xl);
  
  &:last-child {
    margin-bottom: var(--space-xl);
  }
`;

const SectionTitle = styled.h3`
  color: var(--text-tertiary);
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin: 0 var(--space-lg) var(--space-md) var(--space-lg);
  position: relative;
  transition: color var(--transition-normal);
  
  &:hover {
    color: var(--text-secondary);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 0;
    width: 40px;
    height: 2px;
    background: var(--accent-gradient);
    border-radius: var(--radius-full);
    transition: width var(--transition-normal);
  }
  
  &:hover::after {
    width: 60px;
  }
`;

const NavItem = styled(Link)<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  color: ${props => props.$isActive ? 'var(--text-white)' : 'var(--text-primary)'};
  text-decoration: none;
  transition: all var(--transition-normal);
  border-radius: ${props => props.$isActive ? '0 var(--radius-2xl) var(--radius-2xl) 0' : '0'};
  background: ${props => props.$isActive ? 'var(--primary-gradient)' : 'transparent'};
  margin: ${props => props.$isActive ? '0.375rem 0' : '0.125rem 0'};
  position: relative;
  font-weight: ${props => props.$isActive ? '700' : '600'};
  font-size: 0.95rem;
  box-shadow: ${props => props.$isActive ? 'var(--shadow-primary)' : 'none'};
  z-index: 1;

  &:hover {
    color: var(--text-white);
    background: ${props => props.$isActive ? 'var(--primary-gradient)' : 'var(--primary-gradient-hover)'};
    border-radius: 0 var(--radius-2xl) var(--radius-2xl) 0;
    box-shadow: var(--shadow-primary);
    transform: translateX(8px);
  }
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 0;
    background: var(--accent-gradient);
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    transition: height var(--transition-normal);
  }
  
  &:hover::before {
    height: 70%;
  }

  svg {
    font-size: 1.375rem;
    transition: all var(--transition-normal);
    filter: ${props => props.$isActive ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))' : 'none'};
  }
  
  &:hover svg {
    transform: scale(1.15) rotate(-2deg);
  }
  
  span {
    transition: all var(--transition-normal);
  }
  
  &:hover span {
    transform: translateX(2px);
  }
`;

const UserSection = styled.div`
  border-top: 1px solid var(--border-light);
  padding: var(--space-lg);
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur);
  margin: var(--space-md);
  border-radius: var(--radius-xl);
  position: relative;
  z-index: 2;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--primary-gradient-light);
    border-radius: var(--radius-xl);
    opacity: 0.5;
    z-index: -1;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
`;

const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: var(--accent-gradient);
    border-radius: 50%;
    z-index: -1;
    opacity: 0;
    transition: opacity var(--transition-normal);
  }
  
  &:hover {
    transform: scale(1.05);
    box-shadow: var(--shadow-accent);
  }
  
  &:hover::before {
    opacity: 0.2;
  }
`;

const UserDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--transition-normal);
  
  &:hover {
    color: var(--text-accent);
  }
`;

const UserRole = styled.p`
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-transform: capitalize;
  font-weight: 600;
  background: var(--secondary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const LogoutButton = styled.button`
  width: 100%;
  padding: var(--space-md);
  background: var(--danger-gradient);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  }
  
  &:hover::before {
    left: 100%;
  }

  &:active {
    transform: translateY(-1px);
  }
`;

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const isActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getNavItems = () => {
    const baseItems = [
      { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
      { path: '/search', icon: FiSearch, label: 'Search' },
      { path: '/browse', icon: FiMusic, label: 'Browse' },
      { path: '/liked-songs', icon: FiHeart, label: 'Liked Songs' },
      { path: '/playlists', icon: FiMusic, label: 'Playlists' },
    ];

    const userItems = [
      { path: '/profile', icon: FiUser, label: 'Profile' },
      { path: '/settings', icon: FiSettings, label: 'Settings' },
    ];

    const artistItems = user?.role === 'artist' ? [
      { path: '/artist/dashboard', icon: FiBarChart, label: 'Artist Dashboard' },
      { path: '/artist/upload', icon: FiUpload, label: 'Upload Song' },
    ] : [];

    const adminItems = user?.role === 'admin' ? [
      { path: '/admin/dashboard', icon: FiUsers, label: 'Admin Dashboard' },
      { path: '/admin/users', icon: FiUsers, label: 'Manage Users' },
      { path: '/admin/pending-songs', icon: FiMusic, label: 'Pending Songs' },
    ] : [];

    return { baseItems, userItems, artistItems, adminItems };
  };

  const { baseItems, userItems, artistItems, adminItems } = getNavItems();

  return (
    <SidebarContainer>
      <Logo>
        <span>GSpotify</span>
      </Logo>
      
      <Navigation>
        <NavSection>
          <SectionTitle>Discover</SectionTitle>
          {baseItems.map(item => (
            <NavItem 
              key={item.path} 
              to={item.path} 
              $isActive={isActive(item.path)}
            >
              <item.icon />
              <span>{item.label}</span>
            </NavItem>
          ))}
        </NavSection>

        {artistItems.length > 0 && (
          <NavSection>
            <SectionTitle>Artist Tools</SectionTitle>
            {artistItems.map(item => (
              <NavItem 
                key={item.path} 
                to={item.path} 
                $isActive={isActive(item.path)}
              >
                <item.icon />
                <span>{item.label}</span>
              </NavItem>
            ))}
          </NavSection>
        )}

        {adminItems.length > 0 && (
          <NavSection>
            <SectionTitle>Administration</SectionTitle>
            {adminItems.map(item => (
              <NavItem 
                key={item.path} 
                to={item.path} 
                $isActive={isActive(item.path)}
              >
                <item.icon />
                <span>{item.label}</span>
              </NavItem>
            ))}
          </NavSection>
        )}

        <NavSection>
          <SectionTitle>Personal</SectionTitle>
          {userItems.map(item => (
            <NavItem 
              key={item.path} 
              to={item.path} 
              $isActive={isActive(item.path)}
            >
              <item.icon />
              <span>{item.label}</span>
            </NavItem>
          ))}
        </NavSection>
      </Navigation>

      <UserSection>
        <UserInfo>
          <UserAvatar>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </UserAvatar>
          <UserDetails>
            <UserName>{user?.username || 'User'}</UserName>
            <UserRole>{user?.role || 'user'}</UserRole>
          </UserDetails>
        </UserInfo>
        <LogoutButton onClick={logout}>
          Sign Out
        </LogoutButton>
      </UserSection>
    </SidebarContainer>
  );
}; 