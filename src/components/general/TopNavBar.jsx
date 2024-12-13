import { useEffect, useState } from "react";
import { CardChecklist, ChatDots, ClipboardCheck, Gear, House, Mic } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";
import { CgMenuLeft } from "react-icons/cg";
import { FaGithub } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import { NavLink } from "react-router-dom";
import { useTheme } from "../../utils/ThemeContext/useTheme";

const TopNavBar = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const [, setCurrentTheme] = useState(theme);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const updateTheme = () => {
            if (theme === "auto") {
                const systemPrefersDark = mediaQuery.matches;
                setCurrentTheme(systemPrefersDark ? "dark" : "light");
                setIsDarkMode(systemPrefersDark);
            } else {
                setCurrentTheme(theme);
                setIsDarkMode(theme === "dark");
            }
        };

        // Initial check and listener
        updateTheme();
        if (theme === "auto") {
            mediaQuery.addEventListener("change", updateTheme);
        }

        return () => {
            mediaQuery.removeEventListener("change", updateTheme);
        };
    }, [theme]);

    const logoSrc = isDarkMode
        ? `${import.meta.env.BASE_URL}images/logos/ispeakerreact-no-background-darkmode.svg`
        : `${import.meta.env.BASE_URL}images/logos/ispeakerreact-no-background.svg`;

    const navbarClass = isDarkMode ? "bg-slate-600 md:bg-slate-600/50" : "bg-lime-300 md:bg-lime-300/50";

    const menuItems = [
        { to: "/", icon: <House />, label: t("navigation.home") },
        { to: "/sounds", icon: <Mic />, label: t("navigation.sounds") },
        { to: "/exercises", icon: <CardChecklist />, label: t("navigation.exercises") },
        { to: "/conversations", icon: <ChatDots />, label: t("navigation.conversations") },
        { to: "/exams", icon: <ClipboardCheck />, label: t("navigation.exams") },
        { to: "/settings", icon: <Gear />, label: t("navigation.settings") },
    ];

    return (
        <nav
            className={`navbar sticky top-0 z-[300] w-full backdrop-blur-none md:backdrop-blur-md backdrop-brightness-100 md:backdrop-brightness-125 backdrop-saturate-200 flex-none ${navbarClass}`}>
            <div className="navbar md:navbar-start">
                {/* Mobile Drawer */}
                <div className="lg:hidden">
                    <label htmlFor="mobile-menu" className="btn btn-ghost drawer-button">
                        <CgMenuLeft size="1.5em" />
                    </label>
                    <input type="checkbox" id="mobile-menu" className="drawer-toggle hidden" />
                    <div className="drawer-side">
                        <label htmlFor="mobile-menu" className="drawer-overlay"></label>
                        <ul className="menu bg-base-200 text-base-content text-base min-h-full w-80 p-4">
                            {menuItems.map((item) => (
                                <li key={item.to}>
                                    <NavLink to={item.to} aria-label={item.label}>
                                        {item.icon} {item.label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Logo */}
                <NavLink className="btn btn-ghost lg:text-xl flex items-center justify-center w-full md:w-auto" to="/">
                    <img alt="iSpeakerReact logo" src={logoSrc} width="60" height="60" className="h-12 w-12" />
                    <span className="hidden md:block">iSpeakerReact</span>
                </NavLink>
            </div>

            {/* Desktop Navigation */}
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 lg:text-base">
                    {menuItems.map((item) => (
                        <li key={item.to}>
                            <NavLink to={item.to} aria-label={item.label}>
                                {item.icon} {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>

            {/* GitHub Link */}
            <div className="navbar-end">
                <a
                    className="btn btn-ghost flex items-center"
                    href="https://github.com/yllst-testing-labs/ispeakerreact"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub repository">
                    <FaGithub size="1.5em" />
                    <span className="hidden md:inline-flex items-center space-x-1 ml-1">
                        <span>GitHub</span>
                        <FiExternalLink />
                    </span>
                </a>
            </div>
        </nav>
    );
};

export default TopNavBar;
