// Runs the built Nuxt examples the way a site runs them: the key only in the
// environment, as NUXT_PUBLIC_GOYA24_KEY, and the page rendered on the server
// first. Building an example proves it compiles; only running it proves a
// customer following the README gets a page and a key. Both failed while CI
// only built them (2026-09-27): the variable never reached the page, and
// every page that called useGoya24() was a 500 from the server.
//
//   pnpm examples:build && pnpm examples:smoke
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const KEY = "d24_pk_smoke_from_env";
const EXAMPLES = ["examples/nuxt-app", "examples/own-launcher"];

async function fetchWhenUp(url, server) {
  const deadline = Date.now() + 30_000;
  for (;;) {
    if (server.exitCode !== null) throw new Error(`the server exited (${server.exitCode})`);
    try {
      return await fetch(url, { headers: { accept: "text/html" } });
    } catch {
      if (Date.now() > deadline) throw new Error(`nothing answered on ${url} for 30s`);
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
}

let failed = false;
for (const [index, example] of EXAMPLES.entries()) {
  const port = 3300 + index;
  const server = spawn(process.execPath, [".output/server/index.mjs"], {
    cwd: join(root, example),
    env: { ...process.env, PORT: String(port), NUXT_PUBLIC_GOYA24_KEY: KEY },
    stdio: ["ignore", "ignore", "pipe"],
  });
  let errors = "";
  server.stderr.on("data", (chunk) => (errors += chunk));
  try {
    const response = await fetchWhenUp(`http://127.0.0.1:${port}/`, server);
    const page = await response.text();
    const problems = [];
    if (response.status !== 200) problems.push(`the page answered ${response.status}, not 200`);
    if (!page.includes(KEY)) {
      problems.push("the key from NUXT_PUBLIC_GOYA24_KEY is not in the page's runtime config");
    }
    if (problems.length) {
      failed = true;
      console.error(`✗ ${example}: ${problems.join("; ")}`);
      if (errors.trim()) console.error(errors.trim().split("\n").slice(0, 5).join("\n"));
    } else {
      console.log(`✓ ${example}: 200, and the key from the environment reached the page`);
    }
  } catch (error) {
    failed = true;
    console.error(`✗ ${example}: ${error.message}`);
  } finally {
    server.kill();
  }
}

process.exit(failed ? 1 : 0);
