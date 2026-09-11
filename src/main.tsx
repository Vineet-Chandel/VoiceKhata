import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import "./index.css";
import App from "./App";

// Unregister any stale service workers in development mode to prevent cached blank screens
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);