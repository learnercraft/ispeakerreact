import { useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import AccentLocalStorage from "../../utils/AccentLocalStorage";

const AccentDropdown = ({ onAccentChange }) => {
    const [selectedAccent, setSelectedAccent] = AccentLocalStorage();

    const selectedAccentOptions = [
        { name: "American English", value: "american" },
        { name: "British English", value: "british" },
    ];

    useEffect(() => {
        const currentSettings = JSON.parse(localStorage.getItem("ispeaker")) || {};
        const updatedSettings = { ...currentSettings, selectedAccent: selectedAccent };
        localStorage.setItem("ispeaker", JSON.stringify(updatedSettings));
    }, [selectedAccent]);

    const handleAccentChange = (value) => {
        setSelectedAccent(value);
        onAccentChange(value);
    };

    return (
        <Dropdown className="my-4">
            <Dropdown.Toggle variant="success" id="dropdown-basic">
                <span className="fw-semibold">Accent:</span>{" "}
                {selectedAccentOptions.find((item) => item.value === selectedAccent).name}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {selectedAccentOptions.map((item) => (
                    <Dropdown.Item
                        key={item.value}
                        onClick={() => handleAccentChange(item.value)}
                        active={selectedAccent === item.value}>
                        {item.name}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default AccentDropdown;
