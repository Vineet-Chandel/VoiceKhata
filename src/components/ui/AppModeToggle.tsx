import { Store, User } from "lucide-react";
import { useAppMode } from "@/context/AppModeContext";

export function AppModeToggle() {
  const { appMode, setAppMode } = useAppMode();

  return (
    <div className="flex items-center gap-1 rounded-full border bg-muted/20 p-1">
      <button
        onClick={() => setAppMode("BUSINESS")}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
          appMode === "BUSINESS"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted/50"
        }`}
      >
        <Store className="h-3.5 w-3.5" />
        Business
      </button>
      <button
        onClick={() => setAppMode("PERSONAL")}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
          appMode === "PERSONAL"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted/50"
        }`}
      >
        <User className="h-3.5 w-3.5" />
        Personal
      </button>
      <button
        onClick={() => setAppMode("COMBO")}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
          appMode === "COMBO"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted/50"
        }`}
        title="Combo"
      >
        <Store className="h-3.5 w-3.5" />
        <span className="opacity-60">+</span>
        <User className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
