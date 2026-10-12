import React, { useCallback, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getToken, validateToken } from "@/helpers";

export type Profile = {
  name?: string;
  given_name?: string;
  email?: string;
  picture?: string;
};

export interface IAuth {
  signedIn: boolean;
  profile: Profile | null;
  signIn: (token: string, profile: Profile) => void;
  signOut: () => void;
}

// Fired by the API client when the server rejects the session token
export const UNAUTHORIZED_EVENT = "link-list:unauthorized";

const readSession = (): Profile | null => {
  try {
    const token = getToken();
    if (!token || validateToken(token).expired) return null;
    return JSON.parse(localStorage.getItem("loginData") ?? "{}");
  } catch {
    return null;
  }
};

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = React.createContext<IAuth>({
  signedIn: false,
  profile: null,
  signIn: () => {},
  signOut: () => {},
});

type Props = {
  children?: React.ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<Profile | null>(readSession);

  const signIn = useCallback((token: string, data: Profile) => {
    localStorage.setItem("token", token);
    localStorage.setItem("loginData", JSON.stringify(data));
    setProfile(data);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem("loginData");
    localStorage.removeItem("token");
    queryClient.clear();
    setProfile(null);
  }, [queryClient]);

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, signOut);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, signOut);
  }, [signOut]);

  return (
    <AuthContext.Provider
      value={{ signedIn: profile !== null, profile, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
