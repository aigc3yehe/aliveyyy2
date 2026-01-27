import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
    rainbowWallet,
    walletConnectWallet,
    metaMaskWallet,
    baseAccount,
    tokenPocketWallet,
    trustWallet,
    okxWallet,
    bitgetWallet,
    imTokenWallet,
    safeWallet,
    binanceWallet,
    bybitWallet
} from '@rainbow-me/rainbowkit/wallets';
import { bsc } from 'wagmi/chains';
import { http } from 'wagmi';

export const config = getDefaultConfig({
    appName: 'Alive Game',
    projectId: import.meta.env.VITE_PROJECT_ID || 'YOUR_PROJECT_ID',
    chains: [bsc],
    transports: {
        [bsc.id]: http(),
    },
    wallets: [
        {
            groupName: 'Recommended',
            wallets: [
                metaMaskWallet,
                rainbowWallet,
                walletConnectWallet,
                baseAccount,
            ],
        },
        {
            groupName: 'Others',
            wallets: [
                trustWallet,
                tokenPocketWallet,
                okxWallet,
                bitgetWallet,
                imTokenWallet,
                safeWallet,
                binanceWallet,
                bybitWallet
            ],
        },
    ],
});
