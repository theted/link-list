import React from "react";
import ReactDOM from "react-dom/client";
import { AppWithRouter } from "./routes/index.tsx";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./AuthProvider.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GOOGLE_CLIENT_ID } from "./constants.ts";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <QueryClientProvider client={queryClient}>
          <AppWithRouter />
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </AuthProvider>
  </React.StrictMode>
);
