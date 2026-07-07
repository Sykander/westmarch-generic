#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function usage() {
  console.error("Usage: node utils/run-avrae-test-shard.js <test-file> <shard-index> <shard-count>");
  process.exit(2);
}

function isBlank(line) {
  return line.trim() === "";
}

function isSeparator(line) {
  return line.trim() === "---";
}

function parseGvarCases(text) {
  const lines = text.split(/\r?\n/);
  const cases = [];
  let idx = 0;

  while (idx < lines.length) {
    while (idx < lines.length && isBlank(lines[idx])) idx += 1;
    if (idx >= lines.length) break;

    const start = idx;
    while (idx < lines.length && !isSeparator(lines[idx])) idx += 1;
    if (idx >= lines.length) throw new Error("Missing first '---' separator in gvar test case.");
    idx += 1;

    while (idx < lines.length && !isSeparator(lines[idx])) idx += 1;
    if (idx < lines.length && isSeparator(lines[idx])) {
      idx += 1;
      while (idx < lines.length && !isBlank(lines[idx])) idx += 1;
    }

    cases.push(lines.slice(start, idx).join("\n").trimEnd());
  }

  return cases;
}

function parseAliasCases(text) {
  const lines = text.split(/\r?\n/);
  const cases = [];
  let idx = 0;

  while (idx < lines.length) {
    while (idx < lines.length && isBlank(lines[idx])) idx += 1;
    if (idx >= lines.length) break;

    const start = idx;
    while (idx < lines.length && !isSeparator(lines[idx])) idx += 1;
    if (idx >= lines.length) throw new Error("Missing first '---' separator in alias test case.");
    idx += 1;

    while (idx < lines.length && !isSeparator(lines[idx]) && !lines[idx].trimStart().startsWith("!")) idx += 1;
    if (idx < lines.length && isSeparator(lines[idx])) {
      idx += 1;
      while (idx < lines.length && !lines[idx].trimStart().startsWith("!")) idx += 1;
    }

    cases.push(lines.slice(start, idx).join("\n").trimEnd());
  }

  return cases;
}

function sanitizeForPath(value) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "");
}

function gvarStem(filename) {
  for (const suffix of [".gvar-test", ".gvartest"]) {
    if (filename.endsWith(suffix)) return filename.slice(0, -suffix.length);
  }
  return null;
}

function copyAliasSiblings(sourceDir, targetDir) {
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".alias")) {
      fs.copyFileSync(path.join(sourceDir, entry.name), path.join(targetDir, entry.name));
    }
  }
}

function main() {
  const [testFileArg, shardIndexArg, shardCountArg] = process.argv.slice(2);
  if (!testFileArg || !shardIndexArg || !shardCountArg) usage();

  const workspaceRoot = process.cwd();
  const testFile = path.resolve(workspaceRoot, testFileArg);
  const shardIndex = Number(shardIndexArg);
  const shardCount = Number(shardCountArg);

  if (!Number.isInteger(shardIndex) || !Number.isInteger(shardCount) || shardIndex < 1 || shardCount < 1 || shardIndex > shardCount) {
    usage();
  }

  const filename = path.basename(testFile);
  const isGvar = filename.endsWith(".gvar-test") || filename.endsWith(".gvartest");
  const isAlias = filename.endsWith(".alias-test") || filename.endsWith(".aliastest");
  if (!isGvar && !isAlias) {
    throw new Error(`Unsupported Avrae test file: ${testFileArg}`);
  }

  const text = fs.readFileSync(testFile, "utf8");
  const cases = isGvar ? parseGvarCases(text) : parseAliasCases(text);
  const selected = cases.filter((_, index) => index % shardCount === shardIndex - 1);
  if (selected.length === 0) {
    throw new Error(`Shard ${shardIndex}/${shardCount} selected no test cases from ${testFileArg}.`);
  }

  const rel = path.relative(workspaceRoot, testFile);
  const shardDir = path.join(
    workspaceRoot,
    ".cache",
    "avrae-test-shards",
    `${sanitizeForPath(rel)}-${shardIndex}-of-${shardCount}`,
  );
  fs.rmSync(shardDir, { recursive: true, force: true });
  fs.mkdirSync(shardDir, { recursive: true });

  if (isGvar) {
    const stem = gvarStem(filename);
    const gvarFile = path.join(path.dirname(testFile), `${stem}.gvar`);
    fs.copyFileSync(gvarFile, path.join(shardDir, `${stem}.gvar`));
  } else {
    copyAliasSiblings(path.dirname(testFile), shardDir);
  }

  const shardFile = path.join(shardDir, filename);
  fs.writeFileSync(shardFile, `${selected.join("\n\n")}\n`);

  const shardRel = path.relative(workspaceRoot, shardFile);
  console.log(`Running ${rel} shard ${shardIndex}/${shardCount} (${selected.length}/${cases.length} cases)`);
  const result = spawnSync("avrae-ls", ["--log-level", "INFO", "--run-tests", shardRel], {
    cwd: workspaceRoot,
    stdio: "inherit",
  });

  process.exit(result.status === null ? 1 : result.status);
}

main();
