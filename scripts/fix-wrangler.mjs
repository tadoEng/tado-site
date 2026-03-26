// scripts/fix-wrangler.mjs
import { readFileSync, writeFileSync, copyFileSync } from "node:fs";

const path = "./dist/server/wrangler.json";
const config = JSON.parse(readFileSync(path, "utf-8"));

// Build a clean minimal Pages-compatible config
const clean = {
  name: "tado-site",
  compatibility_date: config.compatibility_date,
  compatibility_flags: config.compatibility_flags,
  main: "./entry.mjs",
  triggers: { crons: [] },
  observability: { enabled: true },
};

writeFileSync(path, JSON.stringify(clean, null, 2));
console.log("✓ Patched dist/server/wrangler.json for Cloudflare Pages compatibility");

// Copy worker entry to dist/client/_worker.js for Cloudflare Pages advanced mode
copyFileSync("./dist/server/entry.mjs", "./dist/client/_worker.js");
console.log("✓ Copied entry.mjs → dist/client/_worker.js for Pages advanced mode");