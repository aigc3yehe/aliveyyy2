import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useGameStore } from '@/app/stores/useGameStore';
import { INTERACTION_ANIMATIONS, findAnimationForClick, InteractionAnimation } from '@/app/config/interactionAnimations';

// Decoration layer types
export type DecorationLayer = 'background' | 'holographic' | 'photo' | 'player' | 'bed' | 'stove';

// Available variants for each layer
export type BedVariant = 'default' | 'doll';
export type PlayerVariant = 'default' | 'player2';
export type BedAnimVariant = 'default' | 'doll' | 'fk01' | 'fk02';
export type DefaultVariant = 'default';

export interface DecorationConfig {
  background: DefaultVariant;
  holographic: DefaultVariant;
  photo: DefaultVariant;
  player: DefaultVariant;
  bed: BedVariant;
  stove: DefaultVariant;
}

// Layer overrides during animation (can use any asset key)
export type LayerOverrides = Partial<Record<DecorationLayer, string>>;

interface DecorationState {
  config: DecorationConfig;
  isLoading: boolean;
  lastFetchTime: number | null;
  
  // Animation state
  isAnimating: boolean;
  layerOverrides: LayerOverrides;
  
  // Actions
  setDecoration: <K extends DecorationLayer>(layer: K, variant: DecorationConfig[K]) => void;
  fetchDecorations: () => Promise<void>;
  resetToDefaults: () => void;
  
  // Animation actions
  handleLayerClick: (layer: DecorationLayer) => void;
  setLayerOverride: (layer: DecorationLayer, asset: string) => void;
  clearLayerOverride: (layer: DecorationLayer) => void;
  clearAllOverrides: () => void;
  setIsAnimating: (value: boolean) => void;
}

const DEFAULT_CONFIG: DecorationConfig = {
  background: 'default',
  holographic: 'default',
  photo: 'default',
  player: 'default',
  bed: 'default',
  stove: 'default',
};

const STORAGE_KEY = 'alive_decoration_config';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Load cached config from localStorage
const loadCachedConfig = (): { config: DecorationConfig; timestamp: number } | null => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn('Failed to load decoration cache:', e);
  }
  return null;
};

// Save config to localStorage
const saveCachedConfig = (config: DecorationConfig) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      config,
      timestamp: Date.now(),
    }));
  } catch (e) {
    console.warn('Failed to save decoration cache:', e);
  }
};

// Animation playback helper
function playAnimationSequence(
  animation: InteractionAnimation,
  setOverride: (layer: DecorationLayer, asset: string) => void,
  clearOverride: (layer: DecorationLayer) => void,
  onComplete: () => void
) {
  // Group keyframes by layer and schedule them
  const layerTimelines: Record<string, { asset: string; startTime: number; endTime: number }[]> = {};
  
  // Build timelines for each layer
  for (const keyframe of animation.sequence) {
    if (!layerTimelines[keyframe.layer]) {
      layerTimelines[keyframe.layer] = [];
    }
    const timeline = layerTimelines[keyframe.layer];
    const startTime = timeline.length > 0 
      ? timeline[timeline.length - 1].endTime 
      : 0;
    timeline.push({
      asset: keyframe.asset,
      startTime,
      endTime: startTime + keyframe.duration,
    });
  }
  
  // Schedule all keyframe changes
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  let maxEndTime = 0;
  
  for (const [layer, frames] of Object.entries(layerTimelines)) {
    for (const frame of frames) {
      // Schedule start of this frame
      timeouts.push(setTimeout(() => {
        setOverride(layer as DecorationLayer, frame.asset);
      }, frame.startTime));
      
      maxEndTime = Math.max(maxEndTime, frame.endTime);
    }
    
    // Schedule clearing of this layer at the end
    const layerEndTime = frames[frames.length - 1].endTime;
    timeouts.push(setTimeout(() => {
      clearOverride(layer as DecorationLayer);
    }, layerEndTime));
  }
  
  // Schedule completion callback
  timeouts.push(setTimeout(() => {
    onComplete();
  }, maxEndTime));
  
  return () => {
    timeouts.forEach(t => clearTimeout(t));
  };
}

export const useDecorationStore = create<DecorationState>((set, get) => {
  // Try to load from cache on store initialization
  const cached = loadCachedConfig();
  const initialConfig = cached?.config || DEFAULT_CONFIG;
  const initialFetchTime = cached?.timestamp || null;

  return {
    config: initialConfig,
    isLoading: !cached, // Loading if no cache
    lastFetchTime: initialFetchTime,
    
    // Animation state
    isAnimating: false,
    layerOverrides: {},

    setDecoration: (layer, variant) => {
      const newConfig = {
        ...get().config,
        [layer]: variant,
      };
      set({ config: newConfig });
      saveCachedConfig(newConfig);
    },

    fetchDecorations: async () => {
      const state = get();
      
      // Check if cache is still valid
      if (state.lastFetchTime && Date.now() - state.lastFetchTime < CACHE_DURATION) {
        set({ isLoading: false });
        return;
      }

      set({ isLoading: true });

      try {
        // TODO: Replace with actual API call
        // Mock server request - simulates fetching user's decoration config
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock response - in production this would come from server
        const serverConfig: DecorationConfig = {
          ...DEFAULT_CONFIG,
          // Server could return user's saved preferences here
        };

        set({
          config: serverConfig,
          isLoading: false,
          lastFetchTime: Date.now(),
        });
        saveCachedConfig(serverConfig);
      } catch (error) {
        console.error('Failed to fetch decorations:', error);
        set({ isLoading: false });
      }
    },

    resetToDefaults: () => {
      set({ config: DEFAULT_CONFIG });
      saveCachedConfig(DEFAULT_CONFIG);
    },
    
    // Animation actions
    handleLayerClick: (layer: DecorationLayer) => {
      const state = get();
      
      console.log('[Animation Debug] Layer clicked:', layer);
      console.log('[Animation Debug] Current config:', state.config);
      console.log('[Animation Debug] isAnimating:', state.isAnimating);
      
      // Prevent re-triggering during animation
      if (state.isAnimating) {
        console.log('[Animation Debug] Animation already playing, ignoring click');
        return;
      }
      
      // Find matching animation
      const animation = findAnimationForClick(layer, state.config as Record<DecorationLayer, string>);
      console.log('[Animation Debug] Found animation:', animation?.id || 'NONE');
      
      if (!animation) {
        console.log('[Animation Debug] No animation found for this layer/config combination');
        return;
      }
      
      // Start animation
      console.log('[Animation Debug] Starting animation:', animation.id);
      set({ isAnimating: true });

      // Play sound if defined and not muted
      if (animation.soundAsset) {
        const { audioState } = useGameStore.getState();
        if (audioState !== 'mute') {
          const audio = new Audio(animation.soundAsset);
          audio.volume = 1.0;
          audio.play().catch(e => console.warn('Animation sound failed:', e));
        }
      }
      
      playAnimationSequence(
        animation,
        (l, asset) => get().setLayerOverride(l, asset),
        (l) => get().clearLayerOverride(l),
        () => {
          set({ isAnimating: false, layerOverrides: {} });
        }
      );
    },
    
    setLayerOverride: (layer, asset) => {
      set(state => ({
        layerOverrides: { ...state.layerOverrides, [layer]: asset }
      }));
    },
    
    clearLayerOverride: (layer) => {
      set(state => {
        const newOverrides = { ...state.layerOverrides };
        delete newOverrides[layer];
        return { layerOverrides: newOverrides };
      });
    },
    
    clearAllOverrides: () => {
      set({ layerOverrides: {}, isAnimating: false });
    },
    
    setIsAnimating: (value) => {
      set({ isAnimating: value });
    },
  };
});
