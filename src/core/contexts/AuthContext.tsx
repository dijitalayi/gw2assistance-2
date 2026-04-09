"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  apiKey: null,
  setApiKey: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedKey = localStorage.getItem('gw2_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
    setIsLoading(false);
  }, []);

  const setApiKey = (key: string | null) => {
    if (key) {
      localStorage.setItem('gw2_api_key', key);
      
      // Sync with Angular LiveMap via Same-Origin Cookie
      const livemapState = {
        apiKey: key,
        liveMapEnabled: true,
        selectedChannel: "Global"
      };
      document.cookie = `gw2.io_Settings=${encodeURIComponent(JSON.stringify(livemapState))}; path=/; max-age=31536000`;
    } else {
      localStorage.removeItem('gw2_api_key');
      document.cookie = 'gw2.io_Settings=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    setApiKeyState(key);
  };

  return (
    <AuthContext.Provider value={{ apiKey, setApiKey, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
