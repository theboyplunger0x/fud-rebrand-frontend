import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "fud_theme";
const ThemeContext = createContext<(() => void) | null>(null);

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";

  try {
    return window.localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");

    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Keep the selected theme for this session when storage is unavailable.
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }, []);

  return <ThemeContext.Provider value={toggleTheme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const toggleTheme = useContext(ThemeContext);

  if (!toggleTheme) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return { toggleTheme };
}
