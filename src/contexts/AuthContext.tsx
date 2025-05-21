
import React, { createContext, useContext, useState, useEffect } from "react";

// Define user type
export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

// Mock user data for demo
const mockUsers = [
  {
    id: "1",
    email: "user@example.com",
    password: "password",
    name: "کاربر نمونه",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  }
];

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      } else {
        throw new Error("نام کاربری یا رمز عبور اشتباه است");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ورود به سیستم");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userExists = mockUsers.some(u => u.email === email);
      
      if (userExists) {
        throw new Error("این ایمیل قبلاً ثبت شده است");
      }
      
      const newUser = {
        id: String(mockUsers.length + 1),
        name,
        email,
        avatar: `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg`
      };
      
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ثبت نام");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, register, logout }}>
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
