import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { api } from '../services/api';
import { Song } from '../types';
import { FaHeart, FaPlay, FaPlus, FaHeartBroken } from 'react-icons/fa';
import { usePlayerStore } from '../store/playerStore';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  border-radius: 16px;
  color: white;
`;

const HeartIcon = styled.div`
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const HeaderInfo = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
`;

const PlayAllButton = styled.button`
  padding: 0.75rem 2rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const SongsList = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const SongItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const SongNumber = styled.div`
  width: 30px;
  text-align: center;
  color: #888;
  font-size: 0.9rem;
`;

const SongInfo = styled.div`
  flex: 1;
  margin-left: 1rem;
`;

const SongTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
`;

const SongDetails = styled.p`
  font-size: 0.9rem;
  color: #666;
`;

const SongDuration = styled.span`
  color: #888;
  font-size: 0.9rem;
  margin-right: 1rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${SongItem}:hover & {
    opacity: 1;
  }
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

  &.unlike {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  }
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
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  color: #ddd;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h3`
  font-size: 1.3rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const EmptyDescription = styled.p`
  color: #888;
  font-size: 1rem;
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

export const LikedSongs: React.FC = () => {
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLikedSongs();
  }, []);

  const loadLikedSongs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/users/me/liked-songs');
      setLikedSongs(response.data);
    } catch (err: any) {
      console.error('Error loading liked songs:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load liked songs';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (song: Song) => {
    const { playSong, setQueue } = usePlayerStore.getState();
    playSong(song);
    setQueue(likedSongs);
  };

  const handlePlayAll = () => {
    if (likedSongs.length === 0) return;
    const { playSong, setQueue } = usePlayerStore.getState();
    playSong(likedSongs[0]);
    setQueue(likedSongs);
  };

  const handleUnlike = async (song: Song) => {
    try {
      await api.delete(`/songs/${song.id}/like`);
      setLikedSongs(likedSongs.filter(s => s.id !== song.id));
    } catch (err: any) {
      console.error('Error unliking song:', err);
      alert(err.response?.data?.detail || 'Failed to unlike song');
    }
  };

  const handleAddToPlaylist = (song: Song) => {
    console.log('Adding to playlist:', song.title);
    // TODO: Implement add to playlist functionality
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Loading your liked songs...</LoadingMessage>
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
        <HeartIcon>
          <FaHeart />
        </HeartIcon>
        <HeaderInfo>
          <Title>Liked Songs</Title>
          <Subtitle>{likedSongs.length} songs you've liked</Subtitle>
        </HeaderInfo>
        {likedSongs.length > 0 && (
          <PlayAllButton onClick={handlePlayAll}>
            <FaPlay />
            Play All
          </PlayAllButton>
        )}
      </Header>

      {likedSongs.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <FaHeartBroken />
          </EmptyIcon>
          <EmptyTitle>No liked songs yet</EmptyTitle>
          <EmptyDescription>
            Songs you like will appear here. Start exploring music and hit the heart button on your favorites!
          </EmptyDescription>
        </EmptyState>
      ) : (
        <SongsList>
          {likedSongs.map((song, index) => (
            <SongItem key={song.id}>
              <SongNumber>{index + 1}</SongNumber>
              <SongInfo>
                <SongTitle>{song.title}</SongTitle>
                <SongDetails>
                  {song.artist?.username || song.artist_name} • {song.genre?.name || song.genre_name}
                </SongDetails>
              </SongInfo>
              <SongDuration>
                {formatDuration(song.duration_seconds || song.duration || 0)}
              </SongDuration>
              <ActionButtons>
                <ActionButton onClick={() => handlePlay(song)}>
                  <FaPlay size={12} />
                </ActionButton>
                <ActionButton onClick={() => handleAddToPlaylist(song)}>
                  <FaPlus size={12} />
                </ActionButton>
                <ActionButton 
                  className="unlike"
                  onClick={() => handleUnlike(song)}
                >
                  <FaHeart size={12} />
                </ActionButton>
              </ActionButtons>
            </SongItem>
          ))}
        </SongsList>
      )}
    </Container>
  );
}; 