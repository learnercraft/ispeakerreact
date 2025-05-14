const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");
const path = require("path");

module.exports = {
    packagerConfig: {
        asar: true,
        name: "iSpeakerReact",
        executableName: "ispeakerreact",
        appCopyright:
            "Licensed under the Apache License, Version 2.0. Video and audio materials © Oxford University Press. All rights reserved.",
        appBundleId: "page.learnercraft.ispeakerreact",
        appCategoryType: "public.app-category.education",
        win32metadata: {
            CompanyName: "LearnerCraft Labs",
            ProductName: "iSpeakerReact",
        },
        prune: true,
        icon: path.join(__dirname, "dist", "appicon"),
        ignore: [
            "^/\\.github$", // Ignore the .github directory
            "^/venv$", // Ignore the venv directory
            //"^/node_modules$", // Ignore the node_modules directory
            "^/\\.vscode$", // Ignore .vscode if exists
            "^/tests$", // Ignore tests directory if exists
            "^/scripts$", // Ignore scripts directory if exists
            "^/\\..*$", // Ignore any dotfiles (e.g., .gitignore, .eslintrc, etc.)
            "^/(README|SECURITY|CONTRIBUTING).md$", // Ignore README.md file
            "^/package-lock.json$", // Ignore package-lock.json file
            "^/public$",
            "^/src$",
            "^/netlify.toml$",
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
            config: {
                options: {
                    icon: path.join(__dirname, "dist", "appicon.icns"),
                },
            },
        },
        {
            name: "@electron-forge/maker-deb",
            config: {
                options: {
                    icon: path.join(__dirname, "dist", "appicon.png"),
                },
            },
        },
        {
            name: "@electron-forge/maker-rpm",
            options: {
                icon: path.join(__dirname, "dist", "appicon.png"),
            },
        },
        {
            name: "@electron-forge/maker-squirrel",
            config: (arch) => ({
                setupIcon: path.join(__dirname, "dist", "appicon.ico"),
                iconUrl: path.join(__dirname, "dist", "appicon.ico"),
                setupExe: `iSpeakerReact-win32-${arch}-Setup.exe`,
            }),
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
