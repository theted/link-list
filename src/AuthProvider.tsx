import React, { useContext, useEffect, useState } from "react";
// import { WhoAmIRequest } from "@/api";

// TODO: get from server
export const WhoAmIRequest = async () => {
  console.log("Getting user...");
  const fromLocalStorage = localStorage.getItem("loginData");
  return fromLocalStorage ? JSON.parse(fromLocalStorage) : false;
};

export enum AuthStatus {
  Loading,
  SignedIn,
  SignedOut,
}

export interface IAuth {
  authStatus?: AuthStatus;
  signIn?: any;
  signOut?: any;
  userData?: any;
}

const defaultState: IAuth = {
  authStatus: AuthStatus.Loading,
};

type Props = {
  children?: React.ReactNode;
};

export const AuthContext = React.createContext(defaultState);

export const AuthIsSignedIn = ({ children }: Props) => {
  const { authStatus }: IAuth = useContext(AuthContext);
  return <>{authStatus === AuthStatus.SignedIn ? children : null}</>;
};

export const AuthIsNotSignedIn = ({ children }: Props) => {
  const { authStatus }: IAuth = useContext(AuthContext);
  return <>{authStatus === AuthStatus.SignedOut ? children : null}</>;
};

export const AuthProvider = ({ children }: Props) => {
  const [authStatus, setAuthStatus] = useState(AuthStatus.Loading);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    async function getWhoAmI() {
      try {
        console.log("Try get user...");
        const res = await WhoAmIRequest();

        if (res) {
          console.log({ AUTH: res });
          setAuthStatus(AuthStatus.SignedIn);
          setUserData(res);
        } else {
          setAuthStatus(AuthStatus.SignedOut);
        }
      } catch (e) {
        setAuthStatus(AuthStatus.SignedOut);
      }
    }
    getWhoAmI().then();
  }, [setAuthStatus, authStatus]);

  function signIn(data: any) {
    setAuthStatus(AuthStatus.SignedIn);
    // TODO: set jwt
  }

  function signOut() {
    console.log("Logging out...");
    localStorage.removeItem("loginData");
    document.cookie = "";
    setAuthStatus(AuthStatus.SignedOut);
  }

  const state: IAuth = {
    authStatus,
    userData,
    signIn,
    signOut,
  };

  if (authStatus === AuthStatus.Loading) {
    return null;
  }

  console.log({ state });

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
