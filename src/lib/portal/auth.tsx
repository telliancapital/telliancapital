"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";

// TODO: replace with real auth provider (Supabase/Clerk)

const STORAGE_KEY = "portal:auth";

interface AuthContextValue {
  isAuthenticated: boolean;
  isReady: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Rehydrate from localStorage on mount (client-only — avoids SSR hydration mismatch)
  useEffect(() => {
    setIsAuthenticated(window.localStorage.getItem(STORAGE_KEY) === "1");
    setIsReady(true);
  }, []);

  const login = useCallback(() => {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
  }, []);

  return <AuthContext value={{ isAuthenticated, isReady, login, logout }}>{children}</AuthContext>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
