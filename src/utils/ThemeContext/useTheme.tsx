import { useContext } from "react";
import ThemeProviderContext, { ThemeProviderContextType } from "./ThemeProviderContext";

const useTheme = (): ThemeProviderContextType => {
    const context = useContext(ThemeProviderContext);

    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }

    return context;
};

export default useTheme;
