import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { api } from '../../services/api';
import { Song } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { usePlayerStore } from '../../store/playerStore';
import { FaMusic, FaUpload, FaEye, FaPlay, FaEdit, FaTrash, FaClock, FaCheck, FaTimes } from 'react-icons/fa';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: var(--primary-gradient);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  color: var(--text-white);
  margin-bottom: var(--space-xl);
  box-shadow: var(--shadow-primary);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    transform: rotate(45deg);
    pointer-events: none;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--space-md);
  color: var(--text-white);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 2;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  color: var(--text-white);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
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

const ActionsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

const SongsTable = styled.div`
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

const StatusBadge = styled.span<{ status: 'PENDING' | 'APPROVED' | 'REJECTED' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => {
    switch (props.status) {
      case 'APPROVED':
        return 'background: #d4edda; color: #155724;';
      case 'PENDING':
        return 'background: #fff3cd; color: #856404;';
      case 'REJECTED':
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

const ActionButton = styled.button<{ variant?: 'edit' | 'delete' | 'play' }>`
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
      case 'edit':
        return 'background: #ffc107; &:hover { transform: scale(1.1); }';
      case 'delete':
        return 'background: #dc3545; &:hover { transform: scale(1.1); }';
      case 'play':
      default:
        return 'background: #28a745; &:hover { transform: scale(1.1); }';
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

export const ArtistDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [songs, setSongs] = useState<Song[]>([]);
  const [stats, setStats] = useState({
    totalSongs: 0,
    totalPlays: 0,
    pendingSongs: 0,
    approvedSongs: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArtistData();
  }, []);

  const loadArtistData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/artist/songs');
      const artistSongs = response.data;
      setSongs(artistSongs);
      
      // Calculate stats
      const totalPlays = artistSongs.reduce((sum: number, song: Song) => sum + song.play_count, 0);
      const pendingSongs = artistSongs.filter((song: Song) => song.status === 'PENDING').length;
      const approvedSongs = artistSongs.filter((song: Song) => song.status === 'APPROVED').length;
      
      setStats({
        totalSongs: artistSongs.length,
        totalPlays,
        pendingSongs,
        approvedSongs
      });
      
    } catch (err: any) {
      console.error('Error loading artist data:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load artist data';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (song: Song) => {
    const { playSong, setQueue } = usePlayerStore.getState();
    const approvedSongs = songs.filter(s => s.status === 'APPROVED');
    playSong(song);
    setQueue(approvedSongs);
  };

  const handleEdit = (song: Song) => {
    console.log('Editing song:', song.title);
    // TODO: Navigate to edit page
  };

  const handleDelete = async (song: Song) => {
    if (!window.confirm(`Are you sure you want to delete "${song.title}"?`)) {
      return;
    }
    
    try {
      await api.delete(`/artist/songs/${song.id}`);
      setSongs(songs.filter(s => s.id !== song.id));
      // Recalculate stats
      const updatedSongs = songs.filter(s => s.id !== song.id);
      const totalPlays = updatedSongs.reduce((sum, s) => sum + s.play_count, 0);
      const pendingSongs = updatedSongs.filter(s => s.status === 'PENDING').length;
      const approvedSongs = updatedSongs.filter(s => s.status === 'APPROVED').length;
      
      setStats({
        totalSongs: updatedSongs.length,
        totalPlays,
        pendingSongs,
        approvedSongs
      });
    } catch (err: any) {
      console.error('Error deleting song:', err);
      alert(err.response?.data?.detail || 'Failed to delete song');
    }
  };

  const handleUploadNew = () => {
    // TODO: Navigate to upload page
    console.log('Navigate to upload page');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <FaCheck />;
      case 'PENDING':
        return <FaClock />;
      case 'REJECTED':
        return <FaTimes />;
      default:
        return <FaClock />;
    }
  };

  if (!user || user.role !== 'artist') {
    return (
      <Container>
        <ErrorMessage>Access denied. Artist account required.</ErrorMessage>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Loading your artist dashboard...</LoadingMessage>
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
        <Title>Artist Dashboard</Title>
        <Subtitle>Welcome back, {user.username}! Manage your music and track your performance.</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatIcon color="var(--primary-gradient)">
            <FaMusic />
          </StatIcon>
          <StatValue>{stats.totalSongs}</StatValue>
          <StatLabel>Total Songs</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon color="var(--success-gradient)">
            <FaCheck />
          </StatIcon>
          <StatValue>{stats.approvedSongs}</StatValue>
          <StatLabel>Approved Songs</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon color="var(--warning-gradient)">
            <FaClock />
          </StatIcon>
          <StatValue>{stats.pendingSongs}</StatValue>
          <StatLabel>Pending Review</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon color="var(--accent-gradient)">
            <FaEye />
          </StatIcon>
          <StatValue>{stats.totalPlays}</StatValue>
          <StatLabel>Total Plays</StatLabel>
        </StatCard>
      </StatsGrid>

      <ActionsBar>
        <SectionTitle>Your Songs</SectionTitle>
        <UploadButton onClick={handleUploadNew}>
          <FaUpload />
          Upload New Song
        </UploadButton>
      </ActionsBar>

      {songs.length === 0 ? (
        <EmptyState>
          <FaMusic size={48} style={{ color: '#ddd', marginBottom: '1rem' }} />
          <h3 style={{ color: '#666', marginBottom: '0.5rem' }}>No songs uploaded yet</h3>
          <p style={{ color: '#888' }}>Upload your first song to get started!</p>
        </EmptyState>
      ) : (
        <SongsTable>
          <TableHeader>
            <div>Song</div>
            <div>Status</div>
            <div>Duration</div>
            <div>Plays</div>
            <div>Actions</div>
          </TableHeader>
          
          {songs.map(song => (
            <TableRow key={song.id}>
              <SongInfo>
                <SongTitle>{song.title}</SongTitle>
                <SongMeta>{song.genre?.name} • Uploaded {new Date(song.created_at).toLocaleDateString()}</SongMeta>
              </SongInfo>
              
              <div>
                <StatusBadge status={song.status}>
                  {getStatusIcon(song.status)} {song.status}
                </StatusBadge>
              </div>
              
              <div>{formatDuration(song.duration_seconds)}</div>
              
              <div>{song.play_count.toLocaleString()}</div>
              
              <ActionButtons>
                {song.status === 'APPROVED' && (
                  <ActionButton variant="play" onClick={() => handlePlay(song)}>
                    <FaPlay size={12} />
                  </ActionButton>
                )}
                <ActionButton variant="edit" onClick={() => handleEdit(song)}>
                  <FaEdit size={12} />
                </ActionButton>
                <ActionButton variant="delete" onClick={() => handleDelete(song)}>
                  <FaTrash size={12} />
                </ActionButton>
              </ActionButtons>
            </TableRow>
          ))}
        </SongsTable>
      )}
    </Container>
  );
}; 