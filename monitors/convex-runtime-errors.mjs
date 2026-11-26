#!/usr/bin/env node
// Monitor: streams `node_modules/.bin/convex logs` from the project in the
// current directory and prints each line that looks like an error, so Claude
// Code turns it into a notification. Replaces the old inline `sh -c` loop in
// monitors.json, which the plugin directory refuses.
//
// It only runs the project's own convex binary (never npx), and only once
// .env.local names a CONVEX_DEPLOYMENT. Until then, and whenever
// `convex logs` exits, it waits 30 seconds and checks again. It prints
// nothing else, so it is safe in a folder that isn't a Convex project.

import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline";

const RETRY_MS = 30_000;
const ERROR_RE =
  /error|exception|⨯|RangeError|TypeError|ReferenceError|Schema validation|ReturnsValidation|ArgumentValidation|Too many reads|Too many writes|SystemTimeoutError|OCC conflict|nonInteractiveError/i;

const convexBin = resolve("node_modules", ".bin", "convex");

function hasDeployment() {
  try {
    return /^CONVEX_DEPLOYMENT=/m.test(readFileSync(".env.local", "utf8"));
  } catch {
    return false;
  }
}

function streamLogs() {
  if (!hasDeployment() || !existsSync(convexBin)) {
    setTimeout(streamLogs, RETRY_MS);
    return;
  }
  const child = spawn(convexBin, ["logs"], { stdio: ["ignore", "pipe", "ignore"] });
  createInterface({ input: child.stdout }).on("line", (line) => {
    if (ERROR_RE.test(line)) process.stdout.write(line + "\n");
  });
  child.on("error", () => {});
  child.on("close", () => setTimeout(streamLogs, RETRY_MS));
}

streamLogs();
