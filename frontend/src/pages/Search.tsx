import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { api } from '../services/api';
import { Song, User } from '../types';
import { FaSearch, FaPlay, FaUser, FaMusic } from 'react-icons/fa';

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
    content: '🔍';
    position: absolute;
    top: -0.5rem;
    right: -2.5rem;
    font-size: 2rem;
    opacity: 0.7;
    animation: pulse 2s ease-in-out infinite;
  }
`;

const SearchSection = styled.div`
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--space-xl);
  transition: all var(--transition-normal);
  
  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }
`;

const SearchInput = styled.div`
  position: relative;
  margin-bottom: var(--space-lg);
`;

const Input = styled.input`
  width: 100%;
  padding: var(--space-lg) var(--space-lg) var(--space-lg) 3.5rem;
  border: 2px solid var(--border-medium);
  border-radius: var(--radius-full);
  font-size: 1.125rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.9);
  color: var(--text-primary);
  transition: all var(--transition-normal);

  &:focus {
    outline: none;
    border-color: transparent;
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 0 0 3px var(--border-accent), var(--shadow-lg);
    transform: translateY(-2px);
  }
  
  &::placeholder {
    color: var(--text-tertiary);
    font-weight: 400;
  }
  
  &:hover:not(:focus) {
    border-color: var(--border-accent);
    background: rgba(255, 255, 255, 0.95);
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: var(--space-lg);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  font-size: 1.25rem;
  transition: all var(--transition-normal);
  
  ${Input}:focus + & {
    color: var(--text-accent);
    transform: translateY(-50%) scale(1.1);
  }
`;

const FilterTabs = styled.div`
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-xl);
  flex-wrap: wrap;
`;

const FilterTab = styled.button<{ active: boolean }>`
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

const ResultsSection = styled.div`
  margin-top: var(--space-xl);
  animation: slideInLeft 0.6s ease-out;
`;

const SectionTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-lg);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  letter-spacing: -0.025em;
  
  svg {
    color: var(--text-accent);
    font-size: 1.5rem;
    filter: drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3));
  }
`;

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
`;

const SongResult = styled.div`
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  transition: all var(--transition-normal);
  border: 1px solid var(--border-light);
  position: relative;
  overflow: hidden;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px) scale(1.01);
    box-shadow: var(--shadow-lg);
    border-color: var(--border-accent);
    
    .play-button {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--accent-gradient);
    transform: scaleX(0);
    transition: transform var(--transition-normal);
  }
  
  &:hover::before {
    transform: scaleX(1);
  }
`;

const SongInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SongTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
  transition: color var(--transition-normal);
  
  &:hover {
    color: var(--text-accent);
  }
`;

const SongDetails = styled.p`
  font-size: 0.95rem;
  color: var(--text-secondary);
  font-weight: 500;
`;

const PlayButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: var(--primary-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  opacity: 0;
  transform: scale(0.8);
  box-shadow: var(--shadow-primary);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    background: var(--primary-gradient);
    opacity: 0;
    transition: all var(--transition-normal);
  }

  &:hover {
    background: var(--primary-gradient-hover);
    transform: scale(1.1);
    box-shadow: var(--shadow-primary), var(--shadow-lg);
  }
  
  &:hover::before {
    opacity: 0.3;
    animation: ripple 0.6s ease-out;
  }
  
  svg {
    font-size: 1.2rem;
    margin-left: 2px;
  }
  
  @keyframes ripple {
    0% {
      transform: scale(0.8);
      opacity: 0.8;
    }
    100% {
      transform: scale(1.3);
      opacity: 0;
    }
  }
`;

const ArtistResult = styled.div`
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  transition: all var(--transition-normal);
  border: 1px solid var(--border-light);
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px) scale(1.01);
    box-shadow: var(--shadow-lg);
    border-color: var(--border-accent);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--secondary-gradient);
    transform: scaleX(0);
    transition: transform var(--transition-normal);
  }
  
  &:hover::before {
    transform: scaleX(1);
  }
`;

const ArtistAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--secondary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  
  &:hover {
    transform: scale(1.05);
    box-shadow: var(--shadow-secondary);
  }
`;

const ArtistInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ArtistName = styled.h4`
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
  transition: color var(--transition-normal);
  
  &:hover {
    color: var(--text-accent);
  }
`;

const ArtistType = styled.p`
  font-size: 0.95rem;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: capitalize;
`;

const EmptyState = styled.div`
  text-align: center;
  font-size: 1.125rem;
  padding: var(--space-3xl);
  margin: var(--space-xl) 0;
  
  /* Match the SearchSection glassmorphism styling */
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  
  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }
  
  h3 {
    color: var(--text-primary);
    font-weight: 700;
    font-size: 1.5rem;
    margin-bottom: var(--space-md);
  }
  
  p {
    color: var(--text-secondary);
    font-weight: 500;
  }
  
  &::before {
    content: '🎭';
    display: block;
    font-size: 3rem;
    margin-bottom: var(--space-lg);
    opacity: 0.7;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: var(--text-secondary);
  font-size: 1.125rem;
  padding: var(--space-xl);
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  
  .spinner {
    width: 36px;
    height: 36px;
    border: 3px solid var(--border-medium);
    border-top: 3px solid var(--text-accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto var(--space-md);
  }
`;

const NoResults = styled.div`
  text-align: center;
  color: var(--text-tertiary);
  font-size: 1rem;
  padding: var(--space-xl);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--border-medium);
  
  &::before {
    content: '🔍';
    display: block;
    font-size: 2rem;
    margin-bottom: var(--space-sm);
    opacity: 0.5;
  }
`;

type FilterType = 'all' | 'songs' | 'artists';

export const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = React.useCallback(async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setHasSearched(true);

      const searchParams = new URLSearchParams({ q: query });
      const response = await api.get(`/search?${searchParams}`);
      
      // The API returns {songs: [...], artists: [...], playlists: [...]}
      const searchResults = response.data;
      const songs = searchResults.songs || [];
      const artists = searchResults.artists || [];
      
      setSongs(songs);
      
      // Extract unique artists from songs and combine with direct artist results
      const artistsFromSongs = Array.from(
        new Map(songs.map((song: Song) => [song.artist?.id, song.artist]).filter(([, artist]: [any, any]) => artist))
          .values()
      ) as User[];
      
      const uniqueArtists = [...artists, ...artistsFromSongs].filter((artist, index, self) => 
        index === self.findIndex(a => a.id === artist.id)
      );
      
      setArtists(uniqueArtists);
    } catch (err: any) {
      console.error('Search error:', err);
      setSongs([]);
      setArtists([]);
      const errorMessage = err.response?.data?.detail || err.message || 'Search failed';
      // Log error but don't set it to state to avoid rendering objects
      console.error('Search error message:', typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [query]);

  // Remove auto-search useEffect - now only search on Enter key press
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };
  
  const handleClearSearch = () => {
    setQuery('');
    setSongs([]);
    setArtists([]);
    setHasSearched(false);
  };



  const handlePlay = (song: Song) => {
    console.log('Playing song:', song.title);
    // TODO: Integrate with music player
  };

  const handleArtistClick = (artist: User) => {
    console.log('Viewing artist:', artist.username);
    // TODO: Navigate to artist page
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredSongs = filter === 'all' || filter === 'songs' ? songs : [];
  const filteredArtists = filter === 'all' || filter === 'artists' ? artists : [];

  if (loading) {
    return (
      <LoadingMessage>
        <div className="spinner" />
        <h3>Searching...</h3>
        <p>Finding the perfect tracks for you</p>
      </LoadingMessage>
    );
  }

  return (
    <Container>
      <Title>Search</Title>
      
      <SearchSection>
        <SearchInput>
          <SearchIcon />
          <Input
            type="text"
            placeholder="Search for songs, artists, albums... (Press Enter to search)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </SearchInput>
        
        <FilterTabs>
          <FilterTab active={filter === 'all'} onClick={() => setFilter('all')}>
            <span>All</span>
          </FilterTab>
          <FilterTab active={filter === 'songs'} onClick={() => setFilter('songs')}>
            <span>Songs</span>
          </FilterTab>
          <FilterTab active={filter === 'artists'} onClick={() => setFilter('artists')}>
            <span>Artists</span>
          </FilterTab>
        </FilterTabs>
      </SearchSection>

      {!hasSearched && !query.trim() && (
        <EmptyState>
          <h3>Start Your Musical Journey</h3>
          <p>Start typing to search for music, artists, and more!</p>
        </EmptyState>
      )}

      {hasSearched && !loading && (
        <ResultsSection>
          {(filter === 'all' || filter === 'songs') && filteredSongs.length > 0 && (
            <>
              <SectionTitle>
                <FaMusic />
                Songs
              </SectionTitle>
              <ResultsList>
                {filteredSongs.map(song => (
                  <SongResult key={song.id}>
                    <SongInfo>
                      <SongTitle>{song.title}</SongTitle>
                      <SongDetails>
                        {song.artist?.username} • {song.genre?.name} • {formatDuration(song.duration_seconds)}
                      </SongDetails>
                    </SongInfo>
                    <PlayButton className="play-button" onClick={() => handlePlay(song)}>
                      <FaPlay />
                    </PlayButton>
                  </SongResult>
                ))}
              </ResultsList>
            </>
          )}

          {(filter === 'all' || filter === 'artists') && filteredArtists.length > 0 && (
            <>
              <SectionTitle>
                <FaUser />
                Artists
              </SectionTitle>
              <ResultsList>
                {filteredArtists.map(artist => (
                  <ArtistResult key={artist.id} onClick={() => handleArtistClick(artist)}>
                    <ArtistAvatar>
                      <FaUser />
                    </ArtistAvatar>
                    <ArtistInfo>
                      <ArtistName>{artist.username}</ArtistName>
                      <ArtistType>Artist</ArtistType>
                    </ArtistInfo>
                  </ArtistResult>
                ))}
              </ResultsList>
            </>
          )}

          {hasSearched && !loading && filteredSongs.length === 0 && filteredArtists.length === 0 && (
            <NoResults>
              <h3>No results found</h3>
              <p>No results found for "{query}". Try a different search term.</p>
            </NoResults>
          )}
        </ResultsSection>
      )}
    </Container>
  );
}; 