import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from '../lib/api';
import { TOKEN_STORAGE_KEY } from '../lib/config';

// Define user type
export type User = {
  id: string;
  name?: string;
  phone: string;
  email?: string;
  avatar?: string;
  isProfileComplete: boolean;
};

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
  updateAvatar: (avatarUrl: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (stored) {
          const userData = await api.getProfile();
          const avatarData = await api.getAvatar();
          
          // Convert API user format to our app's user format
          setUser({
            id: String(userData.id),
            phone: userData.phone_number,
            name: `${userData.first_name} ${userData.last_name}`.trim(),
            email: userData.email,
            isProfileComplete: true,
            avatar: avatarData.avatar,
          });
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        api.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const requestOTP = async (phone: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await api.requestOTP(phone);
      setPhoneNumber(phone);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ارسال کد تایید");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (otp: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.verifyOTP(phoneNumber, otp);
      const avatarData = await api.getAvatar();
      
      // Convert API user format to our app's user format
      setUser({
        id: String(response.user.id),
        phone: response.user.phone_number,
        name: `${response.user.first_name} ${response.user.last_name}`.trim(),
        email: response.user.email,
        isProfileComplete: true,
        avatar: avatarData.avatar,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "کد تایید نامعتبر است");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const completeProfile = async (name: string, email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ');
      
      const updatedUser = await api.updateProfile({
        first_name: firstName,
        last_name: lastName,
        email: email,
      });
      
      const avatarData = await api.getAvatar();
      
      // Convert API user format to our app's user format
      setUser({
        id: String(updatedUser.id),
        phone: updatedUser.phone_number,
        name: `${updatedUser.first_name} ${updatedUser.last_name}`.trim(),
        email: updatedUser.email,
        isProfileComplete: true,
        avatar: avatarData.avatar,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در تکمیل پروفایل");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (profileData: Partial<User>) => {
    if (!user) return;
    
    // Convert our app's user format to API format
    const apiProfileData = {
      first_name: profileData.name ? profileData.name.split(' ')[0] : undefined,
      last_name: profileData.name ? profileData.name.split(' ').slice(1).join(' ') : undefined,
      email: profileData.email,
    };
    
    api.updateProfile(apiProfileData)
      .then(updatedUser => {
        setUser({
          ...user,
          name: `${updatedUser.first_name} ${updatedUser.last_name}`.trim(),
          email: updatedUser.email,
        });
      })
      .catch(err => {
        console.error('Failed to update profile:', err);
        setError("خطا در بروزرسانی پروفایل");
      });
  };

  const updateAvatar = (avatarUrl: string) => {
    if (!user) return;
    setUser({
      ...user,
      avatar: avatarUrl,
    });
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setPhoneNumber("");
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
        updateAvatar,
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
