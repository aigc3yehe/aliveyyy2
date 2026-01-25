import { create } from 'zustand';

interface GameState {
  hp: number;
  maxHp: number;
  lastCheckInTime: number;
  aliveBalance: number;
  streaks: number;
  isAlive: boolean;
  isPending: boolean;
  dopamineIndex: number;
  pendingAlive: number;
  survivalMultiplier: number;
  audioState: 'all' | 'sfx_only' | 'mute';
  language: 'en' | 'cn';
  setHp: (hp: number) => void;
  setLastCheckInTime: (time: number) => void;
  setAliveBalance: (balance: number) => void;
  setStreaks: (streaks: number) => void;
  setIsAlive: (isAlive: boolean) => void;
  setIsPending: (isPending: boolean) => void;
  setDopamineIndex: (index: number) => void;
  setPendingAlive: (amount: number) => void;
  setSurvivalMultiplier: (multiplier: number) => void;
  cycleAudioState: () => void;
  setLanguage: (language: 'en' | 'cn') => void;
  checkIn: () => void;
  updateHpFromTime: () => void;
  claimAlive: () => void;
  buyItem: (itemId: string, price: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  hp: 42,
  maxHp: 48,
  lastCheckInTime: Date.now() / 1000,
  aliveBalance: 102000,
  streaks: 0,
  isAlive: true,
  isPending: false,
  dopamineIndex: 1,
  pendingAlive: 5280,
  survivalMultiplier: 1.0,
  audioState: 'sfx_only',
  language: 'en',

  setHp: (hp) => set({ hp }),
  setLastCheckInTime: (time) => set({ lastCheckInTime: time }),
  setAliveBalance: (balance) => set({ aliveBalance: balance }),
  setStreaks: (streaks) => set({ streaks }),
  setIsAlive: (isAlive) => set({ isAlive }),
  setIsPending: (isPending) => set({ isPending }),
  setDopamineIndex: (index) => set({ dopamineIndex: index }),
  setPendingAlive: (amount) => set({ pendingAlive: amount }),
  setSurvivalMultiplier: (multiplier) => set({ survivalMultiplier: multiplier }),
  cycleAudioState: () => set((state) => {
    const nextState = {
      all: 'sfx_only',
      sfx_only: 'mute',
      mute: 'all'
    }[state.audioState] as 'all' | 'sfx_only' | 'mute';
    return { audioState: nextState };
  }),
  setLanguage: (language) => set({ language }),




  checkIn: () => {
    const state = get();
    // Allow check-in regardless of current HP

    const now = Date.now() / 1000;
    let newLastCheckInTime = state.lastCheckInTime;

    if (state.hp <= 0) {
      // If dead, revive to 1 HP
      // HP = maxHp - hoursPassed => 1 = maxHp - hoursPassed => hoursPassed = maxHp - 1
      newLastCheckInTime = now - ((state.maxHp - 1) * 3600);
    } else {
      // If alive, add 1 hour to check-in time (recover 1 HP worth of decay), clamped to now
      newLastCheckInTime = Math.min(now, state.lastCheckInTime + 3600);
    }

    // Calculate new HP based on the new time to ensure consistency
    const hoursPassed = (now - newLastCheckInTime) / 3600;
    const newHp = Math.max(0, state.maxHp - Math.floor(hoursPassed));

    // 每次签到增加待领取的$活着呢和多巴胺指数
    const aliveReward = 10 * state.dopamineIndex;

    set({
      hp: newHp,
      lastCheckInTime: newLastCheckInTime,
      streaks: state.streaks + 1,
      pendingAlive: state.pendingAlive + aliveReward,
      dopamineIndex: state.dopamineIndex + 0.1, // 每次签到增加0.1
      isAlive: newHp > 0, // Ensure isAlive is updated
    });
  },

  updateHpFromTime: () => {
    const state = get();
    const now = Date.now() / 1000;
    const hoursPassed = (now - state.lastCheckInTime) / 3600;
    const calculatedHp = Math.max(0, state.maxHp - Math.floor(hoursPassed));

    if (calculatedHp !== state.hp) {
      set({
        hp: calculatedHp,
        isAlive: calculatedHp > 0
      });
    }
  },

  claimAlive: () => {
    const state = get();
    if (state.pendingAlive > 0) {
      set({
        aliveBalance: state.aliveBalance + state.pendingAlive,
        pendingAlive: 0,
        dopamineIndex: 1, // 领取后重置为1
      });
    }
  },

  buyItem: (itemId: string, price: number) => {
    const state = get();
    if (state.aliveBalance >= price) {
      set({ aliveBalance: state.aliveBalance - price });
    }
  },
}));