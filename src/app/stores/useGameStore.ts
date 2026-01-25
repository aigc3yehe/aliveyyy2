import { create } from 'zustand';
import { api } from '@/services/api';
import { type WalletClient } from 'viem';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { config } from '@/config/wagmi';
import AliveClaimABI from '@/abis/AliveClaim.json';

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

export interface DashboardSummaryResponse {
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
  claimable: number; userEmissionRate: number;
  lastTickTime: number;
  globalStats: DashboardSummaryResponse | null;

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
  checkIn: () => Promise<void>; // Needs to be async
  updateHpFromTime: () => void;
  claimRewards: (walletClient: WalletClient) => Promise<string>; // Changed signature
  buyItem: (itemId: string, price: number) => void;
  fetchLeaderboard: () => Promise<LeaderboardEntry[]>;
  fetchGlobalStats: () => Promise<void>;
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
  globalStats: null,

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
      // Both are scaled by 10,000 (WEIGHT_SCALE from backend).
      // User Weight Raw = userData.multiplier * 10,000.
      const userWeightRaw = userData.multiplier * 10000;

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
        globalStats: dashboardData,
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

  checkIn: async () => {
    try {
      // Call backend
      const response = await api.post<{ data: UserStatusResponse }>('/checkins', {});
      const userData = response.data.data;
      const { fetchUserStatus } = get();

      // Update local state with response
      const displaySurvivalMultiplier = 1.0 + (userData.consecutiveCheckinDays * 0.1);
      const displayDopamineIndex = 1.0 + (userData.unclaimedDays * 0.1);

      set({
        hp: userData.hp,
        maxHp: userData.maxHp,
        isAlive: userData.status === 'ALIVE',
        streaks: userData.consecutiveCheckinDays,
        survivalMultiplier: displaySurvivalMultiplier,
        dopamineIndex: displayDopamineIndex,
        lastCheckInTime: Date.now() / 1000,
      });

      // Refetch full status to align everything
      await fetchUserStatus(userData.address);

    } catch (error) {
      console.error('Check-in failed:', error);
      throw error; // Re-throw for component to handle (e.g. toast)
    }
  },

  updateHpFromTime: () => {
    // Local simulation of decay if needed, but prefer fetching from backend
    // Can leave empty if we rely on frequent fetching or keep simple decay logic for smooth UI
  },

  claimRewards: async (walletClient: WalletClient) => {
    try {
      // 1. Get Signature from Backend
      const claimResponse = await api.post<{
        data: {
          claim: {
            account: string;
            amount: string;
            nonce: string;
            deadline: string;
          };
          signature: string;
        }
      }>('/claims', {});

      const { claim, signature } = claimResponse.data.data;

      // 2. Execute Contract Write
      // CAUTION: Hardcoded contract address for now, needs env var
      const CONTRACT_ADDRESS = import.meta.env.VITE_ALIVE_CLAIM_CONTRACT as `0x${string}`;

      // Using wagmi core action to bypass hook limitations in store
      const hash = await writeContract(config, {
        address: CONTRACT_ADDRESS,
        abi: AliveClaimABI,
        functionName: 'claim',
        args: [
          [
            claim.account,
            BigInt(claim.amount),
            BigInt(claim.nonce),
            BigInt(claim.deadline)
          ],
          signature as `0x${string}`
        ],
      });

      console.log('Transaction sent:', hash);

      // 3. Wait for Receipt
      const receipt = await waitForTransactionReceipt(config, { hash });

      // 4. Update UI (optimistic or refetch)
      set({
        claimable: 0,
        dopamineIndex: 1.0,
      });

      // Refetch user status after delay to allow indexer/backend to catch up?
      // Or relies on user refreshing. 
      const { fetchUserStatus } = get();
      setTimeout(() => fetchUserStatus(claim.account), 2000);

      return hash;
    } catch (error) {
      console.error('Claim failed:', error);
      throw error;
    }
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

  fetchGlobalStats: async () => {
    try {
      const response = await api.get<{ data: DashboardSummaryResponse }>('/dashboard/summary');
      set({ globalStats: response.data.data });
    } catch (error) {
      console.error('Failed to fetch global stats:', error);
    }
  },
}));