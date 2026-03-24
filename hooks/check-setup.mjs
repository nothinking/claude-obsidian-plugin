#!/usr/bin/env node

import { readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const configPath = join(homedir(), ".claude", "plugins", "config", "obsidian.json");

try {
  const config = JSON.parse(readFileSync(configPath, "utf-8"));
  if (config.setupComplete) {
    // Setup done — silent
    process.exit(0);
  }
} catch {
  // Config missing or invalid
}

// Print notice to stderr so it appears as hook context
console.error(
  "Obsidian plugin is installed but not configured yet. Run /obsidian:setup to get started."
);
