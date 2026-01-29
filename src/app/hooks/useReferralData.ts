import useSWR from 'swr';
import { subgraphClient } from '@/services/subgraph';
import {
    GET_USER_REFERRAL_STATS,
    GET_USER_REFERRAL_LIST,
    ReferralStatsData,
    ReferralListData,
} from '@/services/referralQueries';

// SWR fetcher for referral stats
const referralStatsFetcher = async (userId: string): Promise<ReferralStatsData> => {
    return subgraphClient.request(GET_USER_REFERRAL_STATS, { userId });
};

// SWR fetcher for referral list
const referralListFetcher = async (userId: string): Promise<ReferralListData> => {
    return subgraphClient.request(GET_USER_REFERRAL_LIST, { userId });
};

/**
 * Hook to fetch user referral statistics
 */
export function useReferralStats(address?: string) {
    const userId = address?.toLowerCase();

    const { data, error, isLoading, mutate } = useSWR(
        userId ? ['referral-stats', userId] : null,
        ([_, id]) => referralStatsFetcher(id),
        {
            refreshInterval: 60000, // Refresh every 60 seconds
            revalidateOnFocus: false,
        }
    );

    return {
        data,
        error,
        isLoading,
        mutate,
        directInvites: data?.user?.level1ReferralCount ?? 0,
        indirectInvites: data?.user?.level2ReferralCount ?? 0,
    };
}

/**
 * Hook to fetch user referral lists
 */
export function useReferralList(address?: string, enabled = true) {
    const userId = address?.toLowerCase();

    const { data, error, isLoading, mutate } = useSWR(
        userId && enabled ? ['referral-list', userId] : null,
        ([_, id]) => referralListFetcher(id),
        {
            refreshInterval: 60000,
            revalidateOnFocus: false,
        }
    );

    return {
        data,
        error,
        isLoading,
        mutate,
        level1Referrals: data?.user?.level1Referrals ?? [],
        level2Referrals: data?.user?.level2Referrals ?? [],
    };
}
