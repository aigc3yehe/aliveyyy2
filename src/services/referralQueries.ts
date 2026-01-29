import { gql } from 'urql';

/**
 * Query to get user referral statistics (counts)
 */
export const GET_USER_REFERRAL_STATS = gql`
  query GetUserReferralStats($userId: Bytes!) {
    user(id: $userId) {
      level1ReferralCount
      level2ReferralCount
      level1TotalRewards
      level2TotalRewards
      totalRewards
    }
  }
`;

/**
 * Query to get user referral lists (Level 1 and Level 2)
 */
export const GET_USER_REFERRAL_LIST = gql`
  query GetUserReferralList($userId: Bytes!) {
    user(id: $userId) {
      level1Referrals(first: 100, orderBy: timestamp, orderDirection: desc) {
        id
        invitee {
          id
          level1ReferralCount
        }
        rewardAmount
        timestamp
      }
      level2Referrals(first: 100, orderBy: timestamp, orderDirection: desc) {
        id
        invitee {
          id
        }
        intermediary {
          id
        }
        rewardAmount
        timestamp
      }
    }
  }
`;

// TypeScript types for query responses
export interface ReferralStatsData {
    user: {
        level1ReferralCount: number;
        level2ReferralCount: number;
        level1TotalRewards: string;
        level2TotalRewards: string;
        totalRewards: string;
    } | null;
}

export interface Level1ReferralItem {
    id: string;
    invitee: {
        id: string;
        level1ReferralCount: number;
    };
    rewardAmount: string;
    timestamp: string;
}

export interface Level2ReferralItem {
    id: string;
    invitee: {
        id: string;
    };
    intermediary: {
        id: string;
    };
    rewardAmount: string;
    timestamp: string;
}

export interface ReferralListData {
    user: {
        level1Referrals: Level1ReferralItem[];
        level2Referrals: Level2ReferralItem[];
    } | null;
}
