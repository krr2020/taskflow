import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

// Helper to read resource files
export function getResource(filename: string): string {
    // In ESM, __dirname is not available, need to construct it or use path relative to cwd if we know where we run.
    // However, since we compile to CJS or ESM, let's stick to a robust method.
    // If using 'type': 'module' in package.json (which we are), __dirname is not defined.

    // We can use process.cwd() if we assume we run from project root, but for resources inside the package, 
    // it is better to resolve relative to this file.

    // safe dirname for ESM
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const resourcePath = path.join(__dirname, "..", "..", "resources", filename);

    if (fs.existsSync(resourcePath)) {
        return fs.readFileSync(resourcePath, "utf-8");
    }

    // Fallback/Check
    const altPath = path.join(__dirname, "..", "resources", filename);
    if (fs.existsSync(altPath)) {
        return fs.readFileSync(altPath, "utf-8");
    }

    throw new Error(`Resource file not found at ${resourcePath} or ${altPath}`);
}
