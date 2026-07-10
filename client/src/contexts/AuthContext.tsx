/**
 * AuthContext - Employee Evaluation System
 * Design: Arctic Glass (Corporate Glassmorphism)
 * Updated to support both Supabase and localStorage
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getCurrentUser, login as storeLogin, logout as storeLogout, type User } from "@/lib/store";
import { getCurrentAuthUser, logoutUser } from "@/lib/supabaseAuth";

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
  const [isSupabaseUser, setIsSupabaseUser] = useState(false);

  const login = useCallback((username: string, password: string): boolean => {
    const result = storeLogin(username, password);
    if (result) {
      setUser(result);
      setIsSupabaseUser(false);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(async () => {
    if (isSupabaseUser) {
      await logoutUser();
    } else {
      storeLogout();
    }
    setUser(null);
    setIsSupabaseUser(false);
  }, [isSupabaseUser]);

  const refreshUser = useCallback(() => {
    const localUser = getCurrentUser();
    if (localUser) {
      setUser(localUser);
      setIsSupabaseUser(false);
    }
  }, []);

  // Check for Supabase user on mount
  useEffect(() => {
    const checkSupabaseUser = async () => {
      try {
        const supabaseUser = await getCurrentAuthUser();
        if (supabaseUser) {
          // Convert Supabase user to local User format
          const convertedUser: User = {
            id: supabaseUser.id,
            username: supabaseUser.email,
            password: "", // Not stored
            role: supabaseUser.role as "admin" | "user",
            createdAt: supabaseUser.createdAt,
          };
          setUser(convertedUser);
          setIsSupabaseUser(true);
        }
      } catch (error) {
        console.error("Error checking Supabase user:", error);
      }
    };

    checkSupabaseUser();
  }, []);

  useEffect(() => {
    // Sync with storage changes (e.g., role changes)
    const handleStorage = () => {
      const localUser = getCurrentUser();
      if (localUser) {
        setUser(localUser);
        setIsSupabaseUser(false);
      }
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
