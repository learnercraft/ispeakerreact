import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";

i18n.use(HttpApi) // Load translations via HTTP (use with i18next-http-backend)
    .use(LanguageDetector) // Detect user language
    .use(initReactI18next) // Pass the i18n instance to react-i18next.
    .init({
        lng: localStorage.getItem("ispeaker")
            ? JSON.parse(localStorage.getItem("ispeaker")).language
            : "en",
        fallbackLng: {
            "en-US": ["en"],
            "en-GB": ["en"],
            "zh-CN": ["zh"],
            default: ["en"],
        },
        load: "languageOnly",
        debug: true, // Enable debug messages
        backend: {
            loadPath: `${import.meta.env.BASE_URL}locales/{{lng}}.json`, // Translation files path
        },
        interpolation: {
            escapeValue: false, // React already escapes values
            format: function (value, format) {
                if (format === "capitalize") {
                    if (typeof value !== "string") return value;
                    return value.charAt(0).toUpperCase() + value.slice(1);
                }
                return value;
            },
        },
    })
    .then(() => {
        // Ensure the `lang` attribute on `html` is updated immediately
        const currentLang = i18n.language || "en";
        document.documentElement.setAttribute("lang", currentLang);
    });

export default i18n;
