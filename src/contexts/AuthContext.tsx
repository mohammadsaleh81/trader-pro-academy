
import React, { createContext, useContext, useState, useEffect } from "react";

// Define user type
export type User = {
  id: string;
  name?: string;
  phone: string;
  email?: string;
  avatar?: string;
  isProfileComplete: boolean;
};

// Mock user data for demo
const mockUsers = [
  {
    id: "1",
    phone: "09121234567",
    name: "کاربر نمونه",
    email: "user@example.com",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    isProfileComplete: true
  }
];

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  requestOTP: (phone: string) => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  completeProfile: (name: string, email: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const requestOTP = async (phone: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call to request OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we just store the phone number
      setPhoneNumber(phone);
      
      // In a real app, this would trigger an SMS to be sent
      console.log(`OTP requested for phone number: ${phone}`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ارسال کد تایید");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (otp: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call to verify OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, any 5-digit code works
      if (otp.length !== 5) {
        throw new Error("کد تایید باید 5 رقم باشد");
      }
      
      // Check if this phone number exists in our mock database
      const existingUser = mockUsers.find(u => u.phone === phoneNumber);
      
      if (existingUser) {
        // User exists, log them in
        setUser(existingUser);
        localStorage.setItem("user", JSON.stringify(existingUser));
      } else {
        // New user, create a basic profile
        const newUser: User = {
          id: String(mockUsers.length + 1),
          phone: phoneNumber,
          isProfileComplete: false
        };
        
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "کد تایید نامعتبر است");
    } finally {
      setIsLoading(false);
    }
  };

  const completeProfile = async (name: string, email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!user) {
        throw new Error("کاربر احراز هویت نشده است");
      }
      
      // Update user profile
      const updatedUser: User = {
        ...user,
        name,
        email,
        avatar: `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg`,
        isProfileComplete: true
      };
      
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در تکمیل پروفایل");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setPhoneNumber("");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        error, 
        phoneNumber, 
        setPhoneNumber,
        requestOTP, 
        verifyOTP, 
        completeProfile, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
