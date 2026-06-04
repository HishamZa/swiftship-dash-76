import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Mode = "light" | "dark";
const Ctx = createContext<{ mode: Mode; toggle: () => void }>({ mode: "light", toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("light");
  useEffect(() => {
    const saved = (typeof window !== "undefined" && (localStorage.getItem("theme") as Mode)) || "light";
    setMode(saved);
  }, []);
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);
  const toggle = () => {
    setMode((m) => {
      const next: Mode = m === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") localStorage.setItem("theme", next);
      return next;
    });
  };
  return <Ctx.Provider value={{ mode, toggle }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
