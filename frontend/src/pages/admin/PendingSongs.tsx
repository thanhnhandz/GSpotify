import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { api } from '../../services/api';
import { Song } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { FaMusic, FaClock, FaCheck, FaTimes, FaPlay, FaEye, FaCalendarAlt } from 'react-icons/fa';

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: var(--warning-gradient);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  color: var(--text-white);
  margin-bottom: var(--space-xl);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.25);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    bottom: -50%;
    left: 20%;
    width: 100px;
    height: 100px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    animation: bounce 2s ease-in-out infinite;
    pointer-events: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -30%;
    right: 10%;
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
    animation: bounce 2s ease-in-out infinite 0.5s;
    pointer-events: none;
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--space-md);
  color: var(--text-white);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
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

const ToolsBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  min-width: 300px;
  flex: 1;

  &:focus {
    outline: none;
    border-color: #f39c12;
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #f39c12;
  }
`;

const BulkActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const BulkButton = styled.button<{ variant?: 'approve' | 'reject' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  ${props => {
    switch (props.variant) {
      case 'approve':
        return `
          background: #27ae60;
          color: white;
          &:hover { background: #219a52; transform: translateY(-1px); }
        `;
      case 'reject':
        return `
          background: #e74c3c;
          color: white;
          &:hover { background: #c0392b; transform: translateY(-1px); }
        `;
      default:
        return `
          background: #6c757d;
          color: white;
          &:hover { background: #545b62; }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
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
  grid-template-columns: 40px 2fr 1fr 1fr 1fr 1fr 150px;
  gap: 1rem;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
  align-items: center;
`;

const TableRow = styled.div<{ selected?: boolean }>`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  display: grid;
  grid-template-columns: 40px 2fr 1fr 1fr 1fr 1fr 150px;
  gap: 1rem;
  align-items: center;
  transition: background 0.2s ease;
  background: ${props => props.selected ? '#fff3cd' : 'transparent'};

  &:hover {
    background: ${props => props.selected ? '#fff3cd' : '#f8f9fa'};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #f39c12;
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
  background: #fff3cd;
  color: #856404;
`;

const DurationBadge = styled.span`
  background: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ variant?: 'approve' | 'reject' | 'view' | 'play' | 'delete' }>`
  width: 28px;
  height: 28px;
  border-radius: 4px;
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
        return 'background: #27ae60; &:hover { transform: scale(1.1); background: #219a52; }';
      case 'reject':
        return 'background: #e74c3c; &:hover { transform: scale(1.1); background: #c0392b; }';
      case 'view':
        return 'background: #007bff; &:hover { transform: scale(1.1); background: #0056b3; }';
      case 'play':
        return 'background: #6f42c1; &:hover { transform: scale(1.1); background: #5a2d91; }';
      case 'delete':
        return 'background: #dc3545; &:hover { transform: scale(1.1); background: #c82333; }';
      default:
        return 'background: #6c757d; &:hover { transform: scale(1.1); }';
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

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
`;

const PaginationInfo = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PaginationButton = styled.button<{ active?: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: ${props => props.active ? '#f39c12' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background: ${props => props.active ? '#e67e22' : '#f8f9fa'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const PendingSongs: React.FC = () => {
  const { user } = useAuthStore();
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [selectedSongs, setSelectedSongs] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [songsPerPage] = useState(10);

  // Calculate stats
  const stats = {
    totalPending: songs.length,
    totalSelected: selectedSongs.length,
    thisWeek: songs.filter(s => {
      const songDate = new Date(s.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return songDate >= weekAgo;
    }).length,
    totalDuration: songs.reduce((sum, s) => sum + s.duration_seconds, 0)
  };

  useEffect(() => {
    loadPendingSongs();
  }, []);

  useEffect(() => {
    filterSongs();
  }, [songs, searchTerm, filterGenre]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPendingSongs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/songs/pending');
      setSongs(response.data);
    } catch (err: any) {
      console.error('Error loading pending songs:', err);
      setError(err.response?.data?.detail || 'Failed to load pending songs');
    } finally {
      setLoading(false);
    }
  };

  const filterSongs = () => {
    let filtered = [...songs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.artist?.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Genre filter
    if (filterGenre !== 'all') {
      filtered = filtered.filter(s => s.genre?.name === filterGenre);
    }

    setFilteredSongs(filtered);
    setCurrentPage(1);
  };

  const handleApproveSong = async (songId: number) => {
    try {
      await api.post(`/admin/songs/${songId}/approve`);
      setSongs(songs.filter(s => s.id !== songId));
      setSelectedSongs(selectedSongs.filter(id => id !== songId));
    } catch (err: any) {
      console.error('Error approving song:', err);
      alert(err.response?.data?.detail || 'Failed to approve song');
    }
  };

  const handleRejectSong = async (songId: number) => {
    try {
      await api.post(`/admin/songs/${songId}/reject`);
      setSongs(songs.filter(s => s.id !== songId));
      setSelectedSongs(selectedSongs.filter(id => id !== songId));
    } catch (err: any) {
      console.error('Error rejecting song:', err);
      alert(err.response?.data?.detail || 'Failed to reject song');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedSongs.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to approve ${selectedSongs.length} songs?`)) {
      return;
    }

    const promises = selectedSongs.map(songId => api.post(`/admin/songs/${songId}/approve`));
    
    try {
      await Promise.all(promises);
      setSongs(songs.filter(s => !selectedSongs.includes(s.id)));
      setSelectedSongs([]);
    } catch (err: any) {
      console.error('Error bulk approving songs:', err);
      alert('Failed to approve some songs. Please try again.');
    }
  };

  const handleBulkReject = async () => {
    if (selectedSongs.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to reject ${selectedSongs.length} songs?`)) {
      return;
    }

    const promises = selectedSongs.map(songId => api.post(`/admin/songs/${songId}/reject`));
    
    try {
      await Promise.all(promises);
      setSongs(songs.filter(s => !selectedSongs.includes(s.id)));
      setSelectedSongs([]);
    } catch (err: any) {
      console.error('Error bulk rejecting songs:', err);
      alert('Failed to reject some songs. Please try again.');
    }
  };

  const handleSelectSong = (songId: number, checked: boolean) => {
    if (checked) {
      setSelectedSongs([...selectedSongs, songId]);
    } else {
      setSelectedSongs(selectedSongs.filter(id => id !== songId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSongs(currentSongs.map(s => s.id));
    } else {
      setSelectedSongs([]);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTotalDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  // Get unique genres for filter
  const genres = Array.from(new Set(
    songs
      .map(s => s.genre?.name)
      .filter((name): name is string => Boolean(name))
  ));

  // Pagination
  const indexOfLastSong = currentPage * songsPerPage;
  const indexOfFirstSong = indexOfLastSong - songsPerPage;
  const currentSongs = filteredSongs.slice(indexOfFirstSong, indexOfLastSong);
  const totalPages = Math.ceil(filteredSongs.length / songsPerPage);

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
        <LoadingMessage>Loading pending songs...</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Pending Songs</Title>
        <Subtitle>Review and moderate song uploads waiting for approval</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatIcon color="var(--warning-gradient)">
            <FaClock />
          </StatIcon>
          <StatValue>{stats.totalPending}</StatValue>
          <StatLabel>Pending Review</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon color="var(--accent-gradient)">
            <FaCheck />
          </StatIcon>
          <StatValue>{stats.totalSelected}</StatValue>
          <StatLabel>Selected</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon color="var(--success-gradient)">
            <FaCalendarAlt />
          </StatIcon>
          <StatValue>{stats.thisWeek}</StatValue>
          <StatLabel>This Week</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon color="var(--primary-gradient)">
            <FaMusic />
          </StatIcon>
          <StatValue>{formatTotalDuration(stats.totalDuration)}</StatValue>
          <StatLabel>Total Duration</StatLabel>
        </StatCard>
      </StatsGrid>

      <ToolsBar>
        <SearchInput
          type="text"
          placeholder="Search by song title or artist..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <FilterSelect value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)}>
          <option value="all">All Genres</option>
          {genres.map(genre => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </FilterSelect>
        
        <BulkActions>
          <BulkButton 
            variant="approve" 
            onClick={handleBulkApprove}
            disabled={selectedSongs.length === 0}
          >
            <FaCheck size={12} />
            Approve Selected ({selectedSongs.length})
          </BulkButton>
          <BulkButton 
            variant="reject" 
            onClick={handleBulkReject}
            disabled={selectedSongs.length === 0}
          >
            <FaTimes size={12} />
            Reject Selected ({selectedSongs.length})
          </BulkButton>
        </BulkActions>
      </ToolsBar>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {currentSongs.length === 0 ? (
        <EmptyState>
          <FaClock size={48} style={{ color: '#ddd', marginBottom: '1rem' }} />
          <h3>No pending songs</h3>
          <p>All songs have been reviewed! Great job!</p>
        </EmptyState>
      ) : (
        <Table>
          <TableHeader>
            <div>
              <Checkbox
                type="checkbox"
                checked={selectedSongs.length === currentSongs.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </div>
            <div>Song</div>
            <div>Artist</div>
            <div>Genre</div>
            <div>Duration</div>
            <div>Uploaded</div>
            <div>Actions</div>
          </TableHeader>
          
          {currentSongs.map(song => (
            <TableRow 
              key={song.id} 
              selected={selectedSongs.includes(song.id)}
            >
              <div>
                <Checkbox
                  type="checkbox"
                  checked={selectedSongs.includes(song.id)}
                  onChange={(e) => handleSelectSong(song.id, e.target.checked)}
                />
              </div>
              
              <SongInfo>
                <SongTitle>{song.title}</SongTitle>
                <SongMeta>
                  <StatusBadge status="pending">Pending Review</StatusBadge>
                </SongMeta>
              </SongInfo>
              
              <div>{song.artist?.username || 'Unknown'}</div>
              <div>{song.genre?.name || 'Unknown'}</div>
              
              <div>
                <DurationBadge>{formatDuration(song.duration_seconds)}</DurationBadge>
              </div>
              
              <div>{new Date(song.created_at).toLocaleDateString()}</div>
              
              <ActionButtons>
                <ActionButton variant="view" title="View Details">
                  <FaEye size={12} />
                </ActionButton>
                <ActionButton variant="play" title="Preview Song">
                  <FaPlay size={10} />
                </ActionButton>
                <ActionButton 
                  variant="approve" 
                  onClick={() => handleApproveSong(song.id)}
                  title="Approve Song"
                >
                  <FaCheck size={12} />
                </ActionButton>
                <ActionButton 
                  variant="reject" 
                  onClick={() => handleRejectSong(song.id)}
                  title="Reject Song"
                >
                  <FaTimes size={12} />
                </ActionButton>
              </ActionButtons>
            </TableRow>
          ))}
          
          {totalPages > 1 && (
            <Pagination>
              <PaginationInfo>
                Showing {indexOfFirstSong + 1}-{Math.min(indexOfLastSong, filteredSongs.length)} of {filteredSongs.length} songs
              </PaginationInfo>
              
              <PaginationButtons>
                <PaginationButton 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </PaginationButton>
                
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <PaginationButton
                      key={pageNumber}
                      active={currentPage === pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </PaginationButton>
                  );
                })}
                
                <PaginationButton 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </PaginationButton>
              </PaginationButtons>
            </Pagination>
          )}
        </Table>
      )}
    </Container>
  );
}; 