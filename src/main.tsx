import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner"; // Notification system
import "./index.css";
import App from "./App";

// Create a client for React Query
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        {/* FIX: Moved toast to bottom-center to avoid blocking Search Bar */}
        <Toaster position="bottom-center" richColors />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
