import React, { createContext, useContext, useState, useEffect } from "react";
import { api, User as ApiUser } from '../lib/api';
import { TOKEN_STORAGE_KEY } from '../lib/config';
import { clearAllCache } from '../lib/cache';

// Define user type - using the same structure as API but with our naming
export type User = {
  id: string;
  name?: string;
  phone: string;
  email?: string;
  avatar?: string;
  thumbnail?: string;
  isProfileComplete: boolean;
  identity_verified: boolean;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
};

export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  phoneNumber: string | null;
  setPhoneNumber: (phone: string) => void;
  requestOTP: (phone: string) => Promise<any>;
  verifyOTP: (otp: string) => Promise<void>;
  login: (phone: string, otp: string) => Promise<void>;
  completeProfile: (name: string, email: string) => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  updateAvatar: (avatarUrl: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  useEffect(() => {
    const initAuth = async () => {
      console.log('AuthContext: Initializing authentication...');
      setIsLoading(true);
      
      try {
        // Test API connection first
        const isConnected = await api.testApiConnection();
        console.log('AuthContext: API connection test result:', isConnected);
        
        if (!isConnected) {
          console.warn('AuthContext: API connection failed, but continuing...');
        }
        
        const tokens = api.getStoredTokens();
        console.log('AuthContext: Stored tokens found:', !!tokens);
        
        if (tokens) {
          try {
            const userProfile = await api.getProfile();
          const avatarData = await api.getAvatar();
          
          // Convert API user format to our app's user format
          setUser({
              id: String(userProfile.id),
              phone: userProfile.phone_number,
              name: `${userProfile.first_name} ${userProfile.last_name}`.trim(),
              email: userProfile.email,
              isProfileComplete: !!(userProfile.first_name && userProfile.last_name),
            avatar: avatarData.avatar,
              first_name: userProfile.first_name,
              last_name: userProfile.last_name,
              phone_number: userProfile.phone_number,
          });
            console.log('AuthContext: User restored from stored tokens');
          } catch (error) {
            console.error('AuthContext: Error restoring user session:', error);
            api.logout();
          }
        }
      } catch (error) {
        console.error('AuthContext: Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const requestOTP = async (phone: string) => {
    console.log("=== AuthContext: requestOTP START ===");
    console.log("AuthContext: requestOTP called with phone:", phone);
    console.log("AuthContext: Current phoneNumber state:", phoneNumber);
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("=== AuthContext: CALLING API ===");
      const response = await api.requestOTP(phone);
      console.log("=== AuthContext: API SUCCESS ===");
      console.log("AuthContext: OTP response received:", response);
      
      // Set phone number in context after successful request
      console.log("AuthContext: Setting phoneNumber to:", phone);
      setPhoneNumber(phone);
      
      return response;
    } catch (err) {
      console.log("=== AuthContext: API FAILED ===");
      console.error("AuthContext: Error in requestOTP:", err);
      
      let errorMessage = "خطا در ارسال کد تایید";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      console.log("AuthContext: Setting error:", errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      console.log("=== AuthContext: requestOTP END ===");
      setIsLoading(false);
    }
  };

  const verifyOTP = async (otp: string) => {
    console.log("=== AuthContext: verifyOTP START ===");
    console.log("AuthContext: verifyOTP called with otp:", otp, "and phone:", phoneNumber);
    setIsLoading(true);
    setError(null);
    
    if (!phoneNumber) {
      console.error("AuthContext: No phone number set");
      const errorMsg = "شماره تلفن تعریف نشده است";
      setError(errorMsg);
      setIsLoading(false);
      throw new Error(errorMsg);
    }
    
    try {
      console.log("=== AuthContext: CALLING VERIFY OTP API ===");
      const response = await api.verifyOTP(phoneNumber, otp);
      console.log("=== AuthContext: VERIFY OTP SUCCESS ===");
      console.log("AuthContext: verifyOTP response:", response);
      
      console.log("=== AuthContext: GETTING AVATAR ===");
      const avatarData = await api.getAvatar();
      console.log("AuthContext: Avatar data:", avatarData);
      
      // Check if profile is complete
      const isProfileComplete = !!(response.user.first_name && response.user.last_name);
      console.log("AuthContext: Profile complete check:", {
        first_name: response.user.first_name,
        last_name: response.user.last_name,
        isProfileComplete
      });
      
      // Convert API user format to our app's user format
      const userData = {
        id: String(response.user.id),
        phone: response.user.phone_number,
        name: `${response.user.first_name || ''} ${response.user.last_name || ''}`.trim(),
        email: response.user.email,
        isProfileComplete: isProfileComplete,
        identity_verified: response.user.identity_verified || false,
        avatar: avatarData.avatar,
        first_name: response.user.first_name,
        last_name: response.user.last_name,
        phone_number: response.user.phone_number,
      };
      
      console.log("=== AuthContext: SETTING USER ===");
      console.log("AuthContext: Setting user data:", userData);
      setUser(userData);
      
      console.log("AuthContext: OTP verified successfully, isProfileComplete:", isProfileComplete);
    } catch (err) {
      console.log("=== AuthContext: VERIFY OTP FAILED ===");
      console.error("AuthContext: Error in verifyOTP:", err);
      
      let errorMessage = "کد تایید نامعتبر است";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      console.log("AuthContext: Setting error:", errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      console.log("=== AuthContext: verifyOTP END ===");
      setIsLoading(false);
    }
  };

  // Add login method that's just an alias for verifyOTP
  const login = async (phone: string, otp: string) => {
    setPhoneNumber(phone);
    await verifyOTP(otp);
  };

  const completeProfile = async (name: string, email: string) => {
    console.log('AuthContext: completeProfile called with:', { name, email });
    setIsLoading(true);
    setError(null);
    
    // Check if user is authenticated
    const tokens = localStorage.getItem('auth_tokens');
    if (!tokens) {
      throw new Error('کاربر احراز هویت نشده است. لطفاً دوباره وارد شوید');
    }
    
    try {
      // Split name more carefully and ensure we have meaningful parts
      const nameParts = name.trim().split(/\s+/).filter(part => part.length > 0);
      
      // If only one word is provided, use it as first name
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      console.log('AuthContext: Name parts:', { 
        originalName: name,
        nameParts, 
        firstName, 
        lastName 
      });
      
      // Validate that we have at least a first name
      if (!firstName || firstName.length < 2) {
        throw new Error('نام وارد شده نامعتبر است');
      }
      
      const profileData = {
        first_name: firstName,
        last_name: lastName,
        email: email ? email.trim() : '', // Ensure email is clean
      };
      
      console.log('AuthContext: Sending profile data to API:', profileData);
      
      const updatedUser = await api.updateProfile(profileData);
      console.log('AuthContext: Received updated user from API:', updatedUser);
      
      const avatarData = await api.getAvatar();
      console.log('AuthContext: Received avatar data:', avatarData);
      
      // Convert API user format to our app's user format
      const newUser = {
        id: String(updatedUser.id),
        phone: updatedUser.phone_number,
        name: `${updatedUser.first_name} ${updatedUser.last_name}`.trim(),
        email: updatedUser.email,
        isProfileComplete: true,
        avatar: avatarData.avatar,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        phone_number: updatedUser.phone_number,
      };
      
      console.log('AuthContext: Setting new user state:', newUser);
      setUser(newUser);
      
    } catch (err: any) {
      console.error('AuthContext: Error in completeProfile:', err);
      
      let errorMessage = "خطا در تکمیل پروفایل";
      
      if (err.message && err.message.includes('Failed to update profile')) {
        // Parse the specific error from API response
        if (err.message.includes('400')) {
          errorMessage = "اطلاعات وارد شده نامعتبر است";
        } else if (err.message.includes('401')) {
          errorMessage = "احراز هویت نامعتبر است. لطفاً دوباره وارد شوید";
        } else if (err.message.includes('422')) {
          errorMessage = "فرمت اطلاعات وارد شده صحیح نیست";
        } else if (err.message.includes('first_name')) {
          errorMessage = "نام وارد شده نامعتبر است";
        } else if (err.message.includes('email')) {
          errorMessage = "ایمیل وارد شده نامعتبر است";
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    if (!user) return;
    
    setError(null);
    
    // Convert our app's user format to API format
    const apiProfileData = {
      first_name: profileData.first_name || (profileData.name ? profileData.name?.split(' ')[0] : undefined),
      last_name: profileData.last_name || (profileData.name ? profileData.name?.split(' ').slice(1).join(' ') : undefined),
      email: profileData.email,
    };
    
    console.log('AuthContext: updateProfile called with data:', profileData);
    console.log('AuthContext: Converted to API format:', apiProfileData);
    
    try {
      const updatedUser = await api.updateProfile(apiProfileData);
      console.log('AuthContext: Profile updated successfully:', updatedUser);
      
      setUser({
        ...user,
        name: `${updatedUser.first_name} ${updatedUser.last_name}`.trim(),
        email: updatedUser.email,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
      });
    } catch (err: any) {
      console.error('AuthContext: Failed to update profile:', err);
      setError("خطا در بروزرسانی پروفایل");
      throw err;
    }
  };

  const updateAvatar = (avatarUrl: string) => {
    if (!user) return;
    setUser({
      ...user,
      avatar: avatarUrl,
    });
  };

  const logout = () => {
    console.log('AuthContext: Starting logout process');
    
    // Clear API state
    api.logout();
    
    // Reset all local state
    setUser(null);
    setPhoneNumber("");
    setError(null);
    
    // Clear all cache and localStorage
    clearAllCache();
    
    // Dispatch custom event to notify other contexts
    window.dispatchEvent(new CustomEvent('auth:logout'));
    
    // Force reload to clear any remaining cached state
    setTimeout(() => {
      window.location.replace('/');
    }, 100);
  };

  const refreshUser = async () => {
    try {
      const response = await api.getProfile();
      const avatarData = await api.getAvatar();
      
      // Check if profile is complete
      const isProfileComplete = !!(response.first_name && response.last_name);
      
      // Convert API user format to our app's user format
      const userData = {
        id: String(response.id),
        phone: response.phone_number,
        name: `${response.first_name || ''} ${response.last_name || ''}`.trim(),
        email: response.email,
        isProfileComplete: isProfileComplete,
        identity_verified: response.identity_verified || false,
        avatar: avatarData.avatar,
        first_name: response.first_name,
        last_name: response.last_name,
        phone_number: response.phone_number,
      };
      
      setUser(userData);
    } catch (err) {
      console.error('Error refreshing user data:', err);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    phoneNumber,
    setPhoneNumber,
    requestOTP,
    verifyOTP,
    login,
    logout,
    completeProfile,
    updateProfile,
    updateAvatar,
    refreshUser,
  };

  return (
    <AuthContext.Provider 
      value={value}
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
