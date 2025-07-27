import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { 
  FiPlay, 
  FiPause, 
  FiSkipBack, 
  FiSkipForward, 
  FiVolume2, 
  FiRepeat, 
  FiShuffle,
  FiHeart,
  FiVolumeX,
  FiVolume1,
  FiMinus,
  FiMaximize2
} from 'react-icons/fi';
import { usePlayerStore } from '../../store/playerStore';
import { musicService } from '../../services/musicService';
import { formatTime } from '../../utils/formatTime';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

const PlayerContainer = styled.div<{ $isMinimized: boolean }>`
  position: fixed;
  z-index: 1000;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.12);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${props => props.$isMinimized ? `
    bottom: 24px;
    right: 24px;
    left: auto;
    top: auto;
    width: 320px;
    height: 80px;
    border-radius: var(--radius-xl);
    background: var(--glass-bg-strong);
    backdrop-filter: var(--glass-blur-strong);
    border: 1px solid var(--glass-border);
    padding: var(--space-md);
    transform: scale(0.95);
    
    &:hover {
      transform: scale(1);
      box-shadow: var(--shadow-xl);
    }
  ` : `
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: var(--glass-bg-strong);
    backdrop-filter: var(--glass-blur-strong);
    border-top: 1px solid var(--glass-border);
    padding: 0 var(--space-xl);
  `}
  
  display: flex;
  align-items: center;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, 
      rgba(99, 102, 241, 0.08) 0%, 
      rgba(139, 92, 246, 0.06) 30%,
      rgba(217, 70, 239, 0.04) 60%, 
      rgba(6, 182, 212, 0.06) 100%);
    pointer-events: none;
    border-radius: inherit;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--primary-gradient);
    opacity: 0.6;
    animation: musicPulse 2s ease-in-out infinite;
    border-radius: inherit;
  }
  
  @keyframes musicPulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
`;

const SongInfo = styled.div<{ $isMinimized: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.$isMinimized ? 'var(--space-sm)' : 'var(--space-lg)'};
  min-width: ${props => props.$isMinimized ? 'auto' : '320px'};
  flex: 1;
  position: relative;
  z-index: 2;
`;

const AlbumArt = styled.img<{ $isMinimized: boolean }>`
  width: ${props => props.$isMinimized ? '52px' : '72px'};
  height: ${props => props.$isMinimized ? '52px' : '72px'};
  border-radius: var(--radius-lg);
  object-fit: cover;
  background: var(--bg-secondary);
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-normal);
  position: relative;
  cursor: ${props => props.$isMinimized ? 'pointer' : 'default'};
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: var(--radius-lg);
    background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
    opacity: 0;
    transition: opacity var(--transition-normal);
  }
  
  &:hover {
    transform: scale(1.05) ${props => props.$isMinimized ? '' : 'rotate(1deg)'};
    box-shadow: var(--shadow-xl);
  }
  
  &:hover::after {
    opacity: 1;
  }
`;

const SongDetails = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
  gap: var(--space-xs);
`;

const SongTitle = styled.h4`
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all var(--transition-normal);
  cursor: pointer;
  position: relative;
  
  &:hover {
    color: var(--text-accent);
    transform: translateX(2px);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--accent-gradient);
    transition: width var(--transition-normal);
  }
  
  &:hover::after {
    width: 80%;
  }
`;

const ArtistName = styled.p`
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all var(--transition-normal);
  cursor: pointer;
  
  &:hover {
    color: var(--text-primary);
    transform: translateX(2px);
  }
`;

const LikeButton = styled.button`
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: var(--space-sm);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: var(--danger-gradient);
    opacity: 0;
    transform: scale(0.8);
    transition: all var(--transition-normal);
  }
  
  svg {
    position: relative;
    z-index: 1;
    font-size: 1.25rem;
    transition: all var(--transition-normal);
  }
  
  &:hover {
    color: #ef4444;
    transform: scale(1.1);
  }
  
  &:hover::before {
    opacity: 0.1;
    transform: scale(1);
  }
  
  &.liked {
    color: #ef4444;
    
    &::before {
      opacity: 0.15;
      transform: scale(1);
    }
    
    svg {
      animation: heartBeat 0.6s ease-in-out;
    }
  }
  
  @keyframes heartBeat {
    0%, 100% { transform: scale(1); }
    25% { transform: scale(1.2); }
    50% { transform: scale(1.1); }
    75% { transform: scale(1.15); }
  }
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  flex: 2;
  max-width: 640px;
  position: relative;
  z-index: 2;
  height: 100%;
`;

const ControlButtons = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-lg);
`;

const ControlButton = styled.button<{ $active?: boolean }>`
  background: ${props => props.$active ? 'var(--primary-gradient)' : 'none'};
  border: none;
  color: ${props => props.$active ? 'white' : 'var(--text-secondary)'};
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  font-size: 1.2rem;
  position: relative;
  box-shadow: ${props => props.$active ? 'var(--shadow-primary)' : 'none'};

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: ${props => props.$active ? 'var(--primary-gradient)' : 'var(--glass-bg)'};
    opacity: 0;
    transform: scale(0.8);
    transition: all var(--transition-normal);
  }

  &:hover {
    color: ${props => props.$active ? 'white' : 'var(--text-primary)'};
    transform: scale(1.1);
    box-shadow: ${props => props.$active ? 'var(--shadow-primary)' : 'var(--shadow-md)'};
  }
  
  &:hover::before {
    opacity: ${props => props.$active ? '0' : '1'};
    transform: scale(1);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }
  
  svg {
    position: relative;
    z-index: 1;
    transition: all var(--transition-normal);
  }
  
  &:hover svg {
    transform: ${props => props.$active ? 'rotate(5deg)' : 'scale(1.1)'};
  }
`;

const MainPlayButton = styled.button`
  background: var(--primary-gradient);
  border: none;
  color: white;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  font-size: 1.5rem;
  box-shadow: var(--shadow-primary);
  position: relative;
  overflow: hidden;

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
    transform: scale(1.08);
    box-shadow: var(--shadow-primary), var(--shadow-xl);
  }
  
  &:hover::before {
    opacity: 0.3;
    animation: ripple 0.6s ease-out;
  }

  &:active {
    transform: scale(0.98);
  }

  svg {
    margin-left: ${props => props.children?.toString().includes('Play') ? '3px' : '0'};
    transition: all var(--transition-normal);
    position: relative;
    z-index: 1;
  }
  
  @keyframes ripple {
    0% {
      transform: scale(0.8);
      opacity: 0.8;
    }
    100% {
      transform: scale(1.2);
      opacity: 0;
    }
  }
`;

const ProgressSection = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-md);
  width: 100%;
`;

const TimeDisplay = styled.span`
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  min-width: 45px;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.5px;
  transition: color var(--transition-normal);
  
  &:hover {
    color: var(--text-primary);
  }
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 8px;
  background: var(--border-medium);
  border-radius: var(--radius-full);
  position: relative;
  cursor: pointer;
  overflow: hidden;
  transition: all var(--transition-normal);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, 
      rgba(255, 255, 255, 0.1) 0%, 
      transparent 50%, 
      rgba(255, 255, 255, 0.05) 100%);
    border-radius: var(--radius-full);
  }
  
  &:hover {
    height: 10px;
    background: var(--border-strong);
  }
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background: var(--primary-gradient);
  border-radius: var(--radius-full);
  width: ${props => props.progress}%;
  transition: width 0.1s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    right: -8px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    box-shadow: var(--shadow-md);
    opacity: 0;
    transition: all var(--transition-normal);
    border: 2px solid transparent;
    background-clip: padding-box;
  }
  
  ${ProgressBar}:hover &::after {
    opacity: 1;
    box-shadow: var(--shadow-lg);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, 
      rgba(255, 255, 255, 0.2) 0%, 
      transparent 50%);
    border-radius: var(--radius-full);
    animation: shimmer 2s ease-in-out infinite;
  }
  
  @keyframes shimmer {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  }
`;

const VolumeSection = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-md);
  min-width: 320px;
  flex: 1;
  justify-content: flex-end;
  position: relative;
  z-index: 2;
`;

const VolumeButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--space-sm);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: var(--glass-bg);
    opacity: 0;
    transform: scale(0.8);
    transition: all var(--transition-normal);
  }

  &:hover {
    color: var(--text-primary);
    transform: scale(1.1);
  }
  
  &:hover::before {
    opacity: 1;
    transform: scale(1);
  }
  
  svg {
    font-size: 1.25rem;
    transition: all var(--transition-normal);
    position: relative;
    z-index: 1;
  }
`;

const VolumeSlider = styled.input`
  width: 120px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--border-medium);
  outline: none;
  cursor: pointer;
  transition: all var(--transition-normal);
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    box-shadow: var(--shadow-md);
    cursor: pointer;
    transition: all var(--transition-normal);
    border: 2px solid transparent;
    background-clip: padding-box;
  }
  
  &::-webkit-slider-thumb:hover {
    transform: scale(1.3);
    box-shadow: var(--shadow-lg);
    background: linear-gradient(white, white) padding-box,
                var(--primary-gradient) border-box;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    box-shadow: var(--shadow-md);
    cursor: pointer;
    border: none;
    transition: all var(--transition-normal);
  }
  
  &::-moz-range-thumb:hover {
    transform: scale(1.3);
    box-shadow: var(--shadow-lg);
  }
  
  &:hover {
    background: var(--border-strong);
  }
`;

const QueueButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.9rem;
  font-weight: 600;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: var(--radius-md);
    background: var(--glass-bg);
    opacity: 0;
    transition: all var(--transition-normal);
  }

  &:hover {
    color: var(--text-primary);
    transform: translateY(-1px);
  }
  
  &:hover::before {
    opacity: 1;
  }
  
  span {
    position: relative;
    z-index: 1;
  }
`;

const MinimizeButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--space-sm);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: var(--glass-bg);
    opacity: 0;
    transform: scale(0.8);
    transition: all var(--transition-normal);
  }

  &:hover {
    color: var(--text-primary);
    transform: scale(1.1);
  }
  
  &:hover::before {
    opacity: 1;
    transform: scale(1);
  }
  
  svg {
    font-size: 1rem;
    transition: all var(--transition-normal);
    position: relative;
    z-index: 1;
  }
`;

export const MusicPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  
  const {
    currentSong,
    isPlaying,
    duration,
    currentTime,
    volume,
    repeatMode,
    shuffleMode,
    queue,
    isMinimized,
    pauseSong,
    resumeSong,
    nextSong,
    previousSong,
    setCurrentTime,
    setDuration,
    setVolume,
    toggleRepeat,
    toggleShuffle,
    toggleMinimized
  } = usePlayerStore();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        nextSong();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSong, repeatMode, nextSong, setCurrentTime, setDuration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play();
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseSong();
    } else {
      resumeSong();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleLikeToggle = async () => {
    if (!currentSong || isLiking) return;
    
    try {
      setIsLiking(true);
      
      if (isLiked) {
        await api.delete(`/songs/${currentSong.id}/like`);
        setIsLiked(false);
        toast.success('Removed from liked songs');
      } else {
        await api.post(`/songs/${currentSong.id}/like`);
        setIsLiked(true);
        toast.success('Added to liked songs');
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast.error(error.response?.data?.detail || 'Failed to update like status');
    } finally {
      setIsLiking(false);
    }
  };

  // Check if current song is liked when song changes
  useEffect(() => {
    const checkIfLiked = async () => {
      if (!currentSong) {
        setIsLiked(false);
        return;
      }
      
      try {
        const response = await api.get('/users/me/liked-songs');
        const likedSongs = response.data;
        const isCurrentSongLiked = likedSongs.some((song: any) => song.id === currentSong.id);
        setIsLiked(isCurrentSongLiked);
      } catch (error) {
        console.error('Error checking like status:', error);
        setIsLiked(false);
      }
    };
    
    checkIfLiked();
  }, [currentSong]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <FiVolumeX />;
    if (volume < 0.5) return <FiVolume1 />;
    return <FiVolume2 />;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentSong) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/songs/${currentSong.id}/stream`}
        preload="metadata"
      />
      
      <PlayerContainer $isMinimized={isMinimized}>
        <SongInfo $isMinimized={isMinimized}>
          <AlbumArt
            $isMinimized={isMinimized}
            src={currentSong.cover_image_url || '/placeholder-album.jpg'}
            alt={currentSong.title}
            onClick={isMinimized ? toggleMinimized : undefined}
            onError={(e) => {
              e.currentTarget.src = '/placeholder-album.jpg';
            }}
          />
          {!isMinimized && (
            <>
              <SongDetails>
                <SongTitle>{currentSong.title}</SongTitle>
                <ArtistName>{currentSong.artist_name || 'Unknown Artist'}</ArtistName>
              </SongDetails>
              <LikeButton 
                className={isLiked ? 'liked' : ''}
                onClick={handleLikeToggle}
                disabled={isLiking}
              >
                <FiHeart />
              </LikeButton>
            </>
          )}
        </SongInfo>

        {isMinimized ? (
          // Minimized Controls - Compact layout with just play/pause and navigation
          <>
            <ControlButton onClick={previousSong} disabled={queue.length === 0}>
              <FiSkipBack />
            </ControlButton>
            
            <MainPlayButton onClick={handlePlayPause} style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
              {isPlaying ? <FiPause /> : <FiPlay />}
            </MainPlayButton>
            
            <ControlButton onClick={nextSong} disabled={queue.length === 0}>
              <FiSkipForward />
            </ControlButton>
            
            <MinimizeButton onClick={toggleMinimized}>
              <FiMaximize2 />
            </MinimizeButton>
          </>
        ) : (
          // Full Controls
          <>
            <Controls>
              <ControlButtons>
                <ControlButton $active={shuffleMode} onClick={toggleShuffle}>
                  <FiShuffle />
                </ControlButton>
                
                <ControlButton onClick={previousSong} disabled={queue.length === 0}>
                  <FiSkipBack />
                </ControlButton>
                
                <MainPlayButton onClick={handlePlayPause}>
                  {isPlaying ? <FiPause /> : <FiPlay />}
                </MainPlayButton>
                
                <ControlButton onClick={nextSong} disabled={queue.length === 0}>
                  <FiSkipForward />
                </ControlButton>
                
                <ControlButton $active={repeatMode !== 'none'} onClick={toggleRepeat}>
                  <FiRepeat />
                </ControlButton>
              </ControlButtons>

              <ProgressSection>
                <TimeDisplay>{formatTime(currentTime)}</TimeDisplay>
                <ProgressBar onClick={handleProgressClick}>
                  <ProgressFill progress={progress} />
                </ProgressBar>
                <TimeDisplay>{formatTime(duration)}</TimeDisplay>
              </ProgressSection>
            </Controls>

            <VolumeSection>
              <QueueButton>
                <span>Queue ({queue.length})</span>
              </QueueButton>
              
              <VolumeButton onClick={() => setVolume(volume === 0 ? 0.8 : 0)}>
                {getVolumeIcon()}
              </VolumeButton>
              
              <VolumeSlider
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
              />
              
              <MinimizeButton onClick={toggleMinimized}>
                <FiMinus />
              </MinimizeButton>
            </VolumeSection>
          </>
        )}
      </PlayerContainer>
    </>
  );
}; 