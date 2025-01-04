import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
}

export const useAuth = () => {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check");
        const data = await response.json();

        setAuthState({
          isAuthenticated: data.isAuthenticated,
          isLoading: false,
          user: data.user,
        });
      } catch (error) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      }
    };

    checkAuth();
  }, []);

  const login = async () => {
    const response = await fetch("/api/auth/google");
    const { url } = await response.json();
    router.push(url);
  };

  const logout = async () => {
    await fetch("/api/auth/logout");
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
  };

  return {
    ...authState,
    login,
    logout,
  };
};
