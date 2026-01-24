import { DecorationLayer } from '@/app/stores/useDecorationStore';
import fksSound from '@/assets/fks.mp3';

// Animation keyframe - a single frame in the animation timeline
export interface AnimationKeyframe {
  layer: DecorationLayer;      // Which layer to affect
  asset: string;               // Asset key to display (e.g., 'player2', 'fk01')
  duration: number;            // Duration in ms
}

// Complete interaction animation configuration
export interface InteractionAnimation {
  id: string;                              // Unique identifier
  triggerLayer: DecorationLayer;           // Which layer triggers on click
  triggerCondition: Partial<Record<DecorationLayer, string>>;  // Required decoration state
  sequence: AnimationKeyframe[];           // Animation timeline
  soundAsset?: string;                     // Optional sound to play on start
}

// ============================================
// ANIMATION CONFIGURATIONS
// ============================================

export const INTERACTION_ANIMATIONS: InteractionAnimation[] = [
  // Player click - shows defense pose for 2 seconds (always available)
  {
    id: 'player_click_interaction',
    triggerLayer: 'player',
    triggerCondition: {}, // No condition - always triggers
    sequence: [
      { layer: 'player', asset: 'playerdef', duration: 2000 },
    ],
  },
  
  // Doll bed click - special animation when bed is set to 'doll'
  {
    id: 'doll_bed_interaction',
    triggerLayer: 'bed',
    triggerCondition: { bed: 'doll' },
    soundAsset: fksSound,
    sequence: [
      // Player holds alternate image for 3 seconds
      { layer: 'player', asset: 'player2', duration: 3000 },
      
      // Bed cycles fk01 ↔ fk02 (0.5s each, 3 cycles = 6 frames)
      { layer: 'bed', asset: 'fk01', duration: 500 },
      { layer: 'bed', asset: 'fk02', duration: 500 },
      { layer: 'bed', asset: 'fk01', duration: 500 },
      { layer: 'bed', asset: 'fk02', duration: 500 },
      { layer: 'bed', asset: 'fk01', duration: 500 },
      { layer: 'bed', asset: 'fk02', duration: 500 },
    ],
  },
];

// Helper: Find animation for a given layer click and current decoration config
export function findAnimationForClick(
  clickedLayer: DecorationLayer,
  currentConfig: Record<DecorationLayer, string>
): InteractionAnimation | null {
  return INTERACTION_ANIMATIONS.find(anim => {
    // Check if this layer triggers the animation
    if (anim.triggerLayer !== clickedLayer) return false;
    
    // Check if all trigger conditions are met
    return Object.entries(anim.triggerCondition).every(
      ([layer, value]) => currentConfig[layer as DecorationLayer] === value
    );
  }) || null;
}

// Helper: Get total duration of an animation
export function getAnimationDuration(animation: InteractionAnimation): number {
  // Find max end time across all keyframes
  // Note: Keyframes can overlap (e.g., player and bed animate concurrently)
  // We need to track each layer's timeline separately
  
  const layerEndTimes: Record<string, number> = {};
  
  for (const keyframe of animation.sequence) {
    const currentEnd = layerEndTimes[keyframe.layer] || 0;
    layerEndTimes[keyframe.layer] = currentEnd + keyframe.duration;
  }
  
  return Math.max(...Object.values(layerEndTimes));
}
