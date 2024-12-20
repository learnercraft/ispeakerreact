import { createContext } from "react";

const ThemeProviderContext = createContext({
    theme: "auto",
    setTheme: () => null,
});

export default ThemeProviderContext;
