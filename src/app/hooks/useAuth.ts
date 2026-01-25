
import { useState, useEffect, useCallback } from 'react';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { authService } from '../../services/auth.service';
import { toast } from 'sonner';

export function useAuth() {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const { signMessageAsync } = useSignMessage();
    const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const isAuthenticated = !!token;

    // Login function: flow is Get Nonce -> Sign Message -> Login API
    const login = useCallback(async (): Promise<boolean> => {
        if (!address || !isConnected) return false;

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
            toast.error('Login failed', {
                description: 'Please try again'
            });
            return false;
            // Disconnect if login failed to reset state
            // disconnect(); 
        } finally {
            setIsLoggingIn(false);
        }
    }, [address, isConnected, signMessageAsync]);

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
        login,
        logout,
        token
    };
}
