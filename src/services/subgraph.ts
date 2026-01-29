import { GraphQLClient, gql } from 'graphql-request';

// The Graph Subgraph API endpoint
const SUBGRAPH_URL = 'https://api.studio.thegraph.com/query/1724416/bsc-alive-referral/version/latest';

// Create GraphQL client
export const subgraphClient = new GraphQLClient(SUBGRAPH_URL);

// Helper for cache TTL (if needed for manual invalidation)
export const CACHE_TTL_MS = 60 * 1000; // 60 seconds

// Re-export gql for query definitions
export { gql };
