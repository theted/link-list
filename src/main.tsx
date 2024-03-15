import React from "react";
import ReactDOM from "react-dom/client";
import { AppWithRouter } from "./routes/index.tsx";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppWithRouter />
    </QueryClientProvider>
  </React.StrictMode>
);
