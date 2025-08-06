import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { usePlayerStore } from '../store/playerStore';
import { musicService } from '../services/musicService';
import { Song } from '../types';
import { TrackCard } from '../components/TrackCard';
import { FiMusic, FiTrendingUp, FiStar, FiHeart, FiHeadphones } from 'react-icons/fi';

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

const WelcomeCard = styled.div`
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur-strong);
  border: 1px solid var(--glass-border);
  padding: var(--space-3xl);
  border-radius: var(--radius-2xl);
  margin-bottom: var(--space-3xl);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-2xl);
  transition: all var(--transition-normal);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-2xl), var(--shadow-primary);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--primary-gradient);
    opacity: 0.08;
    z-index: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -60%;
    right: -30%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
    border-radius: 50%;
    z-index: 1;
    animation: float 15s ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(20px, -20px) rotate(120deg); }
    66% { transform: translate(-20px, 10px) rotate(240deg); }
  }
`;

const WelcomeContent = styled.div`
  position: relative;
  z-index: 2;
`;

const WelcomeTitle = styled.h1`
  font-size: 3rem;
  font-weight: 900;
  margin-bottom: var(--space-lg);
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
  letter-spacing: -0.03em;
  
  @media (max-width: 768px) {
    font-size: 2.25rem;
  }
`;

const WelcomeText = styled.p`
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-xl);
  line-height: 1.7;
  font-weight: 500;
  max-width: 600px;
`;

const QuickActions = styled.div`
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: var(--space-md) var(--space-lg);
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: var(--accent-gradient);
    transition: left 0.5s ease;
    z-index: 1;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
    background: rgba(255, 255, 255, 0.6);
    color: white;
  }
  
  &:hover::before {
    left: 0;
  }
  
  svg, span {
    position: relative;
    z-index: 2;
    transition: all var(--transition-normal);
  }
  
  &:hover svg {
    transform: scale(1.1) rotate(5deg);
  }
`;

const Section = styled.section`
  margin-bottom: var(--space-3xl);
  animation: slideInLeft 0.6s ease-out;
  animation-fill-mode: both;
  
  &:nth-child(even) {
    animation: slideInRight 0.6s ease-out;
    animation-fill-mode: both;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
`;

const SectionTitle = styled.h2`
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--space-md);
  letter-spacing: -0.025em;
  
  svg {
    color: var(--text-accent);
    font-size: 2rem;
    filter: drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3));
  }
`;

const ViewAllButton = styled.button`
  padding: var(--space-sm) var(--space-lg);
  background: var(--accent-gradient);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-accent);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-accent), var(--shadow-lg);
    background: var(--accent-gradient-hover);
  }
  
  &:hover::before {
    left: 100%;
  }
`;

const SongGrid = styled.div`
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
  padding: var(--space-3xl);
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  margin: var(--space-xl) 0;
  box-shadow: var(--shadow-sm);
  
  svg {
    font-size: 3rem;
    margin-bottom: var(--space-lg);
    opacity: 0.7;
  }
  
  h3 {
    margin-bottom: var(--space-md);
    color: var(--text-primary);
  }
`;

export const Dashboard: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const { playSong } = usePlayerStore();

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      setLoading(true);
      const data = await musicService.getSongs();
      setSongs(data.slice(0, 12)); // Show only first 12 songs
    } catch (error: any) {
      console.error('Error loading songs:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to load songs';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (song: Song) => {
    playSong(song);
    toast.success(`Now playing: ${song.title}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>
          <div className="spinner" />
          <h3>Loading your musical world...</h3>
          <p>Please wait while we prepare your dashboard</p>
        </LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <WelcomeCard>
          <WelcomeContent>
            <WelcomeTitle>
              {getGreeting()}, {user?.username}! 🎵
            </WelcomeTitle>
            <WelcomeText>
              Welcome to your personal music universe. Discover new tracks, 
              create playlists, and let the rhythm guide your day.
            </WelcomeText>
            <QuickActions>
              <ActionButton>
                <FiTrendingUp />
                <span>Trending Now</span>
              </ActionButton>
              <ActionButton>
                <FiHeart />
                <span>Your Likes</span>
              </ActionButton>
              <ActionButton>
                <FiHeadphones />
                <span>Recently Played</span>
              </ActionButton>
            </QuickActions>
          </WelcomeContent>
        </WelcomeCard>
      </Header>

      <Section>
        <SectionHeader>
          <SectionTitle>
            <FiStar />
            Featured Tracks
          </SectionTitle>
          <ViewAllButton>View All</ViewAllButton>
        </SectionHeader>

        {songs.length === 0 ? (
          <EmptyState>
            <FiMusic />
            <h3>No songs available</h3>
            <p>Check back later for new music releases</p>
          </EmptyState>
        ) : (
          <SongGrid>
            {songs.map((song, index) => (
              <TrackCard
                key={song.id}
                song={song}
                index={index}
                onPlay={handlePlay}
              />
            ))}
          </SongGrid>
        )}
      </Section>
    </Container>
  );
}; 