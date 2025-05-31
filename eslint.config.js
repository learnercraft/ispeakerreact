import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    { ignores: ["dist"] },
    {
        extends: [
            js.configs.recommended,
            ...tseslint.configs.strict,
            ...tseslint.configs.stylistic,
        ],
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            globals: {
                ...globals.browser,
                __APP_VERSION__: "readonly",
            },
        },
        plugins: {
            react,
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
        },
        rules: {
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            ...react.configs["jsx-runtime"].rules,
            "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
            "@typescript-eslint/no-unused-vars": ["warn"],
            "@typescript-eslint/ban-ts-comment": [
                "error",
                {
                    "ts-expect-error": {
                        descriptionFormat: "^: TS\\d+ because .+$",
                    },
                },
            ],
        },
    }
);
