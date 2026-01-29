import { RouterProvider } from 'react-router';
import { router } from '@/app/routes.tsx';
import { Toaster } from '@/app/components/ui/sonner';
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/config/wagmi';
import { Provider as UrqlProvider } from 'urql';
import { subgraphClient } from '@/services/subgraph';

const queryClient = new QueryClient();

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <UrqlProvider value={subgraphClient}>
          <RainbowKitProvider theme={darkTheme()}>
            <RouterProvider router={router} />
            <Toaster position="top-center" />
          </RainbowKitProvider>
        </UrqlProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}