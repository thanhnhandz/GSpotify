import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Playlist, Song } from '../types';
import { 
  FaPlay, 
  FaPlus, 
  FaTrash, 
  FaArrowLeft, 
  FaMusic, 
  FaGlobe, 
  FaLock,
  FaSearch,
  FaTimes
} from 'react-icons/fa';
import { usePlayerStore } from '../store/playerStore';
import { toast } from 'react-hot-toast';

const Container = styled.div`
  padding: var(--space-xl);
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
`;

const BackButton = styled.button`
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  color: var(--text-secondary);

  &:hover {
    background: var(--glass-bg-strong);
    color: var(--text-primary);
    transform: translateX(-2px);
  }
`;

const PlaylistInfo = styled.div`
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  margin-bottom: var(--space-xl);
  display: flex;
  align-items: center;
  gap: var(--space-xl);
`;

const PlaylistCover = styled.div`
  width: 200px;
  height: 200px;
  border-radius: var(--radius-lg);
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 4rem;
  box-shadow: var(--shadow-lg);
`;

const PlaylistDetails = styled.div`
  flex: 1;
`;

const PlaylistTitle = styled.h1`
  font-size: 3rem;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 var(--space-sm) 0;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const PlaylistMeta = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-md);
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin-bottom: var(--space-lg);
`;

const PlaylistDescription = styled.p`
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0 0 var(--space-lg) 0;
  line-height: 1.6;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--space-md);
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  border: none;
  border-radius: var(--radius-full);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  
  ${props => props.variant === 'primary' ? `
    background: var(--primary-gradient);
    color: white;
    box-shadow: var(--shadow-primary);
    
    &:hover {
      background: var(--primary-gradient-hover);
      transform: translateY(-2px);
      box-shadow: var(--shadow-primary), var(--shadow-xl);
    }
  ` : `
    background: var(--glass-bg);
    color: var(--text-primary);
    border: 1px solid var(--glass-border);
    
    &:hover {
      background: var(--glass-bg-strong);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
  `}
`;

const SongsSection = styled.div`
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const SongsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
`;

const SongItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
  cursor: pointer;
  
  &:hover {
    background: var(--glass-bg);
    transform: translateX(4px);
  }
`;

const SongCover = styled.img`
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  object-fit: cover;
  background: var(--bg-secondary);
`;

const SongInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SongTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--space-xs) 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SongArtist = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SongDuration = styled.span`
  color: var(--text-tertiary);
  font-size: 0.9rem;
  font-weight: 500;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: var(--space-sm);
  border-radius: 50%;
  transition: all var(--transition-normal);
  
  &:hover {
    color: var(--danger);
    background: rgba(239, 68, 68, 0.1);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--space-xxl);
  color: var(--text-secondary);
  
  svg {
    font-size: 4rem;
    margin-bottom: var(--space-lg);
    opacity: 0.5;
  }
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: var(--space-md);
  }
`;

const Modal = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur-strong);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--space-sm);
  border-radius: 50%;
  transition: all var(--transition-normal);
  
  &:hover {
    color: var(--text-primary);
    background: var(--glass-bg);
  }
`;

const SearchInput = styled.div`
  position: relative;
  margin-bottom: var(--space-lg);
`;

const SearchField = styled.input`
  width: 100%;
  padding: var(--space-md) var(--space-md) var(--space-md) 3rem;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-full);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--border-accent);
    box-shadow: 0 0 0 3px var(--border-accent-alpha);
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: var(--space-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: var(--space-xl);
  color: var(--text-secondary);
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: var(--danger);
  padding: var(--space-lg);
  background: var(--danger-bg);
  border-radius: var(--radius-lg);
  margin: var(--space-lg) 0;
`;

export const PlaylistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [addingToPlaylist, setAddingToPlaylist] = useState(false);

  const { playSong, setQueue } = usePlayerStore();

  useEffect(() => {
    if (id) {
      loadPlaylistData();
    }
  }, [id]);

  const loadPlaylistData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [playlistResponse, songsResponse] = await Promise.all([
        api.get(`/playlists/${id}`),
        api.get(`/playlists/${id}/songs`)
      ]);

      setPlaylist(playlistResponse.data);
      setSongs(songsResponse.data);
    } catch (err: any) {
      console.error('Error loading playlist:', err);
      setError(err.response?.data?.detail || 'Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSongs = async () => {
    try {
      const response = await api.get('/songs/?limit=100');
      // Filter out songs already in playlist
      const playlistSongIds = songs.map(song => song.id);
      const filtered = response.data.filter((song: Song) => !playlistSongIds.includes(song.id));
      setAvailableSongs(filtered);
    } catch (err: any) {
      console.error('Error loading available songs:', err);
      toast.error('Failed to load available songs');
    }
  };

  const handlePlayPlaylist = () => {
    if (songs.length === 0) {
      toast.error('This playlist is empty');
      return;
    }

    playSong(songs[0]);
    setQueue(songs);
    toast.success(`Playing "${playlist?.name}"`);
  };

  const handlePlaySong = (song: Song, index: number) => {
    playSong(song);
    setQueue(songs, index);
  };

  const handleRemoveSong = async (songId: number) => {
    if (!window.confirm('Remove this song from the playlist?')) {
      return;
    }

    try {
      await api.delete(`/playlists/${id}/songs/${songId}`);
      setSongs(songs.filter(song => song.id !== songId));
      toast.success('Song removed from playlist');
    } catch (err: any) {
      console.error('Error removing song:', err);
      toast.error(err.response?.data?.detail || 'Failed to remove song');
    }
  };

  const handleAddSong = async (song: Song) => {
    try {
      setAddingToPlaylist(true);
      await api.post(`/playlists/${id}/songs`, { song_id: song.id });
      setSongs([...songs, song]);
      setAvailableSongs(availableSongs.filter(s => s.id !== song.id));
      toast.success(`Added "${song.title}" to playlist`);
    } catch (err: any) {
      console.error('Error adding song:', err);
      toast.error(err.response?.data?.detail || 'Failed to add song');
    } finally {
      setAddingToPlaylist(false);
    }
  };

  const handleShowAddModal = () => {
    setShowAddModal(true);
    loadAvailableSongs();
  };

  const filteredAvailableSongs = availableSongs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Loading playlist...</LoadingMessage>
      </Container>
    );
  }

  if (error || !playlist) {
    return (
      <Container>
        <ErrorMessage>{error || 'Playlist not found'}</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/playlists')}>
          <FaArrowLeft />
        </BackButton>
      </Header>

      <PlaylistInfo>
        <PlaylistCover>
          <FaMusic />
        </PlaylistCover>
        <PlaylistDetails>
          <PlaylistTitle>{playlist.name}</PlaylistTitle>
          <PlaylistMeta>
            {playlist.is_public ? <FaGlobe /> : <FaLock />}
            <span>{playlist.is_public ? 'Public' : 'Private'}</span>
            <span>•</span>
            <span>{songs.length} songs</span>
            <span>•</span>
            <span>by {playlist.owner_name}</span>
          </PlaylistMeta>
          {playlist.description && (
            <PlaylistDescription>{playlist.description}</PlaylistDescription>
          )}
          <ActionButtons>
            <ActionButton variant="primary" onClick={handlePlayPlaylist}>
              <FaPlay />
              Play All
            </ActionButton>
            <ActionButton onClick={handleShowAddModal}>
              <FaPlus />
              Add Songs
            </ActionButton>
          </ActionButtons>
        </PlaylistDetails>
      </PlaylistInfo>

      <SongsSection>
        <SectionHeader>
          <SectionTitle>Songs</SectionTitle>
        </SectionHeader>

        {songs.length === 0 ? (
          <EmptyState>
            <FaMusic />
            <h3>No songs in this playlist</h3>
            <p>Add some songs to get started!</p>
          </EmptyState>
        ) : (
          <SongsList>
            {songs.map((song, index) => (
              <SongItem key={song.id} onClick={() => handlePlaySong(song, index)}>
                <SongCover
                  src={song.cover_image_url || '/placeholder-album.jpg'}
                  alt={song.title}
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-album.jpg';
                  }}
                />
                <SongInfo>
                  <SongTitle>{song.title}</SongTitle>
                  <SongArtist>{song.artist_name || 'Unknown Artist'}</SongArtist>
                </SongInfo>
                <SongDuration>{formatDuration(song.duration || 0)}</SongDuration>
                <RemoveButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSong(song.id);
                  }}
                >
                  <FaTimes />
                </RemoveButton>
              </SongItem>
            ))}
          </SongsList>
        )}
      </SongsSection>

      <Modal 
        show={showAddModal}
        onClick={() => setShowAddModal(false)}
      >
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>Add Songs to Playlist</ModalTitle>
            <CloseButton onClick={() => setShowAddModal(false)}>
              <FaTimes />
            </CloseButton>
          </ModalHeader>

          <SearchInput>
            <SearchIcon />
            <SearchField
              type="text"
              placeholder="Search for songs to add..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchInput>

          <SongsList>
            {filteredAvailableSongs.map((song) => (
              <SongItem key={song.id}>
                <SongCover
                  src={song.cover_image_url || '/placeholder-album.jpg'}
                  alt={song.title}
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-album.jpg';
                  }}
                />
                <SongInfo>
                  <SongTitle>{song.title}</SongTitle>
                  <SongArtist>{song.artist_name || 'Unknown Artist'}</SongArtist>
                </SongInfo>
                <ActionButton
                  onClick={() => handleAddSong(song)}
                  disabled={addingToPlaylist}
                >
                  <FaPlus />
                  Add
                </ActionButton>
              </SongItem>
            ))}
          </SongsList>

          {filteredAvailableSongs.length === 0 && (
            <EmptyState>
              <FaMusic />
              <h3>No songs found</h3>
              <p>Try a different search term</p>
            </EmptyState>
          )}
        </ModalContent>
      </Modal>
    </Container>
  );
};
