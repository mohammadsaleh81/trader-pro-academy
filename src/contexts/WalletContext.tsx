import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/axios";
import { Wallet } from "@/types/wallet";
import { useAuth } from "./AuthContext";

interface WalletContextType {
  wallet: Wallet | null;
  isLoading: boolean;
  error: string | null;
  updateWallet: (amount: number) => Promise<{ success: boolean; new_balance?: number; error?: string }>;
  refetchWallet: () => void;
  clearWalletCache: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { user } = useAuth();

  // Fetch wallet balance and transactions with retry logic
  const fetchWalletData = async (retryAttempt = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const auth = localStorage.getItem('auth_tokens');
      
      if (!auth || !user) {
        setWallet(null);
        setIsLoading(false);
        return;
      }
      
      const access_token = JSON.parse(auth).access;
      
      const headers = {
        'Authorization': `Bearer ${access_token}`
      };
      
      // Fetch balance and transactions
      const [balanceResponse, transactionsResponse] = await Promise.all([
        api.get('/wallet/balance/', { headers }),
        api.get('/wallet/transactions/', { headers })
      ]);
      
      setWallet({
        balance: parseFloat(balanceResponse.data.balance),
        is_active: balanceResponse.data.is_active,
        created_at: balanceResponse.data.created_at,
        updated_at: balanceResponse.data.updated_at,
        transactions: transactionsResponse.data
      });
      
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('WalletContext: Error fetching wallet data:', error);
      
      // Retry logic with exponential backoff
      if (retryAttempt < 2) {
        const delay = Math.pow(2, retryAttempt) * 1000; // 1s, 2s, 4s
        setTimeout(() => {
          fetchWalletData(retryAttempt + 1);
        }, delay);
        setRetryCount(retryAttempt + 1);
        return;
      }
      
      setError('خطا در بارگذاری اطلاعات کیف پول');
      setWallet(null);
      setRetryCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup function to reset wallet state
  const clearWalletState = () => {
    setWallet(null);
    setError(null);
    setIsLoading(false);
  };

  // Clear wallet cache - exposed method
  const clearWalletCache = () => {
    clearWalletState();
    setRetryCount(0);
  };

  // Listen for logout event to clear cache
  useEffect(() => {
    const handleLogout = () => {
      clearWalletCache();
    };

    window.addEventListener('auth:logout', handleLogout);
    
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  // Effect to handle user changes
  useEffect(() => {
    if (user) {
      fetchWalletData();
    } else {
      clearWalletState();
    }
  }, [user?.id]); // Only depend on user.id to avoid unnecessary refetches

  const updateWallet = async (amount: number) => {
    try {
      const auth = localStorage.getItem('auth_tokens');
      if (!auth || !wallet || !user) {
        return { success: false, error: "Not authenticated or wallet not initialized" };
      }
      
      const access_token = JSON.parse(auth).access;
      const response = await api.post('/wallet/deposit/', 
        { amount },
        {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        }
      );
      
      if (response.data.message === "Deposit successful") {
        // Update wallet balance immediately
        setWallet(prev => prev ? {
          ...prev,
          balance: response.data.new_balance,
          updated_at: new Date().toISOString()
        } : null);
        
        // Don't call fetchWalletData() here to avoid infinite loop
        // The wallet state is already updated above
        
        return { success: true, new_balance: response.data.new_balance };
      }
      
      return { success: false, error: "Deposit failed" };
    } catch (error) {
      console.error('Error updating wallet:', error);
      return { success: false, error: "An error occurred" };
    }
  };

  const refetchWallet = () => {
    if (user) {
      fetchWalletData();
    }
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        isLoading,
        error,
        updateWallet,
        refetchWallet,
        clearWalletCache
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
