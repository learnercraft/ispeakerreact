import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const minifyJsonFiles = (dir) => {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            minifyJsonFiles(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".json")) {
            const content = fs.readFileSync(fullPath, "utf8");
            try {
                const minified = JSON.stringify(JSON.parse(content));
                fs.writeFileSync(fullPath, minified, "utf8");
                console.log(`Minified: ${fullPath}`);
            } catch (e) {
                console.error(`Failed to minify: ${fullPath}`, e);
            }
        }
    });
};

// Minify dist/json
minifyJsonFiles(path.join(__dirname, "../dist/json"));
// Minify dist/locales
minifyJsonFiles(path.join(__dirname, "../dist/locales"));
// Minify data/
//minifyJsonFiles(path.join(__dirname, "../data"));
