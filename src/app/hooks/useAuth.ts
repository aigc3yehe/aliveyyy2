
import { useState, useEffect, useCallback } from 'react';
import { useAccount, useDisconnect, useSignMessage, useSwitchChain } from 'wagmi';
import { authService } from '../../services/auth.service';
import { toast } from 'sonner';
import { bsc, anvil } from 'viem/chains';

export function useAuth() {
    const { address, isConnected, chainId } = useAccount();
    const { disconnect } = useDisconnect();
    const { signMessageAsync } = useSignMessage();
    const { switchChain } = useSwitchChain();
    const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const isAuthenticated = !!token;

    // Check if connected to wrong network
    const isWrongNetwork = isConnected && chainId !== bsc.id;

    const switchNetwork = useCallback(() => {
        switchChain({ chainId: bsc.id });
    }, [switchChain]);

    // Login function: flow is Get Nonce -> Sign Message -> Login API
    const login = useCallback(async (options?: { silent?: boolean }): Promise<boolean> => {
        if (!address || !isConnected) return false;
        if (isWrongNetwork) {
            if (!options?.silent) {
                toast.error('Please switch to BSC network');
            }
            switchNetwork();
            return false;
        }

        try {
            setIsLoggingIn(true);

            // 1. Get Nonce
            const { nonce, message } = await authService.createNonce(address);

            // 2. Sign Message
            const signature = await signMessageAsync({ message });

            // 3. Login
            const data = await authService.login(address, nonce, signature);

            // 4. Save Token
            localStorage.setItem('access_token', data.accessToken);
            setToken(data.accessToken);

            toast.success('Successfully logged in');
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            if (!options?.silent) {
                toast.error('Login failed', {
                    description: 'Please try again'
                });
            }
            return false;
            // Disconnect if login failed to reset state
            // disconnect(); 
        } finally {
            setIsLoggingIn(false);
        }
    }, [address, isConnected, signMessageAsync, isWrongNetwork, switchNetwork]);

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        setToken(null);
        disconnect();
        toast.info('Logged out');
    }, [disconnect]);

    // Handle auto-logout event from api.ts
    useEffect(() => {
        const handleUnauthorized = () => {
            setToken(null);
            disconnect();
        };

        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, [disconnect]);

    return {
        isAuthenticated,
        isLoggingIn,
        isWrongNetwork,
        switchNetwork,
        login,
        logout,
        token
    };
}
