import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { api } from '../../services/api';
import { Album, Song } from '../../types';
import { useAuthStore } from '../../store/authStore';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 2rem;
  color: white;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
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

const AlbumsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const AlbumCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
`;

const AlbumCover = styled.div<{ coverUrl?: string }>`
  height: 200px;
  background: ${props => 
    props.coverUrl 
      ? `url(${props.coverUrl}) center/cover`
      : 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)'
  };
  position: relative;
`;

const AlbumInfo = styled.div`
  padding: 1.5rem;
`;

const AlbumTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
`;

const AlbumMeta = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
`;

const AlbumActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: #007bff;
          color: white;
          &:hover { background: #0056b3; }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover { background: #c82333; }
        `;
      default:
        return `
          background: #6c757d;
          color: white;
          &:hover { background: #545b62; }
        `;
    }
  }}
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  
  &:hover {
    color: #333;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
    border-color: #667eea;
  }
`;

const SubmitButton = styled.button`
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  padding: 3rem;
`;

interface AlbumFormData {
  title: string;
  cover_art_url?: string;
  release_date: string;
}

export const AlbumManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [formData, setFormData] = useState<AlbumFormData>({
    title: '',
    cover_art_url: '',
    release_date: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/albums?artist_id=${user.id}`);
      setAlbums(response.data || []);
      
    } catch (err: any) {
      console.error('Error loading albums:', err);
      setError('Failed to load albums');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlbum = () => {
    setEditingAlbum(null);
    setFormData({
      title: '',
      cover_art_url: '',
      release_date: ''
    });
    setShowModal(true);
  };

  const handleEditAlbum = (album: Album) => {
    setEditingAlbum(album);
    setFormData({
      title: album.title,
      cover_art_url: album.cover_art_url || '',
      release_date: album.release_date ? album.release_date.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDeleteAlbum = async (album: Album) => {
    if (!window.confirm(`Are you sure you want to delete "${album.title}"?`)) {
      return;
    }
    
    try {
      await api.delete(`/artist/albums/${album.id}`);
      setAlbums(albums.filter(a => a.id !== album.id));
    } catch (err: any) {
      console.error('Error deleting album:', err);
      setError(err.response?.data?.detail || 'Failed to delete album');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSubmitting(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        release_date: formData.release_date || undefined
      };

      if (editingAlbum) {
        const response = await api.put(`/artist/albums/${editingAlbum.id}`, submitData);
        setAlbums(albums.map(a => a.id === editingAlbum.id ? response.data : a));
      } else {
        const response = await api.post('/artist/albums', submitData);
        setAlbums([...albums, response.data]);
      }

      setShowModal(false);
      setFormData({ title: '', cover_art_url: '', release_date: '' });
      
    } catch (err: any) {
      console.error('Error saving album:', err);
      setError(err.response?.data?.detail || 'Failed to save album');
    } finally {
      setSubmitting(false);
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
        <LoadingMessage>Loading your albums...</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Album Management</Title>
        <Subtitle>Create and manage your music albums</Subtitle>
      </Header>

      <ActionsBar>
        <SectionTitle>Your Albums</SectionTitle>
        <CreateButton onClick={handleCreateAlbum}>
          + Create New Album
        </CreateButton>
      </ActionsBar>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {albums.length === 0 ? (
        <EmptyState>
          <h3 style={{ color: '#666', marginBottom: '0.5rem' }}>No albums created yet</h3>
          <p style={{ color: '#888' }}>Create your first album to organize your songs!</p>
        </EmptyState>
      ) : (
        <AlbumsGrid>
          {albums.map(album => (
            <AlbumCard key={album.id}>
              <AlbumCover coverUrl={album.cover_art_url} />
              <AlbumInfo>
                <AlbumTitle>{album.title}</AlbumTitle>
                <AlbumMeta>
                  {album.release_date && `Released ${new Date(album.release_date).getFullYear()}`}
                </AlbumMeta>
                <AlbumActions>
                  <ActionButton variant="primary" onClick={() => handleEditAlbum(album)}>
                    Edit
                  </ActionButton>
                  <ActionButton onClick={() => console.log('View songs for album:', album.id)}>
                    Songs
                  </ActionButton>
                  <ActionButton variant="danger" onClick={() => handleDeleteAlbum(album)}>
                    Delete
                  </ActionButton>
                </AlbumActions>
              </AlbumInfo>
            </AlbumCard>
          ))}
        </AlbumsGrid>
      )}

      {showModal && (
        <Modal onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {editingAlbum ? 'Edit Album' : 'Create New Album'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                ×
              </CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="title">Album Title *</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter album title"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="cover_art_url">Cover Art URL</Label>
                <Input
                  id="cover_art_url"
                  name="cover_art_url"
                  type="url"
                  value={formData.cover_art_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/cover.jpg"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="release_date">Release Date</Label>
                <Input
                  id="release_date"
                  name="release_date"
                  type="date"
                  value={formData.release_date}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <SubmitButton type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : (editingAlbum ? 'Update Album' : 'Create Album')}
              </SubmitButton>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};
