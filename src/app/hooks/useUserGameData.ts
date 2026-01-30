import useSWR from 'swr';
import { api } from '@/services/api';
import { useGameStore, UserStatusResponse, DashboardSummaryResponse } from '@/app/stores/useGameStore';
import { useEffect } from 'react';
import { readContract } from '@wagmi/core';
import { config } from '@/config/wagmi';
import AliveClaimABI from '@/abis/AliveClaim.json';
import { erc20Abi, formatEther } from 'viem';

// Helper to read activation cache
const getActivationCache = (address: string): boolean | null => {
    try {
        const cache = localStorage.getItem(`alive_activated_${address.toLowerCase()}`);
        return cache === 'true' ? true : null;
    } catch {
        return null;
    }
};

// Helper to write activation cache
const setActivationCache = (address: string, activated: boolean) => {
    try {
        if (activated) {
            localStorage.setItem(`alive_activated_${address.toLowerCase()}`, 'true');
        }
    } catch {
        // Ignore localStorage errors
    }
};

// Fetcher for User Status + Dashboard Summary
const userStatusFetcher = async ([_, address, refreshActivation]: [string, string, boolean]) => {
    if (!address) return null;

    const refreshQuery = refreshActivation ? '?refreshActivation=true' : '';
    const [userResponse, dashboardResponse] = await Promise.all([
        api.get<{ data: UserStatusResponse }>(`/users/${address}${refreshQuery}`),
        api.get<{ data: DashboardSummaryResponse }>('/dashboard/summary')
    ]);

    const userData = userResponse.data.data;
    const dashboardData = dashboardResponse.data.data;

    // Calculate logic ported from useGameStore
    const displaySurvivalMultiplier = userData.multiplier;
    const displayDopamineIndex = 1.0 + (userData.unclaimedDays * 0.1);
    const claimable = parseFloat(userData.claimable) / 1e18;
    const optimisticClaimedRewards = parseFloat(userData.optimisticClaimedRewards || '0') / 1e18;

    // Emission Rate Calculation
    // Rate = GlobalEmission * (UserMultiplier * 1e6) / TotalWeight
    // GlobalEmission is 1e18 scaled string
    // TotalWeight is 1e6 scaled string
    // UserMultiplier is float
    const globalEmissionInTokens = parseFloat(dashboardData.globalEmissionPerSecond) / 1e18;
    const totalWeight = parseFloat(dashboardData.totalRewardWeight);
    const userWeightRaw = userData.multiplier * 10000;

    let emissionRate = 0;
    if (totalWeight > 0) {
        emissionRate = globalEmissionInTokens * (userWeightRaw / totalWeight);
    }

    // On-chain activation check (fallback to backend if missing)
    let activationOnChain = false;
    try {
        const activationContract = import.meta.env.VITE_ALIVE_ACTIVATION_CONTRACT as `0x${string}`;
        if (activationContract) {
            const activated = await readContract(config, {
                address: activationContract,
                abi: (await import('@/abis/AliveActivation.json')).default,
                functionName: 'isActivated',
                args: [address as `0x${string}`],
            });
            activationOnChain = Boolean(activated);
        }
    } catch (err) {
        console.error('Failed to fetch activation status:', err);
    }

    // Nonce Fetching
    let userNonce = 0;
    try {
        const claimContractAddress = import.meta.env.VITE_ALIVE_CLAIM_CONTRACT as `0x${string}`;
        if (claimContractAddress) {
            const nonceBigInt = await readContract(config, {
                address: claimContractAddress,
                abi: AliveClaimABI,
                functionName: 'nonces',
                args: [address as `0x${string}`],
            });
            userNonce = Number(nonceBigInt);
        }
    } catch (err) {
        console.error('Failed to fetch user nonce:', err);
    }

    return {
        userData,
        dashboardData,
        calculated: {
            displaySurvivalMultiplier,
            displayDopamineIndex,
            claimable,
            optimisticClaimedRewards,
            emissionRate,
            userNonce,
            activationOnChain
        }
    };
};

const tokenBalanceFetcher = async ([_, address]: [string, string]) => {
    if (!address) return '0';

    const tokenAddress = import.meta.env.VITE_ALIVE_TOKEN as `0x${string}`;
    if (!tokenAddress) return '0';

    const balance = await readContract(config, {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
    });

    return formatEther(balance);
};

export function useUserGameData(address?: string) {
    const {
        setHp, setAliveStreakDays, setIsAlive, setSurvivalMultiplier, setDopamineIndex,
        setHp: _setHp, // Duplicate destructure fix not needed if handled by Object.assign or standard setters
        setPendingAlive: _setPendingAlive, // Not used in fetch logic?
        lastTickTime: _lastTickTime
    } = useGameStore();

    const store = useGameStore();

    // Initialize activation state from localStorage cache on address change
    useEffect(() => {
        if (address) {
            const cached = getActivationCache(address);
            if (cached === true) {
                // Pre-set activated state from cache to prevent modal flash
                useGameStore.setState({ isAccountActivated: true });
            }
        }
    }, [address]);

    // 1. Main User Status SWR
    const shouldRefreshActivation = address ? !getActivationCache(address) : false;
    const { data: statusData, error: statusError, mutate: mutateUserStatus } = useSWR(
        address ? ['/user-game-status', address, shouldRefreshActivation] : null,
        userStatusFetcher,
        {
            refreshInterval: 60000, // Poll every minute
            revalidateOnFocus: true,
        }
    );

    // 2. Token Balance SWR
    const { data: tokenBalance, mutate: mutateTokenBalance } = useSWR(
        address ? ['/token-balance', address] : null,
        tokenBalanceFetcher,
        {
            refreshInterval: 60000,
        }
    );

    // Sync to Store
    useEffect(() => {
        if (statusData) {
            const { userData, dashboardData, calculated } = statusData;

            // Cache activation status if user is activated
            if (userData.activated && statusData.userData.address) {
                setActivationCache(statusData.userData.address, true);
            }

            useGameStore.setState({
                hp: userData.hp,
                maxHp: userData.maxHp,
                isAlive: userData.status === 'ALIVE',
                aliveStreakDays: userData.aliveStreakDays,
                survivalMultiplier: calculated.displaySurvivalMultiplier,
                dopamineIndex: calculated.displayDopamineIndex,
                claimable: calculated.claimable,
                userEmissionRate: calculated.emissionRate,
                optimisticClaimedRewards: calculated.optimisticClaimedRewards,
                userItems: userData.items || [],
                userNonce: calculated.userNonce,
                globalStats: dashboardData,
                isAccountActivated: Boolean(calculated.activationOnChain) || userData.activated,
                isActivationChecked: true, // Mark that backend has responded
                lastTickTime: Date.now(),
                lastCheckInTime: Date.now() / 1000
            });
        }
    }, [statusData]);

    useEffect(() => {
        if (tokenBalance) {
            useGameStore.setState({ tokenBalance });
        }
    }, [tokenBalance]);

    return {
        statusData,
        tokenBalance,
        isLoading: !statusData && !statusError && !!address,
        isError: statusError,
        mutateUserStatus,
        mutateTokenBalance
    };
}
