import { useEffect, useState } from "react";
import { BsAlphabet, BsCardChecklist, BsChatText } from "react-icons/bs";
import { CgMenuLeft } from "react-icons/cg";
import { FaGithub } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import { IoHomeOutline, IoMicOutline } from "react-icons/io5";
import { LiaToolsSolid } from "react-icons/lia";
import { PiExam } from "react-icons/pi";

import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
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
    const location = useLocation();
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
        {
            to: "/",
            icon: <IoHomeOutline className="h-6 w-6" />,
            label: t("navigation.home"),
            childMenu: null,
        },
        {
            to: null,
            icon: <IoMicOutline className="h-6 w-6" />,
            label: t("navigation.practice"),
            childMenu: [
                {
                    to: "/sounds",
                    icon: <IoMicOutline className="h-6 w-6" />,
                    label: t("navigation.sounds"),
                },
                {
                    to: "/words",
                    icon: <BsAlphabet className="h-6 w-6" />,
                    label: t("navigation.words"),
                },
            ],
        },
        {
            to: "/exercises",
            icon: <BsCardChecklist className="h-6 w-6" />,
            label: t("navigation.exercises"),
            childMenu: null,
        },
        {
            to: "/conversations",
            icon: <BsChatText className="h-6 w-6" />,
            label: t("navigation.conversations"),
            childMenu: null,
        },
        {
            to: "/exams",
            icon: <PiExam className="h-6 w-6" />,
            label: t("navigation.exams"),
            childMenu: null,
        },
        {
            to: "/settings",
            icon: <LiaToolsSolid className="h-6 w-6" />,
            label: t("navigation.settings"),
            childMenu: null,
        },
    ];

    return (
        <nav
            className={`navbar sticky top-0 z-300 w-full flex-none backdrop-blur-md backdrop-brightness-125 backdrop-saturate-200 ${navbarClass}`}
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
                        <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4 text-base">
                            {menuItems.map((item) =>
                                item.childMenu ? (
                                    item.childMenu.map((child) => (
                                        <li key={child.to}>
                                            <NavLink
                                                to={child.to}
                                                aria-label={child.label}
                                                className={({ isActive }) =>
                                                    isActive ? "menu-active" : ""
                                                }
                                            >
                                                {child.icon} {child.label}
                                            </NavLink>
                                        </li>
                                    ))
                                ) : (
                                    <li key={item.to}>
                                        <NavLink
                                            to={item.to}
                                            aria-label={item.label}
                                            className={({ isActive }) =>
                                                isActive ? "menu-active" : ""
                                            }
                                        >
                                            {item.icon} {item.label}
                                        </NavLink>
                                    </li>
                                )
                            )}
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
                    <span lang="en" className="hidden md:block">
                        iSpeakerReact
                    </span>
                </NavLink>
            </div>

            {/* Desktop Navigation */}
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 lg:text-base">
                    {menuItems.map((item) => {
                        const isActive =
                            item.childMenu?.some((child) => location.pathname === child.to) ||
                            location.pathname === item.to;

                        return item.childMenu ? (
                            <li
                                key={item.label}
                                className="dropdown dropdown-bottom cursor-pointer"
                            >
                                <div
                                    tabIndex={0}
                                    role="button"
                                    className={`flex items-center space-x-1 ${
                                        isActive ? "menu-active" : ""
                                    }`}
                                    aria-label={item.label}
                                >
                                    {item.icon} {item.label}
                                </div>
                                <ul
                                    tabIndex={0}
                                    className="menu border-base-200 dropdown-content rounded-box bg-base-100 w-52 border p-2 shadow-sm"
                                >
                                    {item.childMenu.map((child) => (
                                        <li key={child.to}>
                                            <NavLink
                                                to={child.to}
                                                aria-label={child.label}
                                                className={({ isActive }) =>
                                                    isActive ? "menu-active" : ""
                                                }
                                            >
                                                {child.icon} {child.label}
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ) : (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    aria-label={item.label}
                                    className={({ isActive }) => (isActive ? "menu-active" : "")}
                                >
                                    {item.icon} {item.label}
                                </NavLink>
                            </li>
                        );
                    })}
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
                    <span className="ms-1 hidden items-center space-x-1 md:inline-flex">
                        <span lang="en">GitHub</span>
                        <FiExternalLink />
                    </span>
                </button>
            </div>
        </nav>
    );
};

export default TopNavBar;
