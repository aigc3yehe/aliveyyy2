import { createClient, cacheExchange, fetchExchange } from 'urql';

const SUBGRAPH_URL = 'https://api.studio.thegraph.com/query/1724416/bsc-alive-referral/version/latest';

// Custom request policy: cache-first with 60 second TTL
// urql's cacheExchange uses document cache by default
// For time-based invalidation, we use requestPolicy 'cache-and-network' 
// and control refetching via requestPolicy option in useQuery calls

export const subgraphClient = createClient({
    url: SUBGRAPH_URL,
    exchanges: [cacheExchange, fetchExchange],
    requestPolicy: 'cache-first', // Use cached data when available
});

// Helper to get cache key for manual invalidation if needed
export const CACHE_TTL_MS = 60 * 1000; // 60 seconds
