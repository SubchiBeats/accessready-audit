import { spawn } from "node:child_process";
import path from "node:path";

const port = process.env.PORT || "3000";
const executable = path.join(process.cwd(), "node_modules", ".bin", process.platform === "win32" ? "next.cmd" : "next");
const child = spawn(executable, ["start", "-p", port], {
  stdio: "inherit",
  env: process.env
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
