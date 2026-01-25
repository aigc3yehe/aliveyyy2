
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { bsc, bscTestnet } from 'wagmi/chains';
import { http } from 'wagmi';

export const config = getDefaultConfig({
    appName: 'Alive Game',
    projectId: 'YOUR_PROJECT_ID', // TODO: Replace with actual WalletConnect Project ID
    chains: [bsc, bscTestnet],
    transports: {
        [bsc.id]: http(),
        [bscTestnet.id]: http(),
    },
});
