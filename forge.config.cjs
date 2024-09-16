const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");

module.exports = {
    packagerConfig: {
        asar: true,
        name: "iSpeakerReact",
        executableName: "ispeakerreact",
        appCopyright:
            "Licensed under the Apache License, Version 2.0. Video and audio materials © Oxford University Press. All rights reserved.",
        appBundleId: "page.yell0wsuit.ispeakerreact",
        appCategoryType: "public.app-category.education",
        win32metadata: {
            CompanyName: "yell0wsuit",
            ProductName: "iSpeakerReact",
            FileDescription:
                "An English-learning interactive tool written in React, designed to help learners practice speaking and listening",
        },
        prune: true,
        icon: "./dist/appicon",
        ignore: [
            "^/\\.github$", // Ignore the .github directory
            "^/venv$", // Ignore the venv directory
            //"^/node_modules$", // Ignore the node_modules directory
            "^/\\.vscode$", // Ignore .vscode if exists
            "^/tests$", // Ignore tests directory if exists
            "^/scripts$", // Ignore scripts directory if exists
            "^/\\..*$", // Ignore any dotfiles (e.g., .gitignore, .eslintrc, etc.)
            "^/README.md$", // Ignore README.md file
            "^/package-lock.json$", // Ignore package-lock.json file
            "^/public$",
            "^/src$",
        ],
    },
    rebuildConfig: {},
    makers: [
        {
            name: "@electron-forge/maker-zip",
            platforms: ["linux", "win32"],
        },
        {
            name: "@electron-forge/maker-dmg",
            config: {},
        },
        {
            name: "@electron-forge/maker-deb",
            config: {
                options: {
                    productName: "iSpeakerReact",
                },
            },
        },
        {
            name: "@electron-forge/maker-rpm",
            config: {},
        },
        {
            name: "@electron-forge/maker-squirrel",
            config: {},
        },
    ],
    plugins: [
        {
            name: "@electron-forge/plugin-auto-unpack-natives",
            config: {},
        },
        // Fuses are used to enable/disable various Electron functionality
        // at package time, before code signing the application
        new FusesPlugin({
            version: FuseVersion.V1,
            [FuseV1Options.RunAsNode]: false,
            [FuseV1Options.EnableCookieEncryption]: true,
            [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
            [FuseV1Options.EnableNodeCliInspectArguments]: false,
            [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
            [FuseV1Options.OnlyLoadAppFromAsar]: true,
        }),
    ],
};
