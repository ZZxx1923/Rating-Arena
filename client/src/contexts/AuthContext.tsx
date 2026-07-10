/**
 * AuthContext - Employee Evaluation System
 * Design: Arctic Glass (Corporate Glassmorphism)
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getCurrentUser, login as storeLogin, logout as storeLogout, type User } from "@/lib/store";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());

  const login = useCallback((username: string, password: string): boolean => {
    const result = storeLogin(username, password);
    if (result) {
      setUser(result);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    storeLogout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(() => {
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    // Sync with storage changes (e.g., role changes)
    const handleStorage = () => {
      setUser(getCurrentUser());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      login,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
