import { useContext } from "react";
import ThemeProviderContext from "./ThemeProviderContext.jsx";

const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }

    return context;
};

export default useTheme;
