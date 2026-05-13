import { create } from "zustand";

type ThemeMode = "light" | "dark";

interface UiState {
  sidebarOpen: boolean;
  theme: ThemeMode;
  setSidebarOpen: (open: boolean) => void;
  toggleTheme: () => void;
  hydrateTheme: () => void;
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}

export const useUiStore = create<UiState>((set, get) => ({
  sidebarOpen: false,
  theme: "light",
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    applyTheme(next);
    set({ theme: next });
  },
  hydrateTheme: () => {
    const stored = localStorage.getItem("theme") as ThemeMode | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = stored ?? (prefersDark ? "dark" : "light");
    applyTheme(next);
    set({ theme: next });
  },
}));
