import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Playlist } from '../types';
import { FaPlus, FaPlay, FaLock, FaGlobe, FaMusic, FaTrash, FaEdit } from 'react-icons/fa';
import { usePlayerStore } from '../store/playerStore';
import { toast } from 'react-hot-toast';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
`;

const CreateButton = styled.button`
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

const PlaylistsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const PlaylistCard = styled.div`
  /* Beautiful colorful gradient background - same as TrackCard */
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.15) 0%,
    rgba(139, 92, 246, 0.12) 25%,
    rgba(168, 85, 247, 0.1) 50%,
    rgba(139, 92, 246, 0.12) 75%,
    rgba(99, 102, 241, 0.15) 100%
  );
  
  /* Additional colorful overlay for depth */
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(6, 182, 212, 0.08) 0%,
      rgba(59, 130, 246, 0.06) 25%,
      rgba(99, 102, 241, 0.08) 50%,
      rgba(139, 92, 246, 0.06) 75%,
      rgba(217, 70, 239, 0.08) 100%
    );
    border-radius: 12px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 
    0 4px 6px rgba(99, 102, 241, 0.1),
    0 1px 3px rgba(139, 92, 246, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;

  &:hover {
    transform: translateY(-6px);
    border-color: rgba(99, 102, 241, 0.3);
    background: linear-gradient(
      135deg,
      rgba(99, 102, 241, 0.2) 0%,
      rgba(139, 92, 246, 0.18) 25%,
      rgba(168, 85, 247, 0.15) 50%,
      rgba(139, 92, 246, 0.18) 75%,
      rgba(99, 102, 241, 0.2) 100%
    );
    box-shadow: 
      0 12px 28px rgba(99, 102, 241, 0.15),
      0 6px 16px rgba(139, 92, 246, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.5);
      
    &::after {
      opacity: 1;
    }
  }
`;

const PlaylistHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const PlaylistInfo = styled.div`
  flex: 1;
  position: relative;
  z-index: 2;
`;

const PlaylistName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9);
`;

const PlaylistDescription = styled.p`
  font-size: 0.9rem;
  color: #475569;
  margin-bottom: 0.75rem;
  line-height: 1.4;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.7);
`;

const PlaylistMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 1rem;
  
  svg {
    color: #7c3aed;
  }
`;

const PrivacyIcon = styled.div<{ isPublic: boolean }>`
  color: ${props => props.isPublic ? '#1db954' : '#f39c12'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
  }

  &.delete {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  }
`;

const Modal = styled.div<{ show: boolean }>`
  display: ${props => props.show ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #1db954;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #1db954;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 1.2rem;
  height: 1.2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
    }
  ` : `
    background: #f8f9fa;
    color: #666;
    border: 2px solid #e0e0e0;
    
    &:hover {
      background: #e9ecef;
    }
  `}
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  padding: 2rem;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  padding: 3rem;
  background: #f8f9fa;
  border-radius: 12px;
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

export const Playlists: React.FC = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true
  });
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/playlists');
      setPlaylists(response.data);
    } catch (err: any) {
      console.error('Error loading playlists:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load playlists';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPlaylist) {
        // Update existing playlist
        const response = await api.put(`/playlists/${editingPlaylist.id}`, {
          name: formData.name,
          description: formData.description,
          is_public: formData.isPublic
        });
        
        setPlaylists(playlists.map(p => p.id === editingPlaylist.id ? response.data : p));
        toast.success('Playlist updated successfully');
      } else {
        // Create new playlist
        const response = await api.post('/playlists', {
          name: formData.name,
          description: formData.description,
          is_public: formData.isPublic
        });
        
        setPlaylists([response.data, ...playlists]);
        toast.success('Playlist created successfully');
      }
      
      setShowModal(false);
      setFormData({ name: '', description: '', isPublic: true });
      setEditingPlaylist(null);
    } catch (err: any) {
      console.error('Error saving playlist:', err);
      toast.error(err.response?.data?.detail || 'Failed to save playlist');
    }
  };

  const handlePlayPlaylist = async (playlist: Playlist) => {
    try {
      // Get playlist songs
      const response = await api.get(`/playlists/${playlist.id}/songs`);
      const songs = response.data;
      
      if (songs.length === 0) {
        toast.error('This playlist is empty');
        return;
      }
      
      // Play first song and set queue
      const { playSong, setQueue } = usePlayerStore.getState();
      playSong(songs[0]);
      setQueue(songs);
      
      toast.success(`Playing "${playlist.name}"`);
    } catch (error: any) {
      console.error('Error playing playlist:', error);
      toast.error(error.response?.data?.detail || 'Failed to play playlist');
    }
  };

  const handleEditPlaylist = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setFormData({
      name: playlist.name,
      description: playlist.description || '',
      isPublic: playlist.is_public
    });
    setShowModal(true);
  };

  const handleDeletePlaylist = async (playlist: Playlist) => {
    if (!window.confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
      return;
    }
    
    try {
      await api.delete(`/playlists/${playlist.id}`);
      setPlaylists(playlists.filter(p => p.id !== playlist.id));
      toast.success('Playlist deleted successfully');
    } catch (err: any) {
      console.error('Error deleting playlist:', err);
      toast.error(err.response?.data?.detail || 'Failed to delete playlist');
    }
  };

  const handleViewPlaylist = (playlist: Playlist) => {
    navigate(`/playlists/${playlist.id}`);
  };

  if (loading) {
    return (
      <Container>
        <Title>My Playlists</Title>
        <LoadingMessage>Loading your playlists...</LoadingMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>My Playlists</Title>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>My Playlists</Title>
        <CreateButton onClick={() => {
          setEditingPlaylist(null);
          setFormData({ name: '', description: '', isPublic: true });
          setShowModal(true);
        }}>
          <FaPlus />
          Create Playlist
        </CreateButton>
      </Header>

      {playlists.length === 0 ? (
        <EmptyState>
          You haven't created any playlists yet. Create your first playlist to get started!
        </EmptyState>
      ) : (
        <PlaylistsGrid>
          {playlists.map(playlist => (
            <PlaylistCard key={playlist.id} onClick={() => handleViewPlaylist(playlist)}>
              <PlaylistHeader>
                <PlaylistInfo>
                  <PlaylistName>{playlist.name}</PlaylistName>
                  {playlist.description && (
                    <PlaylistDescription>{playlist.description}</PlaylistDescription>
                  )}
                  <PlaylistMeta>
                    <PrivacyIcon isPublic={playlist.is_public}>
                      {playlist.is_public ? <FaGlobe /> : <FaLock />}
                    </PrivacyIcon>
                    <span>{playlist.is_public ? 'Public' : 'Private'}</span>
                    <span>•</span>
                    <FaMusic />
                    <span>{playlist.song_count} songs</span>
                  </PlaylistMeta>
                </PlaylistInfo>
                <ActionButtons>
                  <ActionButton onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPlaylist(playlist);
                  }}>
                    <FaPlay size={12} />
                  </ActionButton>
                  <ActionButton onClick={(e) => {
                    e.stopPropagation();
                    handleEditPlaylist(playlist);
                  }}>
                    <FaEdit size={12} />
                  </ActionButton>
                  <ActionButton 
                    className="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlaylist(playlist);
                    }}
                  >
                    <FaTrash size={12} />
                  </ActionButton>
                </ActionButtons>
              </PlaylistHeader>
            </PlaylistCard>
          ))}
        </PlaylistsGrid>
      )}

      <Modal show={showModal}>
        <ModalContent>
          <ModalTitle>{editingPlaylist ? 'Edit Playlist' : 'Create New Playlist'}</ModalTitle>
          <Form onSubmit={handleCreatePlaylist}>
            <FormGroup>
              <Label>Playlist Name</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter playlist name"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Description (Optional)</Label>
              <TextArea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe your playlist"
              />
            </FormGroup>
            
            <CheckboxGroup>
              <Checkbox
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
              />
              <Label>Make this playlist public</Label>
            </CheckboxGroup>
            
            <ButtonGroup>
              <Button type="button" onClick={() => {
                setShowModal(false);
                setEditingPlaylist(null);
                setFormData({ name: '', description: '', isPublic: true });
              }}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingPlaylist ? 'Update Playlist' : 'Create Playlist'}
              </Button>
            </ButtonGroup>
          </Form>
        </ModalContent>
      </Modal>
    </Container>
  );
}; 