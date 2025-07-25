import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { FiFilter, FiSearch } from 'react-icons/fi';
import { api } from '../services/api';
import { Song, Genre } from '../types';
import { TrackCard } from './TrackCard';

const Container = styled.div`
  padding: var(--space-xl);
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  animation: fadeIn 0.6s ease-out;
`;

const Header = styled.div`
  margin-bottom: var(--space-3xl);
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  background: var(--primary-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  margin-bottom: var(--space-xl);
  letter-spacing: -0.02em;
`;

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-2xl);
  flex-wrap: wrap;
`;

const GenreFilter = styled.div`
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
  flex: 1;
`;

const OptimizedGenreButton = styled.button<{ active: boolean }>`
  padding: var(--space-sm) var(--space-lg);
  border: 1px solid ${props => props.active ? 'var(--border-accent)' : 'var(--border-light)'};
  background: ${props => props.active ? 'var(--primary-gradient)' : 'var(--bg-card-light)'};
  color: ${props => props.active ? 'white' : 'var(--text-primary)'};
  border-radius: var(--radius-full);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, background-color, box-shadow;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    ${props => !props.active && 'border-color: var(--border-accent);'}
  }
`;

const SongsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: var(--space-xl);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-medium);
    border-top: 3px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: var(--text-secondary);
  font-size: 1.125rem;
  padding: var(--space-3xl);
  background: var(--bg-card-light);
  border-radius: var(--radius-xl);
  margin: var(--space-xl) 0;
  box-shadow: var(--shadow-sm);
  
  &::before {
    content: '🎭';
    display: block;
    font-size: 3rem;
    margin-bottom: var(--space-lg);
    opacity: 0.7;
  }
`;

export const OptimizedBrowse: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [songsResponse, genresResponse] = await Promise.all([
        api.get('/songs/?limit=100'),
        api.get('/genres')
      ]);
      
      setSongs(songsResponse.data);
      setGenres(genresResponse.data);
    } catch (err: any) {
      console.error('Error loading data:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load music data';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  // Memoized filtered songs for performance
  const filteredSongs = useMemo(() => 
    selectedGenre
      ? songs.filter(song => song.genre_id === selectedGenre)
      : songs,
    [songs, selectedGenre]
  );

  // Memoized play handler
  const handlePlay = useCallback((song: Song) => {
    console.log('Playing song:', song.title);
    // TODO: Integrate with music player
  }, []);

  const handleGenreSelect = useCallback((genreId: number | null) => {
    setSelectedGenre(genreId);
  }, []);

  if (loading) {
    return (
      <Container>
        <LoadingState>
          <div className="spinner" />
          <h3>Loading music library...</h3>
          <p>Please wait while we fetch the latest tracks</p>
        </LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <EmptyState>
          <h3>Error loading music</h3>
          <p>{error}</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Browse Music</Title>
        
        <FilterSection>
          <GenreFilter>
            <OptimizedGenreButton 
              active={selectedGenre === null}
              onClick={() => handleGenreSelect(null)}
            >
              All Genres
            </OptimizedGenreButton>
            {genres.map(genre => (
              <OptimizedGenreButton
                key={genre.id}
                active={selectedGenre === genre.id}
                onClick={() => handleGenreSelect(genre.id)}
              >
                {genre.name}
              </OptimizedGenreButton>
            ))}
          </GenreFilter>
        </FilterSection>
      </Header>

      {filteredSongs.length === 0 ? (
        <EmptyState>
          <h3>No songs found</h3>
          <p>
            {selectedGenre 
              ? `No songs available in this genre` 
              : 'No songs available at the moment'
            }
          </p>
        </EmptyState>
      ) : (
        <SongsGrid>
          {filteredSongs.map((song, index) => (
            <TrackCard 
              key={song.id}
              song={song}
              index={index}
              onPlay={handlePlay}
            />
          ))}
        </SongsGrid>
      )}
    </Container>
  );
}; 