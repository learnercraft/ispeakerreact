import { Dropdown } from "react-bootstrap";
import { CircleHalf, MoonStarsFill, SunFill } from "react-bootstrap-icons";
import { useContext } from "react";
import { ThemeContext } from "../utils/ThemeProvider";

const ThemeSwitcher = () => {
    const { theme, setTheme, showToggleButton } = useContext(ThemeContext);

    const themeItems = [
        { name: "Light", value: "light", icon: <SunFill className="bi me-2" /> },
        { name: "Dark", value: "dark", icon: <MoonStarsFill className="bi me-2" /> },
        { name: "Auto", value: "auto", icon: <CircleHalf className="bi me-2" /> },
    ];

    return (
        <>
            <Dropdown className={`position-fixed bottom-0 end-0 mb-3 me-3 z-3 ${showToggleButton ? "" : "invisible"}`}>
                <Dropdown.Toggle variant="primary" id="dropdown-theme" className="py-2 d-flex align-items-center">
                    {themeItems.find((item) => item.value === theme).icon}
                    Toggle theme
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    {themeItems.map((item) => (
                        <Dropdown.Item
                            key={item.value}
                            onClick={() => setTheme(item.value)}
                            active={theme === item.value}>
                            {item.icon}
                            {item.name}
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown>
        </>
    );
};

export default ThemeSwitcher;
