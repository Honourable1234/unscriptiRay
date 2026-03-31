'use client';

import { createContext, use, useState } from 'react';

type AuthContextValue = {
  isAuthenticated: boolean;
  isPremium: boolean;
  token: string | null;
  setAuth: (isAuthenticated: boolean, token: string | null) => void;
};

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  isPremium: false,
  token: null,
  setAuth: () => {},
});

export const AuthProvider = (props: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPremium] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const setAuth = (auth: boolean, t: string | null) => {
    setIsAuthenticated(auth);
    setToken(t);
  };

  return (
    <AuthContext value={{ isAuthenticated, isPremium, token, setAuth }}>
      {props.children}
    </AuthContext>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => use(AuthContext);
