import useSWR from 'swr';
import { useDecorationStore, DecorationConfig } from '@/app/stores/useDecorationStore';
import { useEffect } from 'react';

// Mock Fetcher - mimicking the store's original logic
const decorationFetcher = async () => {
    // TODO: Replace with actual API call
    // Mock server request
    await new Promise(resolve => setTimeout(resolve, 500));

    // Default config matching the store's default
    const DEFAULT_CONFIG: DecorationConfig = {
        background: 'default',
        holographic: 'default',
        photo: 'default',
        player: 'default',
        bed: 'default',
        stove: 'default',
    };

    const serverConfig: DecorationConfig = {
        ...DEFAULT_CONFIG,
        // Server could return user's saved preferences here
    };

    return serverConfig;
};

export function useDecorationData() {
    const { data, error, isLoading } = useSWR(
        '/decorations',
        decorationFetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: 300000, // 5 minutes cache similar to original store
        }
    );

    useEffect(() => {
        if (data) {
            useDecorationStore.setState({
                config: data,
                isLoading: false,
                lastFetchTime: Date.now()
            });
        }
    }, [data]);

    return {
        decorations: data,
        isLoading,
        isError: error
    };
}
