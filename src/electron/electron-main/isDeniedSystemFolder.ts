import { app } from "electron";
import applog from "electron-log";
import path from "node:path";
import process from "node:process";
import fs from "node:fs";

const isDeniedSystemFolder = (folderPath: string) => {
    // Normalize and resolve the path to prevent path traversal attacks
    // This converts to absolute path and resolves ".." and "." segments
    let absoluteInput: string | undefined;
    try {
        // Resolve symlinks for robust security
        absoluteInput = fs.realpathSync.native(path.resolve(folderPath));
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.warn("Error getting realpath:", errorMsg);
        applog.error("Error getting realpath:", errorMsg);
        // If we can't resolve the path, deny access for safety
        return true;
    }

    const platform = process.platform;
    const isCaseSensitive = platform !== "win32";
    // Handle potential trailing slashes inconsistencies
    if (!absoluteInput.endsWith(path.sep) && absoluteInput !== path.sep) {
        absoluteInput += path.sep;
    }

    console.log("Checking path:", absoluteInput);
    applog.info("Checking path:", absoluteInput);

    // Define protected system locations based on platform
    let denyList = [];

    if (platform === "win32") {
        // Windows
        const systemDrive = process.env.SystemDrive || "C:";
        const systemRoot = process.env.SystemRoot || path.join(systemDrive, "Windows");

        denyList = [
            // System directories
            systemDrive + path.sep,
            systemRoot,
            path.join(systemDrive, "Program Files"),
            path.join(systemDrive, "Program Files (x86)"),
            path.join(systemDrive, "Users"),
            path.join(systemRoot, "System32"),
            path.join(systemRoot, "SysWOW64"),

            // Additional sensitive locations
            path.join(systemDrive, "ProgramData"),
            path.join(systemDrive, "Recovery"),
            path.join(systemDrive, "Boot"),
        ];
    } else if (platform === "darwin") {
        // macOS - using path.sep for consistency
        denyList = [
            `${path.sep}System`,
            `${path.sep}Library`,
            `${path.sep}bin`,
            `${path.sep}sbin`,
            `${path.sep}usr`,
            `${path.sep}private`,
            `${path.sep}etc`,
            `${path.sep}var`,
            `${path.sep}Applications`,
            `${path.sep}Users${path.sep}Shared`,
            `${path.sep}Network`,
            `${path.sep}Volumes`,
            `${path.sep}cores`,
        ];
        // Explicitly deny root directory
        denyList.push(path.sep);
        // Only deny other users' home directories, not the current user's
        const userHome = app.getPath("home");
        denyList.push(path.join(path.sep, "Users")); // For subfolders
        denyList = denyList.filter((p) => p !== path.join(path.sep, "Users")); // Remove blanket /Users
        // Deny all /Users/* except current user
        const usersDir = path.join(path.sep, "Users");
        try {
            const entries = fs.readdirSync(usersDir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const userDir = path.join(usersDir, entry.name);
                    if (userDir !== userHome) {
                        denyList.push(userDir);
                    }
                }
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.warn("Error getting users directory:", errorMsg);
            applog.error("Error getting users directory:", errorMsg);
        }
    } else {
        // Linux and other Unix-like - using path.sep for consistency
        // We'll manually mark virtual filesystem paths that shouldn't be resolved
        const virtualPaths = [`${path.sep}proc`, `${path.sep}sys`, `${path.sep}dev`];

        const standardPaths = [
            `${path.sep}bin`,
            `${path.sep}boot`,
            `${path.sep}etc`,
            `${path.sep}home`,
            `${path.sep}lib`,
            `${path.sep}lib64`,
            `${path.sep}media`,
            `${path.sep}mnt`,
            `${path.sep}opt`,
            `${path.sep}root`,
            `${path.sep}run`,
            `${path.sep}sbin`,
            `${path.sep}srv`,
            `${path.sep}tmp`,
            `${path.sep}usr`,
            `${path.sep}var`,
        ];

        denyList = [...virtualPaths, ...standardPaths];
        // Explicitly deny root directory
        denyList.push(path.sep);
        // Only deny other users' home directories, not the current user's
        const userHome = app.getPath("home");
        denyList.push(path.join(path.sep, "home")); // For subfolders
        denyList = denyList.filter((p) => p !== path.join(path.sep, "home")); // Remove blanket /home
        // Deny all /home/* except current user
        const homeDir = path.join(path.sep, "home");
        try {
            const entries = fs.readdirSync(homeDir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const userDir = path.join(homeDir, entry.name);
                    if (userDir !== userHome) {
                        denyList.push(userDir);
                    }
                }
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.warn("Error getting home directory:", errorMsg);
            applog.error("Error getting home directory:", errorMsg);
        }
    }

    // Add app-specific directories for all platforms
    try {
        const appPaths = [
            app.getPath("userData"),
            app.getPath("exe"),
            app.getPath("appData"),
            app.getPath("temp"),
            app.getPath("logs"),
            app.getPath("crashDumps"),
        ];
        denyList = [...denyList, ...appPaths];
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.warn("Error getting app paths:", errorMsg);
        applog.error("Error getting app paths:", errorMsg);
    }

    // De-duplicate and filter out any undefined or empty values
    denyList = [...new Set(denyList)].filter(Boolean);

    console.log("Raw deny list:", denyList);
    applog.info("Raw deny list:", denyList);

    // Format all deny paths consistently for comparison
    const formattedDenyList = denyList.map((p) => {
        // Either use the path as-is (for virtual paths) or resolve it
        let formatted;
        try {
            formatted = fs.realpathSync.native(path.resolve(p));
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.warn("Error formatting path:", errorMsg);
            applog.error("Error formatting path:", errorMsg);
            formatted = path.resolve(p);
        }
        if (!isCaseSensitive) formatted = formatted.toLowerCase();
        if (!formatted.endsWith(path.sep) && formatted !== path.sep) {
            formatted += path.sep;
        }
        return formatted;
    });

    console.log("Formatted deny list:", formattedDenyList);
    applog.info("Formatted deny list:", formattedDenyList);

    if (!isCaseSensitive) absoluteInput = absoluteInput.toLowerCase();

    // Always allow the current user's home directory (with or without trailing slash)
    const userHome = app.getPath("home");
    let userHomeFormatted = userHome;
    if (!userHomeFormatted.endsWith(path.sep) && userHomeFormatted !== path.sep) {
        userHomeFormatted += path.sep;
    }
    let absoluteInputWithSep = absoluteInput;
    if (!absoluteInputWithSep.endsWith(path.sep) && absoluteInputWithSep !== path.sep) {
        absoluteInputWithSep += path.sep;
    }
    if (absoluteInput === userHome || absoluteInputWithSep === userHomeFormatted) {
        return false;
    }

    // Check if the path is a protected system folder or a subfolder of one
    return formattedDenyList.some((protectedPath) => {
        // Special case: only block root if it's exactly root
        if (protectedPath === path.sep) {
            return absoluteInput === protectedPath;
        }
        const isMatch = absoluteInput === protectedPath || absoluteInput.startsWith(protectedPath);
        if (isMatch) {
            console.log(`Match found: ${absoluteInput} matches ${protectedPath}`);
            applog.info(`Match found: ${absoluteInput} matches ${protectedPath}`);
        }
        return isMatch;
    });
};

export default isDeniedSystemFolder;
