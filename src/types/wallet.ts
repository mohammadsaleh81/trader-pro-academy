
// Transaction Type for Wallet
export type Transaction = {
  amount: string;
  transaction_type: "deposit" | "withdrawal" | "purchase";
  description: string;
  created_at: string;
  balance_after: string;
};

// Wallet Type
export type Wallet = {
  balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  transactions: Transaction[];
};
