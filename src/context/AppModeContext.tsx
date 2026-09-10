import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AppMode = "BUSINESS" | "PERSONAL" | "COMBO";

interface AppModeContextValue {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
}

const AppModeContext = createContext<AppModeContextValue | null>(null);

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [appMode, setAppModeState] = useState<AppMode>(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("voicekhata:appMode");
      if (stored === "BUSINESS" || stored === "PERSONAL" || stored === "COMBO") {
        return stored as AppMode;
      }
    }
    return "BUSINESS"; // Default to BUSINESS
  });

  const setAppMode = (mode: AppMode) => {
    setAppModeState(mode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("voicekhata:appMode", mode);
    }
  };

  return (
    <AppModeContext.Provider value={{ appMode, setAppMode }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  const context = useContext(AppModeContext);
  if (!context) {
    throw new Error("useAppMode must be used within an AppModeProvider");
  }
  return context;
}
