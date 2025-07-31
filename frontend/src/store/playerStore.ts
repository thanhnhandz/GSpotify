import { create } from 'zustand';
import { Song } from '../types';

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  queue: Song[];
  currentIndex: number;
  repeatMode: 'none' | 'one' | 'all';
  shuffleMode: boolean;
  isMinimized: boolean;
  
  // Actions
  playSong: (song: Song) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  nextSong: () => void;
  previousSong: () => void;
  setQueue: (songs: Song[], startIndex?: number) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  toggleMinimized: () => void;
  clearQueue: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  duration: 0,
  currentTime: 0,
  volume: 0.8,
  queue: [],
  currentIndex: -1,
  repeatMode: 'none',
  shuffleMode: false,
  isMinimized: false,

  playSong: (song) => {
    set({ 
      currentSong: song, 
      isPlaying: true,
      currentTime: 0 
    });
  },

  pauseSong: () => {
    set({ isPlaying: false });
  },

  resumeSong: () => {
    set({ isPlaying: true });
  },

  nextSong: () => {
    const { queue, currentIndex, repeatMode, shuffleMode } = get();
    if (queue.length === 0) return;

    let nextIndex = currentIndex;
    
    if (shuffleMode) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          return;
        }
      }
    }

    set({
      currentIndex: nextIndex,
      currentSong: queue[nextIndex],
      isPlaying: true,
      currentTime: 0
    });
  },

  previousSong: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0) return;

    const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
    
    set({
      currentIndex: prevIndex,
      currentSong: queue[prevIndex],
      isPlaying: true,
      currentTime: 0
    });
  },

  setQueue: (songs, startIndex = 0) => {
    set({
      queue: songs,
      currentIndex: startIndex,
      currentSong: songs[startIndex] || null
    });
  },

  addToQueue: (song) => {
    const { queue } = get();
    set({ queue: [...queue, song] });
  },

  removeFromQueue: (index) => {
    const { queue, currentIndex } = get();
    const newQueue = queue.filter((_, i) => i !== index);
    const newCurrentIndex = index < currentIndex ? currentIndex - 1 : currentIndex;
    
    set({
      queue: newQueue,
      currentIndex: newCurrentIndex,
      currentSong: newQueue[newCurrentIndex] || null
    });
  },

  setCurrentTime: (time) => {
    set({ currentTime: time });
  },

  setDuration: (duration) => {
    set({ duration });
  },

  setVolume: (volume) => {
    set({ volume: Math.max(0, Math.min(1, volume)) });
  },

  toggleRepeat: () => {
    const { repeatMode } = get();
    const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all'];
    const currentModeIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    set({ repeatMode: nextMode });
  },

  toggleShuffle: () => {
    set((state) => ({ shuffleMode: !state.shuffleMode }));
  },

  toggleMinimized: () => {
    set((state) => ({ isMinimized: !state.isMinimized }));
  },

  clearQueue: () => {
    set({
      queue: [],
      currentIndex: -1,
      currentSong: null,
      isPlaying: false
    });
  },
})); 