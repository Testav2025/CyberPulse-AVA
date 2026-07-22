import React, { createContext, useContext, useEffect, useState } from "react";
import { PublicClientApplication, AuthenticationResult } from "@azure/msal-browser";
import { MsalProvider, useMsal } from "@azure/msal-react";
import { msalConfig, loginRequest } from "../lib/auth-config";

const msalInstance = new PublicClientApplication(msalConfig);

export interface AuthContextType {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isMsalInitialized, setIsMsalInitialized] = useState(false);

  useEffect(() => {
    msalInstance.initialize().then(() => {
      setIsMsalInitialized(true);
    });
  }, []);

  if (!isMsalInitialized) {
    return <div className="flex h-screen items-center justify-center">Loading authentication...</div>;
  }

  return (
    <MsalProvider instance={msalInstance}>
      <AuthContextWrapper>{children}</AuthContextWrapper>
    </MsalProvider>
  );
}

function AuthContextWrapper({ children }: { children: React.ReactNode }) {
  const { instance, accounts, inProgress } = useMsal();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const acquireToken = async () => {
      if (accounts.length > 0) {
        try {
          const response: AuthenticationResult = await instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0],
          });
          setToken(response.accessToken);
        } catch (error) {
          console.error("Token acquisition failed", error);
        }
      }
      setIsLoading(inProgress !== "none");
    };

    if (inProgress === "none") {
      acquireToken();
    }
  }, [accounts, inProgress, instance]);

  const value = {
    user: accounts[0] || null,
    token,
    isAuthenticated: accounts.length > 0 && !!token,
    isLoading: isLoading || inProgress !== "none",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
