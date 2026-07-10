import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchUser = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (userData) {
        setUser({ ...authUser, role: userData.role });
        setIsAuthenticated(true);
        setIsAdmin(userData.role === "admin");
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUser();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Login error:", error.message);
      return false;
    }
    await fetchUser();
    return true;
  }, [fetchUser]);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
    }
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isAdmin,
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
