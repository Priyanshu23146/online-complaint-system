import React, { createContext, useContext, useEffect, useState } from "react";

// Define what theme context will provide
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

// Create context (initial value doesn't matter, provider will override)
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider component - wraps entire app
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // On mount, read user's preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    // Keep the app light by default; use the saved choice when available.
    const shouldBeDark = savedTheme === "dark";

    setIsDark(shouldBeDark);
    setIsLoaded(true);
  }, []);

  // When isDark changes, update DOM and localStorage
  useEffect(() => {
    if (!isLoaded) return; // Don't run until loaded

    const root = document.documentElement;

    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark, isLoaded]);

  const toggleTheme = () => setIsDark((currentIsDark) => !currentIsDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme anywhere
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
