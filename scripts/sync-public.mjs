import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const publicDir = join(root, "public");

mkdirSync(publicDir, { recursive: true });
copyFileSync(join(root, "app.js"), join(publicDir, "app.js"));
