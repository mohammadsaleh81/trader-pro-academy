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
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  fetchProfile: () => Promise<void>;
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
      // Fetch latest profile data from server if user is logged in
      fetchProfile();
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

  const fetchProfile = async () => {
    if (!user?.token?.access) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token.access}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error("خطا در دریافت اطلاعات پروفایل");
      }
      
      const data = await response.json();
      
      // Update user profile with fetched data
      const updatedUser: User = {
        ...user,
        id: data.id,
        phone: data.phone_number,
        email: data.email || "",
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        is_phone_verified: data.is_phone_verified,
        // Construct name from first_name and last_name
        name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        isProfileComplete: Boolean(data.first_name && data.email),
      };
      
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت اطلاعات پروفایل");
      console.error("Error fetching profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const completeProfile = async (name: string, email: string) => {
    if (!user?.token?.access) {
      throw new Error("کاربر احراز هویت نشده است");
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Split name into first_name and last_name
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(' ') || "";
      
      // Create form data
      const formData = new FormData();
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('email', email);
      
      // Send API request to update profile
      const response = await fetch(`${API_BASE_URL}/user/profile/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token.access}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("خطا در بروزرسانی پروفایل");
      }
      
      const data = await response.json();
      
      // Update user profile with response data
      const updatedUser: User = {
        ...user,
        name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        email: data.email || "",
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        isProfileComplete: true,
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
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    if (!user?.token?.access) {
      toast({
        title: "خطا",
        description: "کاربر احراز هویت نشده است",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create form data for the API request
      const formData = new FormData();
      
      // Add fields to formData if they exist in profileData
      if (profileData.first_name !== undefined || profileData.name) {
        // If first_name is directly provided, use it
        // Otherwise extract from name
        const firstName = profileData.first_name || 
          (profileData.name ? profileData.name.split(' ')[0] : user.first_name || "");
        formData.append('first_name', firstName);
      }
      
      if (profileData.last_name !== undefined || profileData.name) {
        // If last_name is directly provided, use it
        // Otherwise extract from name
        const lastName = profileData.last_name || 
          (profileData.name ? profileData.name.split(' ').slice(1).join(' ') : user.last_name || "");
        formData.append('last_name', lastName);
      }
      
      if (profileData.email !== undefined) {
        formData.append('email', profileData.email);
      }
      
      // Send the API request
      const response = await fetch(`${API_BASE_URL}/user/profile/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token.access}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("خطا در بروزرسانی پروفایل");
      }
      
      const data = await response.json();
      
      // Update user data locally
      const updatedUser: User = {
        ...user,
        name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        email: data.email || "",
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        phone: data.phone_number,
        is_phone_verified: data.is_phone_verified,
      };
      
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      toast({
        title: "بروزرسانی پروفایل",
        description: "اطلاعات پروفایل با موفقیت بروزرسانی شد",
        variant: "success",
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در بروزرسانی پروفایل");
      toast({
        title: "خطا",
        description: err instanceof Error ? err.message : "خطا در بروزرسانی پروفایل",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
        fetchProfile,
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
