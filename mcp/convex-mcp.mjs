#!/usr/bin/env node
// Starts the Convex MCP server by running `convex mcp start` from the
// project's own node_modules/.bin, with stdin/stdout passed straight through
// so Claude Code talks to it over stdio. .mcp.json used to run
// `npx -y convex@1.46.0 mcp start`, but the plugin directory refuses package
// launchers, so the server now needs the convex package installed in the
// project (every Convex app has it). Claude Code starts MCP servers in the
// user's project, so the relative node_modules path resolves there.

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const convexBin = resolve("node_modules", ".bin", "convex");

if (!existsSync(convexBin)) {
  process.stderr.write(
    "Convex MCP: no node_modules/.bin/convex in this folder. Install the convex package in the project, then restart Claude Code.\n",
  );
  process.exit(1);
}

const child = spawn(convexBin, ["mcp", "start", ...process.argv.slice(2)], {
  stdio: "inherit",
});
child.on("error", (err) => {
  process.stderr.write(`Convex MCP: ${err.message}\n`);
  process.exit(1);
});
child.on("exit", (code) => process.exit(code ?? 0));
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => child.kill(sig));
