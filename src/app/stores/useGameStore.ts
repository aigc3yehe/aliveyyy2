import { create } from 'zustand';
import { api } from '@/services/api';
import { type WalletClient, parseEther, erc20Abi, formatEther, isAddress } from 'viem';
import { writeContract, waitForTransactionReceipt, readContract, getAccount } from '@wagmi/core';
import { config } from '@/config/wagmi';
import AliveClaimABI from '@/abis/AliveClaim.json';

export interface UserStatusResponse {
  address: string;
  status: 'ALIVE' | 'DISCONNECTED';
  activated: boolean; // Changed from isActivated
  hp: number;
  maxHp: number;
  consecutiveCheckinDays: number;
  unclaimedDays: number;
  multiplier: number;
  claimable: string;

  items: { code: string; quantity: number }[];
  optimisticClaimedRewards: string;
}

export interface DashboardSummaryResponse {
  aliveUsers: number;
  disconnectedUsers: number;
  dailyPoolRemaining: string;
  dailyPoolTotal: string;
  totalRewardWeight: string;
  globalEmissionPerSecond: string;
}

export interface ShopItem {
  code: string;
  name: string;
  description: string;
  price: string;
  cover: string;
  isConsumable: boolean;
  maxQuantity?: number;
  // TODO: Verify if effects are needed or returned by backend. Currently backend DTO does not have them.
  effects?: {
    type: 'HEAL' | 'BUFF' | 'REVIVE';
    value: number;
    duration?: number;
  }[];
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
  optimisticClaimedRewards: number; // Add this
  lastTickTime: number;
  globalStats: DashboardSummaryResponse | null;
  items: ShopItem[];
  userItems: { code: string; quantity: number }[];
  tokenBalance: string;
  userNonce: number;
  isAccountActivated: boolean; // PROTOTYPE: Check if user has paid activation fee


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
  tick: () => void;
  checkIn: () => Promise<void>; // Needs to be async
  updateHpFromTime: () => void;
  claimRewards: (walletClient: WalletClient) => Promise<{ hash: string; amount: number }>; // Changed signature to return amount
  buyItem: (item: ShopItem, walletClient: WalletClient) => Promise<void>;
  reconnect: (mode: 'standard' | 'defibrillator') => Promise<void>;
  activateAccount: () => Promise<void>; // PROTOTYPE: Simulate activation payment
}

export interface LeaderboardEntry {
  address: string;
  hp: number;
  maxHp: number; // Added
  hpDecayPerHour: number; // Added
  lastHpUpdateAt: string | Date; // Added
  consecutiveCheckinDays: number;
  unclaimedDays: number;
  multiplier: number;
  accruedRewards: string;
  claimRewards: string;
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
  optimisticClaimedRewards: 0,
  lastTickTime: Date.now(),
  globalStats: null,
  items: [],
  userItems: [],
  tokenBalance: '0',
  userNonce: 0,
  isAccountActivated: false, // Default to false for prototype demo


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

  // fetchUserStatus, fetchTokenBalance, fetchGlobalStats removed in favor of useUserGameData hook

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

      // Update local state with response
      const displaySurvivalMultiplier = userData.multiplier;
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

      // Note: We rely on SWR polling or manual mutation (if passed) to refresh full status
      // Ideally the component calling this should trigger the mutate from the hook 

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

      return { hash, amount: parseFloat(claim.amount) / 1e18 };
    } catch (error) {
      console.error('Claim failed:', error);
      throw error;
    }
  },

  buyItem: async (item: ShopItem, walletClient: WalletClient) => {
    try {
      // 1. Transfer Tokens to Treasury
      const tokenAddress = import.meta.env.VITE_ALIVE_TOKEN as `0x${string}`;
      const treasuryAddress = import.meta.env.VITE_TREASURY_ADDRESS as `0x${string}`;

      if (!tokenAddress || !treasuryAddress) {
        throw new Error('Token or Treasury address not configured');
      }

      const priceInWei = parseEther(item.price);

      const hash = await writeContract(config, {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [treasuryAddress, priceInWei],
      });

      console.log(`Transfer sent for item ${item.code}:`, hash);
      await waitForTransactionReceipt(config, { hash });

      // 2. Call Backend Purchase API
      await api.post('/items/purchase', {
        code: item.code,
        quantity: 1, // Currently single item purchase
        txHash: hash,
      });

      // 3. UI Update handled by SWR revalidation
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  },

  reconnect: async (mode: 'standard' | 'defibrillator') => {
    try {
      const response = await api.post<{ data: UserStatusResponse }>('/reconnects', { mode });
      const userData = response.data.data;

      // Update local state immediately
      set({
        hp: userData.hp,
        maxHp: userData.maxHp,
        isAlive: userData.status === 'ALIVE',
        isAccountActivated: userData.activated, // Sync activation status
        streaks: userData.consecutiveCheckinDays,
        // Update user items to reflect consumed defibrillator if applicable
        userItems: userData.items || get().userItems,
      });

      return;
    } catch (error) {
      console.error('Reconnect failed:', error);
      throw error;
    }
  },

  activateAccount: async () => {
    try {
      const activationContract = import.meta.env.VITE_ALIVE_ACTIVATION_CONTRACT as `0x${string}`;
      const defaultFee = import.meta.env.VITE_ACTIVATION_FEE || '0.015';
      const fee = parseEther(defaultFee);

      // Get referrer from URL/Storage
      const urlParams = new URLSearchParams(window.location.search);
      const inviteCode = urlParams.get('invite');

      // Get current user address to prevent self-referral
      const { address: currentAddress } = getAccount(config);

      // Default referrer is burn address / zero address if invalid or missing
      let referrer = '0x0000000000000000000000000000000000000000';

      if (inviteCode && isAddress(inviteCode)) {
        // Check if referrer is not self
        if (currentAddress && inviteCode.toLowerCase() === currentAddress.toLowerCase()) {
          console.warn('Self-referral detected, ignoring referrer');
        } else {
          referrer = inviteCode;
        }
      }

      console.log('Activating with referrer:', referrer, 'Fee:', defaultFee);

      const hash = await writeContract(config, {
        address: activationContract,
        abi: (await import('@/abis/AliveActivation.json')).default,
        functionName: 'activate',
        args: [referrer as `0x${string}`],
        value: fee,
      });

      console.log('Activation tx:', hash);
      await waitForTransactionReceipt(config, { hash });

      console.log('Activation tx:', hash);
      await waitForTransactionReceipt(config, { hash });

      // Poll user status to sync backend state (backend checks chain state on read)
      if (currentAddress) {
        // Simple delay to allow block propagation if needed, though waitReceipt should suffice
        // Fetch user data to trigger backend sync logic
        const response = await api.get<{ data: UserStatusResponse }>(`/users/${currentAddress}`);
        const userData = response.data.data;

        // Update local state
        set({ isAccountActivated: userData.activated });
      } else {
        // Fallback strictly for UI if address is somehow missing (unlikely)
        set({ isAccountActivated: true });
      }

    } catch (error) {
      console.error('Activation failed:', error);
      throw error;
    }
  },
}));