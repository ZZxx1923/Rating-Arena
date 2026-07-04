/**
 * AuthContext - Employee Evaluation System
 * Design: Arctic Glass (Corporate Glassmorphism)
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { apiLogin, apiLogout, ApiUser as User } from "@/lib/api"; // Import API functions and User type
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Helper to get user from stored token
const getUserFromToken = (): User | null => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        return null;
      }
      return { id: decoded.id, username: decoded.username, role: decoded.role };
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("token");
      return null;
    }
  }
  return null;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getUserFromToken());

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const { user: loggedInUser } = await apiLogin(username, password);
      setUser(loggedInUser);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      setUser(null);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(() => {
    setUser(getUserFromToken());
  }, []);

  useEffect(() => {
    // Re-check user on mount and on token changes
    refreshUser();
    const handleStorageChange = () => {
      refreshUser();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
