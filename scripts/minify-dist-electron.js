import * as fsPromise from "node:fs/promises";
import path from "node:path";
import { minify } from "terser";

const dir = "./dist-electron/electron-main";

const getAllJsFiles = async (dirPath, files = []) => {
    const entries = await fsPromise.readdir(dirPath, { withFileTypes: true });

    for (let entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            await getAllJsFiles(fullPath, files);
        } else if (entry.isFile() && fullPath.endsWith(".js") && !fullPath.endsWith(".min.js")) {
            files.push(fullPath);
        }
    }
    return files;
};

(async () => {
    const jsFiles = await getAllJsFiles(dir);

    for (const filePath of jsFiles) {
        try {
            const code = await fsPromise.readFile(filePath, "utf8");
            const result = await minify(code);

            if (result.code) {
                const minPath = filePath.replace(/\.js$/, ".min.js");
                await fsPromise.writeFile(minPath, result.code);
                await fsPromise.unlink(filePath);
                await fsPromise.rename(minPath, filePath);
                console.log(`Minified: ${filePath}`);
            } else {
                console.error(`Failed to minify: ${filePath}`);
            }
        } catch (err) {
            console.error(`Error processing ${filePath}:`, err);
        }
    }
})();
