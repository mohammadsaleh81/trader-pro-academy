
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/axios";
import { Wallet } from "@/types/wallet";

interface WalletContextType {
  wallet: Wallet | null;
  updateWallet: (amount: number) => Promise<{ success: boolean; new_balance?: number; error?: string }>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);

  // Fetch wallet balance and transactions
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const auth = localStorage.getItem('auth_tokens');
        if (!auth) return;
        
        const access_token = JSON.parse(auth).access;
        const headers = {
          'Authorization': `Bearer ${access_token}`
        };

        // Fetch balance
        const balanceResponse = await api.get('/wallet/balance/', { headers });
        
        // Fetch transactions
        const transactionsResponse = await api.get('/wallet/transactions/', { headers });
        
        setWallet({
          balance: parseFloat(balanceResponse.data.balance),
          is_active: balanceResponse.data.is_active,
          created_at: balanceResponse.data.created_at,
          updated_at: balanceResponse.data.updated_at,
          transactions: transactionsResponse.data
        });
      } catch (error) {
        console.error('Error fetching wallet data:', error);
        setWallet(null);
      }
    };

    fetchWalletData();
  }, []);

  const updateWallet = async (amount: number) => {
    try {
      const auth = localStorage.getItem('auth_tokens');
      if (!auth || !wallet) {
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
        setWallet(prev => prev ? {
          ...prev,
          balance: response.data.new_balance,
          updated_at: new Date().toISOString()
        } : null);
        
        return { success: true, new_balance: response.data.new_balance };
      }
      
      return { success: false, error: "Deposit failed" };
    } catch (error) {
      console.error('Error updating wallet:', error);
      return { success: false, error: "An error occurred" };
    }
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        updateWallet
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
