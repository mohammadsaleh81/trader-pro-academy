
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

// Define user type
export type User = {
  id: string | number;
  name?: string;
  phone: string;
  email?: string;
  avatar?: string;
  isProfileComplete: boolean;
  first_name?: string;
  last_name?: string;
  is_phone_verified?: boolean;
  token?: {
    access: string;
    refresh: string;
  };
};

// API base URL
const API_BASE_URL = "https://api.gport.sbs";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  requestOTP: (phone: string) => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  completeProfile: (name: string, email: string) => Promise<void>;
  updateProfile: (profileData: Partial<User>) => void;
  logout: () => void;
  otpCodeForTesting?: string; // For displaying OTP during testing
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [otpCodeForTesting, setOtpCodeForTesting] = useState<string>("");

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
    setOtpCodeForTesting("");
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/auth/request-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number: phone }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "خطا در درخواست کد تایید");
      }
      
      // Store phone number for verification step
      setPhoneNumber(phone);
      
      // For testing - store the OTP code to display to user
      if (data.code) {
        setOtpCodeForTesting(data.code);
      }
      
      toast({
        title: "کد تایید ارسال شد",
        description: "لطفا کد دریافتی را وارد کنید",
        variant: "success",
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ارسال کد تایید");
      toast({
        title: "خطا",
        description: err instanceof Error ? err.message : "خطا در ارسال کد تایید",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (otp: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/auth/verify-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone_number: phoneNumber,
          code: otp
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "کد تایید نامعتبر است");
      }
      
      // Process user data from response
      const userData: User = {
        id: data.user.id,
        phone: data.user.phone_number,
        email: data.user.email || "",
        first_name: data.user.first_name || "",
        last_name: data.user.last_name || "",
        is_phone_verified: data.user.is_phone_verified,
        // Construct name from first_name and last_name if available
        name: `${data.user.first_name || ""} ${data.user.last_name || ""}`.trim(),
        isProfileComplete: Boolean(data.user.first_name && data.user.email),
        token: {
          access: data.access,
          refresh: data.refresh
        }
      };
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      
      toast({
        title: "ورود موفقیت‌آمیز",
        description: "به مستر تریدر خوش آمدید",
        variant: "success",
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "کد تایید نامعتبر است");
      toast({
        title: "خطا",
        description: err instanceof Error ? err.message : "کد تایید نامعتبر است",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completeProfile = async (name: string, email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, we would send an API request to update the profile
      // For now, we'll just update the local user state
      if (!user) {
        throw new Error("کاربر احراز هویت نشده است");
      }
      
      // Split name into first_name and last_name
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(' ') || "";
      
      // Update user profile locally
      const updatedUser: User = {
        ...user,
        name,
        email,
        first_name: firstName,
        last_name: lastName,
        isProfileComplete: true
      };
      
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      toast({
        title: "پروفایل تکمیل شد",
        description: "اطلاعات شما با موفقیت ذخیره شد",
        variant: "success",
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در تکمیل پروفایل");
      toast({
        title: "خطا",
        description: err instanceof Error ? err.message : "خطا در تکمیل پروفایل",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (profileData: Partial<User>) => {
    if (!user) return;
    
    // Update user data locally
    const updatedUser = { ...user, ...profileData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    
    toast({
      title: "بروزرسانی پروفایل",
      description: "اطلاعات پروفایل با موفقیت بروزرسانی شد",
      variant: "success",
    });
  };

  const logout = () => {
    setUser(null);
    setPhoneNumber("");
    localStorage.removeItem("user");
    
    toast({
      title: "خروج",
      description: "شما با موفقیت از حساب کاربری خود خارج شدید",
      variant: "info",
    });
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
        updateProfile, 
        logout,
        otpCodeForTesting
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
