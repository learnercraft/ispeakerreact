import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../i18n";
import App from "./App.jsx";
import "./styles/index.css";

const rootElement = document.getElementById("root") as HTMLElement;
const root = createRoot(rootElement);
root.render(
    <StrictMode>
        <App />
    </StrictMode>
);
