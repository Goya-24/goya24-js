// The public API of every package, written down where a review can see it.
//
// Each package's built type declarations are copied to `api/<name>.d.ts`.
// CI runs this with `--check` and fails when the copy no longer matches the
// build — so any change to what a package exports, or to the shape of a
// type a user might have written against, shows up as a diff in the pull
// request rather than as a surprise in somebody's upgrade. A change that is
// meant needs `pnpm api` to refresh the report, and a changeset that says
// whether it is a patch, a minor or a major.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");

const PACKAGES = [
  ["messenger", "packages/messenger/dist/index.d.ts"],
  ["react", "packages/react/dist/index.d.ts"],
  ["vue", "packages/vue/dist/index.d.ts"],
  ["nuxt", "packages/nuxt/dist/module.d.ts"],
];

let failed = false;
for (const [name, built] of PACKAGES) {
  const source = join(root, built);
  if (!existsSync(source)) {
    console.error(`api-report: ${built} is missing — run \`pnpm build\` first.`);
    process.exit(2);
  }
  // Line endings and trailing whitespace are not API.
  const current = readFileSync(source, "utf8").replace(/\r\n/g, "\n").trimEnd() + "\n";
  const report = join(root, "api", `${name}.d.ts`);
  const previous = existsSync(report) ? readFileSync(report, "utf8").replace(/\r\n/g, "\n") : null;

  if (check) {
    if (previous === current) {
      console.log(`api-report: @goya24/${name} unchanged`);
      continue;
    }
    failed = true;
    console.error(
      `api-report: the public API of @goya24/${name} changed.\n` +
        `  If this is intended, run \`pnpm api\`, commit api/${name}.d.ts, and add a changeset\n` +
        `  that names the bump (a removed or narrowed export is a major).\n`,
    );
    printDiff(previous ?? "", current);
  } else {
    mkdirSync(dirname(report), { recursive: true });
    writeFileSync(report, current);
    console.log(`api-report: wrote api/${name}.d.ts`);
  }
}

if (failed) process.exit(1);

/** A plain line diff, enough to read in a CI log. */
function printDiff(before, after) {
  const a = before.split("\n");
  const b = after.split("\n");
  const seen = new Set(a);
  const gone = a.filter((line) => !b.includes(line));
  const added = b.filter((line) => !seen.has(line));
  for (const line of gone) if (line.trim()) console.error(`  - ${line}`);
  for (const line of added) if (line.trim()) console.error(`  + ${line}`);
}
