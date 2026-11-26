#!/usr/bin/env node
// Monitor: every 10 minutes runs `node_modules/.bin/convex insights` in the
// project in the current directory and prints only insight lines (OCC
// conflicts, read limits) that weren't in the previous run, so each
// notification is something new. Replaces the old inline `sh -c` loop in
// monitors.json, which the plugin directory refuses.
//
// The first successful run is kept as a baseline without printing, so old
// insights from the last 72 hours don't fire on startup. It skips the run
// when .env.local has no CONVEX_DEPLOYMENT, when the deployment is anonymous
// (`convex insights` needs a cloud deployment with user auth), when the
// project has no convex binary, or when the command fails. The previous
// run's lines are kept in memory, so nothing is written to disk.

import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const POLL_MS = 10 * 60 * 1000;
const INSIGHT_RE = /occ|conflict|bytes read|documents read|limit|threshold/i;

const convexBin = resolve("node_modules", ".bin", "convex");
let previous = null; // Set of lines from the last successful run

function deploymentLine() {
  try {
    return readFileSync(".env.local", "utf8").match(/^CONVEX_DEPLOYMENT=(.*)$/m)?.[1];
  } catch {
    return undefined;
  }
}

function poll() {
  const deployment = deploymentLine();
  if (!deployment || deployment.startsWith("anonymous") || !existsSync(convexBin)) {
    return;
  }
  execFile(convexBin, ["insights"], { timeout: 120_000 }, (err, stdout) => {
    if (err || !stdout.trim()) return;
    const lines = new Set(stdout.split("\n").filter((l) => INSIGHT_RE.test(l)));
    if (previous) {
      for (const line of lines) {
        if (!previous.has(line)) process.stdout.write(line + "\n");
      }
    }
    previous = lines;
  });
}

poll();
setInterval(poll, POLL_MS);
