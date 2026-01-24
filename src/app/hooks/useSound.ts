import { useCallback } from 'react';
import { useGameStore } from '@/app/stores/useGameStore';

/**
 * Hook to play one-shot sound effects respecting the global mute state.
 * Returns a play function.
 */
export function useSound() {
  const { audioState } = useGameStore();

  const play = useCallback((audioPath: string, volume = 1.0) => {
    // Play sound unless fully muted (so sfx_only allows it)
    if (audioState === 'mute') return;

    const audio = new Audio(audioPath);
    audio.volume = volume;
    audio.play().catch((error) => {
      console.warn('Failed to play sound:', error);
    });
  }, [audioState]);

  return play;
}
