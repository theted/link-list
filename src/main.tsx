import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { AppWithRouter } from "./routes/index.tsx";
import { AuthProvider } from "./AuthProvider.tsx";
import { ToastProvider } from "./components/Toasts.tsx";
import { GOOGLE_CLIENT_ID } from "./constants.ts";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // A 401 signs you out; retrying it only delays that
      retry: (count, error) => count < 2 && !/sign|token/i.test(error.message),
    },
  },
});

// Render once the typeface is in, so nothing reflows from the fallback font;
// index.html's spinner covers the wait, which is capped
const fontsReady = Promise.race([
  Promise.all(
    [400, 600, 800].map((weight) =>
      document.fonts.load(`${weight} 1rem "Bricolage Grotesque Variable"`)
    )
  ),
  new Promise((resolve) => setTimeout(resolve, 1500)),
]).catch(() => {});

fontsReady.then(() =>
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <MotionConfig reducedMotion="user">
              <ToastProvider>
                <AppWithRouter />
              </ToastProvider>
            </MotionConfig>
          </GoogleOAuthProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  )
);
