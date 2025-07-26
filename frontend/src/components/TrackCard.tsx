import React, { memo, useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiPlay, FiMusic } from 'react-icons/fi';
import { Song } from '../types';
import { formatTime } from '../utils/formatTime';

interface TrackCardProps {
  song: Song;
  index: number;
  onPlay: (song: Song) => void;
}

// Simplified entrance animation for better performance
const slideUpFade = keyframes`
  from {
    opacity: 0;
    transform: translate3d(0, 20px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

// Performance-optimized card - removed expensive backdrop-filter
const OptimizedSongCard = styled.div<{ delay: number }>`
  /* Beautiful colorful gradient background - much more aesthetic than white */
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
    border-radius: var(--radius-xl);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  cursor: pointer;
  overflow: hidden;
  box-shadow: 
    0 4px 6px rgba(99, 102, 241, 0.1),
    0 1px 3px rgba(139, 92, 246, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  
  /* Performance optimizations - only animate transform */
  transform: translate3d(0, 0, 0); /* Hardware acceleration */
  transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  /* Optimized entrance animation */
  opacity: 0;
  animation: ${slideUpFade} 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  animation-delay: ${props => Math.min(props.delay * 50, 600)}ms;

  /* Beautiful hover effects with more color */
  &:hover {
    transform: translate3d(0, -6px, 0);
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
    
    .play-button {
      opacity: 1;
      transform: scale(1);
    }
    
    .album-art {
      transform: scale(1.02);
    }
    
    .song-title {
      color: var(--text-accent);
    }
  }
  
  /* Modern accent border with primary gradient */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--primary-gradient);
    transform: scaleX(0);
    transition: transform 0.25s ease;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    z-index: 1;
  }
  
  &:hover::before {
    transform: scaleX(1);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    
    &:hover {
      transform: translate3d(0, -2px, 0);
    }
  }
`;

const SongHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
  position: relative;
  z-index: 1;
`;

const OptimizedAlbumArt = styled.img`
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  object-fit: cover;
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.1), 
    rgba(139, 92, 246, 0.08), 
    rgba(217, 70, 239, 0.1)
  );
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 2px 6px rgba(99, 102, 241, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  /* Only enable will-change when parent card is hovered for better performance */
  ${OptimizedSongCard}:hover & {
    will-change: transform;
    box-shadow: 
      0 6px 16px rgba(0, 0, 0, 0.12),
      0 3px 8px rgba(99, 102, 241, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
`;

const SongDetails = styled.div`
  flex: 1;
  min-width: 0;
  z-index: 2;
  position: relative;
`;

const OptimizedSongTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: var(--space-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
  letter-spacing: -0.025em;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9);
`;

const ArtistName = styled.p`
  color: #475569;
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.7);
`;

const OptimizedPlayButton = styled.button`
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
  opacity: 0;
  transform: scale(0.9);
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 
    var(--shadow-primary),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  z-index: 3;
  position: relative;

  &:hover {
    transform: scale(1.05);
    box-shadow: 
      var(--shadow-primary), 
      var(--shadow-md),
      0 0 0 1px rgba(255, 255, 255, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  svg {
    font-size: 1.2rem;
    margin-left: 2px;
  }
`;

const SongMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  margin-top: var(--space-md);
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;

  svg {
    font-size: 0.9rem;
    color: #7c3aed;
  }
`;

const OptimizedGenreTag = styled.span`
  background: var(--secondary-gradient);
  color: white;
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 
    var(--shadow-secondary),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 2;
`;

// Memoized component with improved performance
export const TrackCard = memo<TrackCardProps>(({ song, index, onPlay }) => {
  // Improved animation delay calculation for better distribution across large lists
  const animationDelay = useMemo(() => {
    // Use modulo for better distribution and prevent excessive delays
    const baseDelay = index % 12; // Stagger across 12 cards maximum
    return baseDelay + 1; // Add 1 to avoid 0 delay
  }, [index]);
  
  const handlePlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay(song);
  }, [onPlay, song]);

  const handleCardClick = useCallback(() => {
    onPlay(song);
  }, [onPlay, song]);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/placeholder-album.jpg';
  }, []);

  // Memoized duration formatting to prevent recalculations
  const formattedDuration = useMemo(() => 
    formatTime(song.duration_seconds) || '0:00', 
    [song.duration_seconds]
  );

  // Memoized cover image URL
  const coverImageUrl = useMemo(() => 
    song.cover_image_url || '/placeholder-album.jpg',
    [song.cover_image_url]
  );

  // Memoized artist name to prevent recalculations
  const artistName = useMemo(() => 
    song.artist_name || song.artist?.username || 'Unknown Artist',
    [song.artist_name, song.artist?.username]
  );

  // Memoized genre name to prevent recalculations
  const genreName = useMemo(() => 
    song.genre_name || song.genre?.name || 'Unknown',
    [song.genre_name, song.genre?.name]
  );

  return (
    <OptimizedSongCard 
      delay={animationDelay}
      onClick={handleCardClick}
    >
      <SongHeader>
        <OptimizedAlbumArt 
          className="album-art"
          src={coverImageUrl}
          alt={song.title}
          onError={handleImageError}
          loading="lazy"
          decoding="async"
        />
        <SongDetails>
          <OptimizedSongTitle className="song-title">
            {song.title}
          </OptimizedSongTitle>
          <ArtistName>
            {artistName}
          </ArtistName>
        </SongDetails>
        <OptimizedPlayButton className="play-button" onClick={handlePlay}>
          <FiPlay />
        </OptimizedPlayButton>
      </SongHeader>
      
      <SongMeta>
        <MetaItem>
          <FiMusic />
          {formattedDuration}
        </MetaItem>
        <OptimizedGenreTag>
          {genreName}
        </OptimizedGenreTag>
      </SongMeta>
    </OptimizedSongCard>
  );
});

TrackCard.displayName = 'TrackCard'; 