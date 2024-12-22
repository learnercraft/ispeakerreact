import { useEffect, useState } from "react";
import { BsCardChecklist, BsChatText } from "react-icons/bs";
import { IoHomeOutline, IoMicOutline } from "react-icons/io5";
import { LiaToolsSolid } from "react-icons/lia";
import { PiExam } from "react-icons/pi";

import { useTranslation } from "react-i18next";
import { CgMenuLeft } from "react-icons/cg";
import { FaGithub } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import { NavLink } from "react-router-dom";
import { useTheme } from "../../utils/ThemeContext/useTheme";
import { isElectron } from "../../utils/isElectron";

const openExternal = (url) => {
    if (isElectron()) {
        window.electron.openExternal(url);
    } else {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.click();
    }
};

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

    const navbarClass = isDarkMode ? "bg-slate-600/50" : "bg-lime-300/75";

    const menuItems = [
        { to: "/", icon: <IoHomeOutline className="h-6 w-6" />, label: t("navigation.home") },
        {
            to: "/sounds",
            icon: <IoMicOutline className="h-6 w-6" />,
            label: t("navigation.sounds"),
        },
        {
            to: "/exercises",
            icon: <BsCardChecklist className="h-6 w-6" />,
            label: t("navigation.exercises"),
        },
        {
            to: "/conversations",
            icon: <BsChatText className="h-6 w-6" />,
            label: t("navigation.conversations"),
        },
        { to: "/exams", icon: <PiExam className="h-6 w-6" />, label: t("navigation.exams") },
        {
            to: "/settings",
            icon: <LiaToolsSolid className="h-6 w-6" />,
            label: t("navigation.settings"),
        },
    ];

    return (
        <nav
            className={`navbar sticky top-0 z-[300] w-full flex-none backdrop-blur-md backdrop-brightness-125 backdrop-saturate-200 ${navbarClass}`}
        >
            <div className="navbar md:navbar-start">
                {/* Mobile Drawer */}
                <div className="lg:hidden">
                    <label htmlFor="mobile-menu" className="btn btn-ghost drawer-button">
                        <CgMenuLeft size="1.5em" />
                    </label>
                    <input type="checkbox" id="mobile-menu" className="drawer-toggle hidden" />
                    <div className="drawer-side">
                        <label htmlFor="mobile-menu" className="drawer-overlay"></label>
                        <ul className="menu min-h-full w-80 bg-base-200 p-4 text-base text-base-content">
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
                <NavLink
                    className="btn btn-ghost no-animation flex w-full items-center justify-center md:w-auto lg:text-xl"
                    to="/"
                >
                    <img
                        alt="iSpeakerReact logo"
                        src={logoSrc}
                        width="60"
                        height="60"
                        className="h-12 w-12"
                    />
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
                <button
                    type="button"
                    className="btn btn-ghost no-animation flex items-center"
                    onClick={() =>
                        openExternal("https://github.com/yllst-testing-labs/ispeakerreact/")
                    }
                >
                    <FaGithub size="1.5em" />
                    <span className="ml-1 hidden items-center space-x-1 md:inline-flex">
                        <span>GitHub</span>
                        <FiExternalLink />
                    </span>
                </button>
            </div>
        </nav>
    );
};

export default TopNavBar;
