import { useState } from "react";

const AccentLocalStorage = () => {
    const [selectedAccent, setSelectedAccent] = useState(() => {
        const savedSettings = JSON.parse(localStorage.getItem("ispeaker"));
        return savedSettings?.selectedAccent || "american";
    });

    return [selectedAccent, setSelectedAccent];
};

export default AccentLocalStorage;
