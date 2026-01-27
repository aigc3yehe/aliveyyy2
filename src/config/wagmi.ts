
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { bsc } from 'wagmi/chains';
import { http } from 'wagmi';

export const config = getDefaultConfig({
    appName: 'Alive Game',
    projectId: import.meta.env.VITE_PROJECT_ID || 'YOUR_PROJECT_ID',
    chains: [bsc],
    transports: {
        [bsc.id]: http(),
    },
});
