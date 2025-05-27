import { createContext } from "react";

interface ThemeProviderContextType {
    theme: string;
    setTheme: (newTheme: string) => Promise<void>;
}

const ThemeProviderContext = createContext<ThemeProviderContextType>({
    theme: "auto",
    setTheme: async () => {
        // Intentionally empty default implementation
    },
});

export default ThemeProviderContext;
