import { create } from 'zustand';
import { api } from '@/services/api';

interface UserStatusResponse {
  address: string;
  status: 'ALIVE' | 'DISCONNECTED';
  hp: number;
  maxHp: number;
  consecutiveCheckinDays: number;
  unclaimedDays: number;
  multiplier: number;
  claimable: string;
  hasDefibrillator: boolean;
}

interface DashboardSummaryResponse {
  aliveUsers: number;
  disconnectedUsers: number;
  dailyPoolRemaining: string;
  totalRewardWeight: string;
  globalEmissionPerSecond: string;
}

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
  claimable: number;
  userEmissionRate: number;
  lastTickTime: number;

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

  fetchUserStatus: (address: string) => Promise<void>;
  tick: () => void;
  checkIn: () => void;
  updateHpFromTime: () => void;
  claimAlive: () => void;
  buyItem: (itemId: string, price: number) => void;
  fetchLeaderboard: () => Promise<LeaderboardEntry[]>;
}

export interface LeaderboardEntry {
  address: string;
  hp: number;
  consecutiveCheckinDays: number;
  unclaimedDays: number;
  multiplier: number;
  accruedRewards: string;
}

export const useGameStore = create<GameState>((set, get) => ({
  hp: 48,
  maxHp: 48,
  lastCheckInTime: Date.now() / 1000,
  aliveBalance: 0,
  streaks: 0,
  isAlive: true,
  isPending: false,
  dopamineIndex: 1.0,
  pendingAlive: 0,
  survivalMultiplier: 1.0,
  audioState: 'sfx_only',
  language: 'en',
  claimable: 0,
  userEmissionRate: 0,
  lastTickTime: Date.now(),

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

  fetchUserStatus: async (address: string) => {
    try {
      // Fetch User Status and Global Dashboard Summary in parallel
      const [userResponse, dashboardResponse] = await Promise.all([
        api.get<{ data: UserStatusResponse }>(`/users/${address}`),
        api.get<{ data: DashboardSummaryResponse }>('/dashboard/summary')
      ]);

      const userData = userResponse.data.data;
      const dashboardData = dashboardResponse.data.data;

      // Calculate display multipliers
      const displaySurvivalMultiplier = 1.0 + (userData.consecutiveCheckinDays * 0.1);
      const displayDopamineIndex = 1.0 + (userData.unclaimedDays * 0.1);

      // Parse token values
      const claimable = parseFloat(userData.claimable) / 1e18;

      // Calculate Emission Rate
      // Formula: Rate = GlobalEmission * (UserMultiplier * 1e6) / TotalWeight
      // Note: Backend stores weights scaled by 1e6. User multiplier is a float derived from that.
      // So UserWeight approx = UserMultiplier * 1,000,000

      const globalEmission = parseFloat(dashboardData.globalEmissionPerSecond); // Raw BigInt string, treated as float for rough rate
      const totalWeight = parseFloat(dashboardData.totalRewardWeight);
      // Wait, globalEmission string is 1e18 scaled integer string.
      // totalWeight is 1e6 scaled integer string.
      // We need final rate in "Tokens" (1.0 = 1e18 raw units).

      // Let's do calculation in "Token Units":
      const globalEmissionInTokens = globalEmission / 1e18;

      // User Weight is effectively proportional to totalWeight.
      // Both are scaled by 1e6.
      // User Weight Raw = userData.multiplier * 1,000,000 (roughly, since multiplier = weight/scale)
      const userWeightRaw = userData.multiplier * 1000000;

      let emissionRate = 0;
      if (totalWeight > 0) {
        emissionRate = globalEmissionInTokens * (userWeightRaw / totalWeight);
      }

      set({
        hp: userData.hp,
        maxHp: userData.maxHp,
        isAlive: userData.status === 'ALIVE',
        streaks: userData.consecutiveCheckinDays,
        survivalMultiplier: displaySurvivalMultiplier,
        dopamineIndex: displayDopamineIndex,
        claimable: claimable,
        userEmissionRate: emissionRate,
        lastTickTime: Date.now(),
        lastCheckInTime: Date.now() / 1000,
      });
    } catch (error) {
      console.error('Failed to fetch user status or global stats:', error);
    }
  },

  tick: () => {
    const state = get();
    if (!state.isAlive || state.userEmissionRate <= 0) {
      set({ lastTickTime: Date.now() });
      return;
    }

    const now = Date.now();
    const dt = (now - state.lastTickTime) / 1000; // seconds
    if (dt <= 0) return;

    const added = state.userEmissionRate * dt;
    set({
      claimable: state.claimable + added,
      lastTickTime: now,
    });
  },

  checkIn: () => {
    // Optimistic update - assume check-in restores 1 HP and increments streaks
    const state = get();
    if (state.hp < state.maxHp) {
      set({ hp: state.hp + 1 });
    }
    set({ streaks: state.streaks + 1 });
    // Note: checkIn (backend) will fundamentally change the accumulated rewards multiplier
    // but might trigger a 'claim' logic or not?
    // Usually checkIn is just checkIn.
  },

  updateHpFromTime: () => {
    // Local simulation of decay if needed, but prefer fetching from backend
    // Can leave empty if we rely on frequent fetching or keep simple decay logic for smooth UI
  },

  claimAlive: () => {
    // Optimistic Reset
    set({
      claimable: 0,
      dopamineIndex: 1.0,
    });
    // The actual call to backend /claim should happen in component, then likely refetch user status.
  },

  buyItem: (itemId: string, price: number) => {
    // Placeholder
  },

  fetchLeaderboard: async () => {
    try {
      const response = await api.get<{ data: LeaderboardEntry[] }>('/dashboard/leaderboard', {
        params: { sortBy: 'optimisticClaimedRewards' }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      return [];
    }
  },
}));