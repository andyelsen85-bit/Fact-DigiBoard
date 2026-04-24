import { createContext, useContext, ReactNode, useEffect, useState, useCallback } from "react";
import { useGetMe, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export interface AuthUser {
  id: number;
  username: string;
  email: string | null | undefined;
  role: string;
  mustChangePassword: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const queryClient = useQueryClient();
  const hasToken = typeof localStorage !== "undefined" && !!localStorage.getItem("auth-token");

  const { data, isLoading, refetch } = useGetMe({
    query: {
      retry: false,
      enabled: hasToken,
      queryKey: getGetMeQueryKey(),
    },
  });

  const logoutMutation = useLogout();

  useEffect(() => {
    if (data) {
      setUser(data as AuthUser);
    } else if (!isLoading) {
      setUser(null);
    }
  }, [data, isLoading]);

  const checkAuth = useCallback(() => {
    refetch();
  }, [refetch]);

  const logout = useCallback(() => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("auth-token");
        setUser(null);
        queryClient.clear();
        window.location.href = "/login";
      },
      onError: () => {
        localStorage.removeItem("auth-token");
        setUser(null);
        queryClient.clear();
        window.location.href = "/login";
      },
    });
  }, [logoutMutation, queryClient]);

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}