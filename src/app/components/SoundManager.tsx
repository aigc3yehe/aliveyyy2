import { useEffect, useRef } from 'react';
import { useGameStore } from '@/app/stores/useGameStore';
import bgmUrl from '@/assets/bgm00.MP3';

export function SoundManager() {
  const { audioState } = useGameStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      const audio = new Audio(bgmUrl);
      audio.loop = true;
      audio.volume = 0.25; // Default volume 25%
      audioRef.current = audio;
    }

    const audio = audioRef.current;

    // Handle play/pause based on audio state
    // Only play BGM if state is 'all'
    if (audioState === 'all') {
      // Browser autoplay policy might block this
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn('Audio autoplay failed:', error);
          // Auto-play might be blocked until user interaction
        });
      }
    } else {
      audio.pause();
    }

    // Cleanup on unmount
    return () => {
      audio.pause();
    };
  }, [audioState]);

  // Handle first interaction to unlock audio context if needed
  useEffect(() => {
    const unlockAudio = () => {
      if (audioRef.current && audioState === 'all' && audioRef.current.paused) {
        audioRef.current.play().catch(console.warn);
      }
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, [audioState]);

  return null; // Headless component
}
