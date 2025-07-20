import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { api } from '../services/api';
import { Song, Genre } from '../types';
import { TrackCard } from '../components/TrackCard';

const Container = styled.div`
  padding: var(--space-xl);
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  animation: fadeIn 0.6s ease-out;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: var(--space-xl);
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.03em;
  position: relative;
  
  &::after {
    content: '🎵';
    position: absolute;
    top: -0.5rem;
    right: -2.5rem;
    font-size: 2rem;
    opacity: 0.7;
    animation: bounce 2s ease-in-out infinite;
  }
`;

const FilterSection = styled.div`
  margin-bottom: var(--space-xl);
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  
  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }
`;

const FilterTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-lg);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  
  &::before {
    content: '🎛️';
    font-size: 1.25rem;
  }
`;

const GenreFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-bottom: var(--space-xl);
`;

const GenreButton = styled.button<{ active: boolean }>`
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-full);
  border: 2px solid ${props => props.active ? 'transparent' : 'var(--border-medium)'};
  background: ${props => props.active ? 'var(--primary-gradient)' : 'var(--bg-card)'};
  color: ${props => props.active ? 'white' : 'var(--text-primary)'};
  font-weight: ${props => props.active ? '700' : '600'};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  box-shadow: ${props => props.active ? 'var(--shadow-primary)' : 'var(--shadow-xs)'};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: var(--primary-gradient);
    transition: left 0.5s ease;
    z-index: 1;
  }

  &:hover {
    border-color: ${props => props.active ? 'transparent' : 'var(--border-accent)'};
    background: ${props => props.active ? 'var(--primary-gradient)' : 'var(--bg-card-hover)'};
    transform: translateY(-2px);
    box-shadow: ${props => props.active ? 'var(--shadow-primary)' : 'var(--shadow-md)'};
  }
  
  &:hover:not(.active)::before {
    left: 0;
  }
  
  span {
    position: relative;
    z-index: 2;
    transition: color var(--transition-normal);
  }
  
  &:hover:not(.active) span {
    color: white;
  }
`;

const SongsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-xl);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: var(--text-secondary);
  font-size: 1.125rem;
  padding: var(--space-3xl);
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  
  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid var(--border-medium);
    border-top: 4px solid var(--text-accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto var(--space-md);
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #ef4444;
  font-size: 1.125rem;
  padding: var(--space-xl);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-xl);
  margin: var(--space-md) 0;
  
  &::before {
    content: '⚠️';
    display: block;
    font-size: 2rem;
    margin-bottom: var(--space-md);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: var(--text-secondary);
  font-size: 1.125rem;
  padding: var(--space-3xl);
  background: var(--bg-card);
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

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-md);
  margin-top: var(--space-2xl);
  padding: var(--space-xl);
`;

const PaginationButton = styled.button<{ active?: boolean; disabled?: boolean }>`
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--border-light);
  background: ${props => props.active ? 'var(--primary-gradient)' : 'var(--bg-card)'};
  color: ${props => props.active ? 'white' : 'var(--text-primary)'};
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.5 : 1};

  &:hover:not(:disabled) {
    background: ${props => props.active ? 'var(--primary-gradient-hover)' : 'var(--bg-card-hover)'};
    border-color: var(--border-accent);
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  color: var(--text-secondary);
  font-weight: 600;
  margin: 0 var(--space-md);
`;

export const Browse: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const SONGS_PER_PAGE = 20; // Limit to 20 songs per page for optimal performance

  useEffect(() => {
    loadData();
  }, []);

  // Reset to first page when genre changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGenre]);

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

  // Memoized paginated songs for performance
  const paginatedSongs = useMemo(() => {
    const startIndex = (currentPage - 1) * SONGS_PER_PAGE;
    const endIndex = startIndex + SONGS_PER_PAGE;
    return filteredSongs.slice(startIndex, endIndex);
  }, [filteredSongs, currentPage, SONGS_PER_PAGE]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredSongs.length / SONGS_PER_PAGE);

  // Memoized play handler for performance
  const handlePlay = useCallback((song: Song) => {
    console.log('Playing song:', song.title);
    // TODO: Integrate with music player
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (loading) {
    return (
      <Container>
        <Title>Browse Music</Title>
        <LoadingMessage>
          <div className="spinner" />
          <h3>Loading music library...</h3>
          <p>Discovering amazing tracks for you</p>
        </LoadingMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>Browse Music</Title>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Browse Music</Title>
      
      <FilterSection>
        <FilterTitle>Filter by Genre</FilterTitle>
        <GenreFilters>
          <GenreButton 
            active={selectedGenre === null}
            onClick={() => setSelectedGenre(null)}
          >
            <span>All Genres</span>
          </GenreButton>
          {genres.map(genre => (
            <GenreButton
              key={genre.id}
              active={selectedGenre === genre.id}
              onClick={() => setSelectedGenre(genre.id)}
            >
              <span>{genre.name}</span>
            </GenreButton>
          ))}
        </GenreFilters>
      </FilterSection>

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
        <>
          <SongsGrid>
            {paginatedSongs.map((song, index) => (
              <TrackCard
                key={song.id}
                song={song}
                index={index}
                onPlay={handlePlay}
              />
            ))}
          </SongsGrid>

          {totalPages > 1 && (
            <PaginationContainer>
              <PaginationButton
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </PaginationButton>

              {/* Show page numbers */}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <PaginationButton
                    key={pageNum}
                    active={pageNum === currentPage}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </PaginationButton>
                );
              })}

              <PageInfo>
                {currentPage} of {totalPages} ({filteredSongs.length} songs)
              </PageInfo>

              <PaginationButton
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </PaginationButton>
            </PaginationContainer>
          )}
        </>
      )}
    </Container>
  );
};