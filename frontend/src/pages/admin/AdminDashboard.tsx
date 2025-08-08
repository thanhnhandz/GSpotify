import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { api } from '../../services/api';
import { Song, User } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { FaUsers, FaMusic, FaClock, FaCheck, FaTimes, FaShieldAlt, FaEye, FaUserShield } from 'react-icons/fa';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: var(--danger-gradient);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  color: var(--text-white);
  margin-bottom: var(--space-xl);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.25);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
    transform: translateX(-100%);
    animation: shimmer 3s ease-in-out infinite;
    pointer-events: none;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    50% { transform: translateX(100%); }
    100% { transform: translateX(100%); }
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--space-md);
  color: var(--text-white);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 2;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  color: var(--text-white);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 2;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const StatIcon = styled.div<{ color: string }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.2rem;
`;

const StatValue = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.p`
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
`;

const TabBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #f0f0f0;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 1rem 1.5rem;
  border: none;
  background: none;
  color: ${props => props.active ? '#e74c3c' : '#666'};
  font-weight: 600;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? '#e74c3c' : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    color: #e74c3c;
  }
`;

const Table = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  background: #f8f9fa;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 120px;
  gap: 1rem;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
`;

const TableRow = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 120px;
  gap: 1rem;
  align-items: center;
  transition: background 0.2s ease;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const UserInfo = styled.div``;

const UserName = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
`;

const UserEmail = styled.p`
  font-size: 0.9rem;
  color: #666;
`;

const SongInfo = styled.div``;

const SongTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
`;

const SongMeta = styled.p`
  font-size: 0.9rem;
  color: #666;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => {
    switch (props.status) {
      case 'APPROVED':
      case 'active':
        return 'background: #d4edda; color: #155724;';
      case 'PENDING':
        return 'background: #fff3cd; color: #856404;';
      case 'REJECTED':
      case 'inactive':
        return 'background: #f8d7da; color: #721c24;';
      case 'artist':
        return 'background: #d1ecf1; color: #0c5460;';
      case 'admin':
        return 'background: #f8d7da; color: #721c24;';
      default:
        return 'background: #e9ecef; color: #6c757d;';
    }
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ variant?: 'approve' | 'reject' | 'ban' | 'view' }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => {
    switch (props.variant) {
      case 'approve':
        return 'background: #28a745; &:hover { transform: scale(1.1); }';
      case 'reject':
        return 'background: #dc3545; &:hover { transform: scale(1.1); }';
      case 'ban':
        return 'background: #6c757d; &:hover { transform: scale(1.1); }';
      case 'view':
      default:
        return 'background: #007bff; &:hover { transform: scale(1.1); }';
    }
  }}
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  padding: 3rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #e74c3c;
  font-size: 1.1rem;
  padding: 2rem;
  background: #ffeaea;
  border-radius: 8px;
  margin: 1rem 0;
`;

type TabType = 'overview' | 'pending-songs' | 'users';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArtists: 0,
    totalSongs: 0,
    pendingSongs: 0
  });
  const [pendingSongs, setPendingSongs] = useState<Song[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all data needed for admin dashboard
      const [usersResponse, songsResponse, pendingSongsResponse] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/songs'),
        api.get('/admin/songs/pending')
      ]);
      
      const allUsers = usersResponse.data;
      const allSongs = songsResponse.data;
      const pendingSongsData = pendingSongsResponse.data;
      
      setUsers(allUsers);
      setPendingSongs(pendingSongsData);
      
      // Calculate stats
      const totalArtists = allUsers.filter((u: User) => u.role === 'artist').length;
      
      setStats({
        totalUsers: allUsers.length,
        totalArtists,
        totalSongs: allSongs.length,
        pendingSongs: pendingSongsData.length
      });
      
    } catch (err: any) {
      console.error('Error loading admin data:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load admin data';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSong = async (songId: number) => {
    try {
      await api.post(`/admin/songs/${songId}/approve`);
      setPendingSongs(pendingSongs.filter(s => s.id !== songId));
      setStats(prev => ({ ...prev, pendingSongs: prev.pendingSongs - 1 }));
    } catch (err: any) {
      console.error('Error approving song:', err);
      alert(err.response?.data?.detail || 'Failed to approve song');
    }
  };

  const handleRejectSong = async (songId: number) => {
    try {
      await api.post(`/admin/songs/${songId}/reject`);
      setPendingSongs(pendingSongs.filter(s => s.id !== songId));
      setStats(prev => ({ ...prev, pendingSongs: prev.pendingSongs - 1 }));
    } catch (err: any) {
      console.error('Error rejecting song:', err);
      alert(err.response?.data?.detail || 'Failed to reject song');
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-status`);
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_active: !currentStatus } : u
      ));
    } catch (err: any) {
      console.error('Error toggling user status:', err);
      alert(err.response?.data?.detail || 'Failed to update user status');
    }
  };

  const handleChangeUserRole = async (userId: number, newRole: string) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    // Type validation
    if (newRole !== 'user' && newRole !== 'artist' && newRole !== 'admin') {
      alert('Invalid role selected');
      return;
    }

    const typedRole = newRole as 'user' | 'artist' | 'admin';

    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: typedRole } : u
      ));
      
      // Update stats if role changed to/from artist
      if (typedRole === 'artist' || users.find(u => u.id === userId)?.role === 'artist') {
        const newTotalArtists = users.filter(u => 
          u.id === userId ? typedRole === 'artist' : u.role === 'artist'
        ).length;
        setStats(prev => ({ ...prev, totalArtists: newTotalArtists }));
      }
    } catch (err: any) {
      console.error('Error changing user role:', err);
      alert(err.response?.data?.detail || 'Failed to change user role');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user || user.role !== 'admin') {
    return (
      <Container>
        <ErrorMessage>Access denied. Administrator privileges required.</ErrorMessage>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Loading admin dashboard...</LoadingMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Admin Dashboard</Title>
        <Subtitle>Manage users, moderate content, and monitor system health.</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatIcon color="var(--primary-gradient)">
            <FaUsers />
          </StatIcon>
          <StatValue>{stats.totalUsers}</StatValue>
          <StatLabel>Total Users</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon color="var(--success-gradient)">
            <FaUserShield />
          </StatIcon>
          <StatValue>{stats.totalArtists}</StatValue>
          <StatLabel>Artists</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon color="var(--danger-gradient)">
            <FaMusic />
          </StatIcon>
          <StatValue>{stats.totalSongs}</StatValue>
          <StatLabel>Total Songs</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon color="var(--warning-gradient)">
            <FaClock />
          </StatIcon>
          <StatValue>{stats.pendingSongs}</StatValue>
          <StatLabel>Pending Review</StatLabel>
        </StatCard>
      </StatsGrid>

      <TabBar>
        <Tab active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
          Overview
        </Tab>
        <Tab active={activeTab === 'pending-songs'} onClick={() => setActiveTab('pending-songs')}>
          Pending Songs ({stats.pendingSongs})
        </Tab>
        <Tab active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
          Users
        </Tab>
      </TabBar>

      {activeTab === 'pending-songs' && (
        <>
          {pendingSongs.length === 0 ? (
            <EmptyState>
              <FaClock size={48} style={{ color: '#ddd', marginBottom: '1rem' }} />
              <h3 style={{ color: '#666', marginBottom: '0.5rem' }}>No pending songs</h3>
              <p style={{ color: '#888' }}>All songs have been reviewed!</p>
            </EmptyState>
          ) : (
            <Table>
              <TableHeader>
                <div>Song</div>
                <div>Artist</div>
                <div>Genre</div>
                <div>Duration</div>
                <div>Actions</div>
              </TableHeader>
              
              {pendingSongs.map(song => (
                <TableRow key={song.id}>
                  <SongInfo>
                    <SongTitle>{song.title}</SongTitle>
                    <SongMeta>Uploaded {new Date(song.created_at).toLocaleDateString()}</SongMeta>
                  </SongInfo>
                  
                  <div>{song.artist?.username || 'Unknown'}</div>
                  <div>{song.genre?.name || 'Unknown'}</div>
                  <div>{formatDuration(song.duration_seconds)}</div>
                  
                  <ActionButtons>
                    <ActionButton variant="view">
                      <FaEye size={12} />
                    </ActionButton>
                    <ActionButton variant="approve" onClick={() => handleApproveSong(song.id)}>
                      <FaCheck size={12} />
                    </ActionButton>
                    <ActionButton variant="reject" onClick={() => handleRejectSong(song.id)}>
                      <FaTimes size={12} />
                    </ActionButton>
                  </ActionButtons>
                </TableRow>
              ))}
            </Table>
          )}
        </>
      )}

      {activeTab === 'users' && (
        <Table>
          <TableHeader>
            <div>User</div>
            <div>Role</div>
            <div>Status</div>
            <div>Joined</div>
            <div>Actions</div>
          </TableHeader>
          
          {users.map(user => (
            <TableRow key={user.id}>
              <UserInfo>
                <UserName>{user.username}</UserName>
                <UserEmail>{user.email}</UserEmail>
              </UserInfo>
              
              <div>
                <select 
                  value={user.role} 
                  onChange={(e) => handleChangeUserRole(user.id, e.target.value)}
                  style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    border: '1px solid #ddd',
                    backgroundColor: 'white',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="user">User</option>
                  <option value="artist">Artist</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div>
                <StatusBadge status={user.is_active ? 'active' : 'inactive'}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </StatusBadge>
              </div>
              
              <div>{new Date(user.created_at).toLocaleDateString()}</div>
              
              <ActionButtons>
                <ActionButton variant="view">
                  <FaEye size={12} />
                </ActionButton>
                <ActionButton 
                  variant="ban"
                  onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                  title={user.is_active ? 'Deactivate User' : 'Activate User'}
                >
                  <FaShieldAlt size={12} />
                </ActionButton>
              </ActionButtons>
            </TableRow>
          ))}
        </Table>
      )}

      {activeTab === 'overview' && (
        <EmptyState>
          <h3 style={{ color: '#666', marginBottom: '0.5rem' }}>System Overview</h3>
          <p style={{ color: '#888' }}>Use the tabs above to manage pending songs and users.</p>
        </EmptyState>
      )}
    </Container>
  );
}; 