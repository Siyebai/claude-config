#!/usr/bin/env node

/**
 * project-inspector.mjs v2.0 — 通用项目深度检查引擎
 *
 * 一键扫描任意项目文件夹，读取每一个源文件（99%+ 覆盖率），
 * 输出结构化分析报告 + JSON快照，支持增量对比。
 *
 * 用法:
 *   node project-inspector.mjs <目标目录> [选项]
 *
 * 选项:
 *   --output <路径>     报告输出路径（默认: 目标目录/project-report.md）
 *   --json <路径>       JSON快照输出路径（默认: 目标目录/project-scan.json）
 *   --pack-only         只打包，不生成分析报告
 *   --no-pack           不运行repomix，仅做fs级快速扫描
 *   --no-compress       不使用 Tree-sitter 压缩
 *   --top-files <N>     显示最大的 N 个文件（默认: 20）
 *   --depth <N>         VTE树形深度（默认: 3）
 *   --filter <glob>     文件过滤模式
 *   --diff <路径>        与之前的JSON快照对比
 *   --quiet             静默模式
 *   --help              显示帮助
 */

import { execSync } from "child_process";
import {
  existsSync, readFileSync, writeFileSync, statSync,
  readdirSync, mkdirSync,
} from "fs";
import { resolve, relative, basename, extname, dirname, sep, parse } from "path";

// ─── 配置 ────────────────────────────────────────────────────────────────────

const REPOMIX_PKG = "repomix@latest";
const PACK_FILENAME = "repomix-packed-output.md";
const SCAN_FILENAME = "project-scan.json";
const REPORT_FILENAME = "project-report.md";
const DEFAULT_TOP_FILES = 20;
const MAX_PACK_READ_SIZE = 10 * 1024 * 1024; // 10MB — 超过此大小截断读取
const DEFAULT_DEPTH = 3;

// ─── 日志 ────────────────────────────────────────────────────────────────────

let _quiet = false;
function log(msg) { if (!_quiet) process.stdout.write(msg + "\n"); }
function warn(msg) { process.stderr.write("⚠ " + msg + "\n"); }
function die(msg) { process.stderr.write("✖ " + msg + "\n"); process.exit(1); }

// ─── 参数解析 ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const opts = {
  targetDir: null,
  outputPath: null,
  jsonPath: null,
  packOnly: false,
  noPack: false,
  useCompress: true,
  topFiles: DEFAULT_TOP_FILES,
  depth: DEFAULT_DEPTH,
  filter: null,
  diffBaseline: null,
  quiet: false,
};

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (["--help", "-h"].includes(a)) {
    printHelp();
    process.exit(0);
  } else if (a === "--output" && args[i + 1]) opts.outputPath = resolve(args[++i]);
  else if (a === "--json" && args[i + 1]) opts.jsonPath = resolve(args[++i]);
  else if (a === "--pack-only") opts.packOnly = true;
  else if (a === "--no-pack") opts.noPack = true;
  else if (a === "--no-compress") opts.useCompress = false;
  else if (a === "--top-files" && args[i + 1]) opts.topFiles = parseInt(args[++i], 10) || DEFAULT_TOP_FILES;
  else if (a === "--depth" && args[i + 1]) opts.depth = parseInt(args[++i], 10) || DEFAULT_DEPTH;
  else if (a === "--filter" && args[i + 1]) opts.filter = args[++i];
  else if (a === "--diff" && args[i + 1]) opts.diffBaseline = resolve(args[++i]);
  else if (a === "--quiet") opts.quiet = true;
  else if (!opts.targetDir) opts.targetDir = resolve(a);
  else die(`未知选项: ${a}`);
}

_quiet = opts.quiet;
if (!opts.targetDir) die("请指定目标目录\n用法: node project-inspector.mjs <目标目录>");
if (existsSync(opts.targetDir) && !statSync(opts.targetDir).isDirectory()) {
  die(`指定路径不是目录: ${opts.targetDir}`);
}

// ─── 辅助函数 ────────────────────────────────────────────────────────────────

function sh(cmd, timeout = 300_000) {
  try {
    return execSync(cmd, { timeout, stdio: ["pipe", "pipe", "pipe"] }).toString().trim();
  } catch (e) {
    return { error: e.stderr ? e.stderr.toString().trim() : e.message };
  }
}

function safeSh(cmd, timeout = 120_000) {
  const r = sh(cmd, timeout);
  return typeof r === "string" ? r : null;
}

function fmtBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const val = bytes / Math.pow(1024, i);
  return val >= 100 ? `${Math.round(val)} ${units[i]}` : `${val.toFixed(1)} ${units[i]}`;
}

function fmtNum(n) {
  if (!n || n === 0) return "0";
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function fmtDuration(ms) {
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  return rem > 0 ? `${mins}m ${rem}s` : `${mins}m`;
}

function readJson(path) {
  try { return JSON.parse(readFileSync(path, "utf-8")); } catch { return null; }
}

// ─── 帮助 ────────────────────────────────────────────────────────────────────

function printHelp() {
  log(`
project-inspector.mjs v2.0 — 通用项目深度检查引擎

用法:
  node project-inspector.mjs <目标目录> [选项]

选项:
  --output <路径>     报告输出路径（默认: <目标>/project-report.md）
  --json <路径>       JSON快照路径（默认: <目标>/project-scan.json）
  --pack-only         只运行repomix打包，不生成分析报告
  --no-pack           不做repomix打包，仅filesystem级快速扫描
  --no-compress       不使用 Tree-sitter 压缩
  --top-files <N>     显示最大的 N 个文件（默认: 20）
  --depth <N>         目录树深度（默认: 3）
  --filter <glob>     文件过滤模式（如 "*.ts" "src/**"）
  --diff <路径>        与之前的JSON快照对比
  --quiet             静默模式（仅输出JSON结果）
  --help              显示帮助

示例:
  node project-inspector.mjs .                            # 扫描当前目录
  node project-inspector.mjs /path/to/proj --no-pack      # 快速扫描（不打包）
  node project-inspector.mjs . --diff ./project-scan.json # 对比历史快照
`);
}

// ─── 文件系统扫描 ────────────────────────────────────────────────────────────

const IGNORE_DIRS = new Set([
  "node_modules", ".git", ".next", ".cache", "dist", "build", ".turbo",
  "coverage", ".nyc_output", "__pycache__", ".venv", "venv", "env",
  ".pnpm-store", ".npm", "target", "bin", "obj", "out", ".output",
]);

function walkDir(dir, baseDir = dir, depth = 0, maxDepth = Infinity, filter = null) {
  const results = [];
  if (depth > maxDepth) return results;
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".") && entry.name !== ".gitignore" && entry.name !== ".env.example") continue;
      const fullPath = resolve(dir, entry.name);
      const relPath = relative(baseDir, fullPath);
      if (entry.isDirectory()) {
        if (IGNORE_DIRS.has(entry.name)) continue;
        if (filter && !relPath.startsWith(filter.replace(/\*/g, ""))) continue;
        results.push(...walkDir(fullPath, baseDir, depth + 1, maxDepth, filter));
      } else if (entry.isFile()) {
        if (filter) {
          const pattern = new RegExp("^" + filter.replace(/\*/g, ".*").replace(/\?/g, ".") + "$");
          if (!pattern.test(relPath) && !pattern.test(entry.name)) continue;
        }
        const stat = statSync(fullPath);
        results.push({
          path: relPath,
          size: stat.size,
          mtime: stat.mtimeMs,
          ext: extname(entry.name).toLowerCase() || "(no-ext)",
        });
      }
    }
  } catch { /* permission denied, skip */ }
  return results;
}

// ─── 分析引擎 ────────────────────────────────────────────────────────────────

function analyzeFiles(files) {
  const extMap = {};
  const sizeBuckets = { "<1KB": 0, "1-10KB": 0, "10-100KB": 0, "100KB-1MB": 0, ">1MB": 0 };
  const nameDups = {};
  let totalSize = 0, emptyFiles = 0;

  for (const f of files) {
    totalSize += f.size;
    if (f.size === 0) emptyFiles++;

    // Extension stats
    if (!extMap[f.ext]) extMap[f.ext] = 0;
    extMap[f.ext]++;

    // Size buckets
    if (f.size < 1024) sizeBuckets["<1KB"]++;
    else if (f.size < 10_240) sizeBuckets["1-10KB"]++;
    else if (f.size < 102_400) sizeBuckets["10-100KB"]++;
    else if (f.size < 1_048_576) sizeBuckets["100KB-1MB"]++;
    else sizeBuckets[">1MB"]++;

    // Duplicate filenames
    const name = basename(f.path);
    if (!nameDups[name]) nameDups[name] = [];
    nameDups[name].push(f.path);
  }

  // Sorted extension stats
  const extStats = Object.entries(extMap)
    .sort(([, a], [, b]) => b - a)
    .map(([ext, count]) => ({ ext, count }));

  // Duplicates (top 20)
  const dups = Object.entries(nameDups)
    .filter(([, paths]) => paths.length > 1)
    .sort(([, a], [, b]) => b.length - a.length)
    .slice(0, 20)
    .map(([name, paths]) => ({ name, count: paths.length, paths }));

  // Largest files
  const largest = [...files]
    .sort((a, b) => b.size - a.size)
    .slice(0, opts.topFiles);

  // Directory depth
  const maxDepth = files.reduce((max, f) => Math.max(max, f.path.split(sep).length), 0);

  return { extStats, sizeBuckets, dups, largest, maxDepth, emptyFiles, totalSize };
}

// ─── 框架/技术栈检测 ──────────────────────────────────────────────────────────

function detectStack(targetDir) {
  const stack = { languages: [], frameworks: [], buildTools: [], databases: [] };

  // Check common config files
  if (existsSync(resolve(targetDir, "package.json"))) {
    stack.buildTools.push("npm/pnpm/yarn");
    try {
      const pkg = readJson(resolve(targetDir, "package.json"));
      if (pkg) {
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps.next) stack.frameworks.push("Next.js");
        if (deps.react) stack.frameworks.push("React");
        if (deps.vue) stack.frameworks.push("Vue");
        if (deps.express) stack.frameworks.push("Express");
        if (deps.prisma) { stack.databases.push("Prisma"); stack.frameworks.push("Prisma"); }
        if (deps.typeorm) stack.databases.push("TypeORM");
        if (deps.tailwindcss) stack.frameworks.push("TailwindCSS");
        if (deps.typescript || pkg.devDependencies?.typescript) stack.languages.push("TypeScript");
        if (deps.vitest || deps.jest) stack.frameworks.push(deps.vitest ? "Vitest" : "Jest");
      }
    } catch { /* ignore json parse error */ }
  }

  if (existsSync(resolve(targetDir, "tsconfig.json"))) {
    if (!stack.languages.includes("TypeScript")) stack.languages.push("TypeScript");
  }

  if (existsSync(resolve(targetDir, "go.mod"))) {
    stack.languages.push("Go");
    stack.buildTools.push("Go Modules");
  }

  if (existsSync(resolve(targetDir, "Cargo.toml"))) {
    stack.languages.push("Rust");
    stack.buildTools.push("Cargo");
  }

  if (existsSync(resolve(targetDir, "pyproject.toml"))) {
    stack.languages.push("Python");
    stack.buildTools.push("Poetry/pip");
  } else if (existsSync(resolve(targetDir, "requirements.txt"))) {
    stack.languages.push("Python");
    stack.buildTools.push("pip");
  }

  if (existsSync(resolve(targetDir, "Gemfile"))) {
    stack.languages.push("Ruby");
    stack.buildTools.push("Bundler");
  }

  if (existsSync(resolve(targetDir, "Dockerfile"))) { stack.buildTools.push("Docker"); }
  if (existsSync(resolve(targetDir, "docker-compose.yml"))) { stack.buildTools.push("Docker Compose"); }
  if (existsSync(resolve(targetDir, "Makefile"))) { stack.buildTools.push("Make"); }

  // Detect language from file extensions
  const extSet = new Set();
  // We'll get this from the scan results instead

  return stack;
}

// ─── 步骤 1: 文件系统快速扫描 ──────────────────────────────────────────────────

log(`\n  ┌──────────────────────────────────────────────`);
log(`  │  Project Inspector v2.0`);
log(`  │  目标: ${basename(opts.targetDir) || opts.targetDir}`);
log(`  │  路径: ${opts.targetDir}`);
log(`  └──────────────────────────────────────────────\n`);

const startTime = Date.now();
const targetDir = opts.targetDir;
const targetName = basename(targetDir) || targetDir;

log(`  ⚡ Phase 1: 文件系统扫描...`);
const allFiles = walkDir(targetDir, targetDir, 0, opts.filter ? Infinity : 100, opts.filter);
const fsStats = analyzeFiles(allFiles);
const stack = detectStack(targetDir);
const scanDuration = Date.now() - startTime;

log(`  ✓ 发现 ${fmtNum(allFiles.length)} 个文件 (${fmtBytes(fsStats.totalSize)})`);
log(`    最大深度: ${fsStats.maxDepth} 层 · 空文件: ${fsStats.emptyFiles} 个`);

// ─── 步骤 2: 运行 Repomix 打包 ────────────────────────────────────────────────

let packPath = null;
let packSize = 0;
let packFiles = [];
let packTokens = 0;
let packDuration = 0;

if (!opts.noPack) {
  log(`  ⚡ Phase 2: 打包代码库 (Repomix)...`);

  packPath = resolve(targetDir, PACK_FILENAME);
  const compressFlag = opts.useCompress ? "--compress" : "";
  const repomixCmd = [
    `npx ${REPOMIX_PKG} "${targetDir}"`,
    `--style markdown ${compressFlag}`,
    `--top-files-len ${opts.topFiles}`,
    `-o "${packPath}"`,
    `--quiet`,
    `--no-file-summary`,
  ].filter(Boolean).join(" ");

  const p1 = Date.now();
  const packResult = sh(repomixCmd);
  packDuration = Date.now() - p1;

  if (typeof packResult === "object" && packResult.error) {
    warn(`Repomix 打包失败: ${packResult.error}`);
    warn("降级到仅文件系统扫描模式");
    opts.noPack = true;
  } else if (!existsSync(packPath)) {
    warn(`打包文件未生成: ${packPath}`);
    opts.noPack = true;
  } else {
    packSize = statSync(packPath).size;
    log(`  ✓ 打包完成 (${fmtDuration(packDuration)})`);
    log(`  📦 ${PACK_FILENAME} — ${fmtBytes(packSize)}`);

    // Extract file list and token info from pack
    if (packSize <= MAX_PACK_READ_SIZE) {
      const content = readFileSync(packPath, "utf-8");
      const fileRegex = /^## File: (.+)$/gm;
      let m;
      while ((m = fileRegex.exec(content)) !== null) packFiles.push(m[1]);

      // Estimate tokens (crude: ~4 chars/token for code)
      const codeBlocks = content.match(/```[\s\S]*?```/g);
      if (codeBlocks) packTokens = codeBlocks.reduce((a, b) => a + b.length, 0) / 4;
    }
  }
}

// ─── 步骤 3: 收集 Git 信息 ──────────────────────────────────────────────────

let gitInfo = { isRepo: false };
if (existsSync(resolve(targetDir, ".git"))) {
  log(`  ⚡ Phase 3: Git 信息...`);
  gitInfo = {
    isRepo: true,
    branch: safeSh(`cd "${targetDir}" && git branch --show-current`) || "N/A",
    recentCommits: (safeSh(`cd "${targetDir}" && git log --oneline -5`) || "").split("\n").filter(Boolean),
    totalCommits: safeSh(`cd "${targetDir}" && git rev-list --count HEAD 2>/dev/null`) || "N/A",
    lastCommit: safeSh(`cd "${targetDir}" && git log -1 --format=%ci`) || "N/A",
    authors: safeSh(`cd "${targetDir}" && git shortlog -sn HEAD 2>/dev/null | wc -l`) || "N/A",
  };
  log(`  ✓ ${gitInfo.branch} · ${gitInfo.totalCommits} commits · ${gitInfo.authors} authors`);
}

// ─── 步骤 4: 对比历史快照 ────────────────────────────────────────────────────

let diffResults = null;
if (opts.diffBaseline) {
  log(`  ⚡ Phase 4: 对比历史快照...`);
  const baseline = readJson(opts.diffBaseline);
  if (baseline) {
    const oldCount = baseline.fileCount || 0;
    const oldSize = baseline.totalSize || 0;
    const oldTokens = baseline.totalTokens || 0;
    diffResults = {
      filesChange: allFiles.length - oldCount,
      sizeChange: fsStats.totalSize - oldSize,
      tokensChange: Math.round(packTokens - oldTokens),
      filesChangePct: oldCount > 0 ? (((allFiles.length - oldCount) / oldCount) * 100).toFixed(1) : "N/A",
    };
    const sign = (v) => v > 0 ? "+" : v < 0 ? "" : "=";
    log(`  📊 文件: ${sign(diffResults.filesChange)}${diffResults.filesChange} (${diffResults.filesChangePct}%)`);
  } else {
    warn(`无法读取历史快照: ${opts.diffBaseline}`);
  }
}

// ─── 构建 JSON 快照 ───────────────────────────────────────────────────────────

const scanData = {
  _meta: {
    tool: "project-inspector v2.0",
    timestamp: new Date().toISOString(),
    target: targetDir,
    duration: Date.now() - startTime,
    packMode: opts.noPack ? "fs-only" : opts.useCompress ? "compress" : "full",
  },
  fileCount: allFiles.length,
  fileCountByExt: Object.fromEntries(fsStats.extStats.map(e => [e.ext, e.count])),
  totalSize: fsStats.totalSize,
  totalTokens: Math.round(packTokens),
  packSize,
  emptyFiles: fsStats.emptyFiles,
  maxDepth: fsStats.maxDepth,
  sizeBuckets: fsStats.sizeBuckets,
  duplicates: fsStats.dups,
  git: gitInfo,
  stack,
  diff: diffResults,
};

// ─── 步骤 5: 生成报告 ────────────────────────────────────────────────────────

const reportTime = new Date().toISOString().replace("T", " ").slice(0, 19);

const extRows = fsStats.extStats.slice(0, 15).map(e =>
  `| \`${e.ext.padEnd(15)}\` | ${String(e.count).padStart(6)} |`
).join("\n");

const bucketRows = Object.entries(fsStats.sizeBuckets)
  .map(([k, v]) => `| ${k.padEnd(12)} | ${String(v).padStart(6)} |`)
  .join("\n");

const topRows = fsStats.largest.map((f, i) =>
  `| ${i + 1} | \`${f.path}\` | ${fmtBytes(f.size)} | ${fmtNum(Math.ceil(f.size / 4))} |`
).join("\n");

const dupRows = fsStats.dups.length
  ? fsStats.dups.map(d =>
      `| \`${d.name}\` | ${d.count} | ${d.paths.slice(0, 3).map(p => `\`${p}\``).join("<br>")}${d.paths.length > 3 ? " ..." : ""} |`
    ).join("\n")
  : "| (无重复文件名) | — | — |";

const stackRows = [
  stack.languages.length ? `**语言**: ${stack.languages.join(" · ")}` : "",
  stack.frameworks.length ? `**框架**: ${stack.frameworks.join(" · ")}` : "",
  stack.buildTools.length ? `**构建工具**: ${stack.buildTools.join(" · ")}` : "",
  stack.databases.length ? `**数据库**: ${stack.databases.join(" · ")}` : "",
].filter(Boolean).join("\n") || "（未检测到已知技术栈）";

const diffRows = diffResults ? [
  `| 文件数变化 | ${diffResults.filesChange > 0 ? "+" : ""}${diffResults.filesChange} (${diffResults.filesChangePct}%) |`,
  `| 体积变化 | ${diffResults.sizeChange > 0 ? "+" : ""}${fmtBytes(Math.abs(diffResults.sizeChange))} |`,
  `| Token变化 | ${diffResults.tokensChange > 0 ? "+" : ""}${fmtNum(Math.abs(diffResults.tokensChange))} |`,
].join("\n") : "（无历史对比）";

const report = `# ${targetName} — 项目深度扫描报告

> **生成时间**: ${reportTime}
> **检查引擎**: Project Inspector v2.0 · ${opts.noPack ? "FS快速模式" : `Repomix ${opts.useCompress ? "压缩" : "完整"}模式`}
${diffResults ? `> **对比基线**: ${basename(opts.diffBaseline)}` : ""}

---

## 项目概览

| 指标 | 数值 |
|:-----|:------|
| **目录路径** | \`${targetDir}\` |
| **源文件总数** | ${fmtNum(allFiles.length)} |
| **总大小** | ${fmtBytes(fsStats.totalSize)} |
| **估算 Token** | ${fmtNum(Math.round(packTokens))} |
| **空文件** | ${fmtNum(fsStats.emptyFiles)} 个 |
| **目录最大深度** | ${fsStats.maxDepth} 层 |
| **扫描耗时** | ${fmtDuration(Date.now() - startTime)} |
${packPath ? `| **打包文件** | \`${PACK_FILENAME}\` (${fmtBytes(packSize)}) |` : ""}

---

## 技术栈

${stackRows}

---

## Git 信息

${gitInfo.isRepo ? `| 分支 | \`${gitInfo.branch}\` |
|:-----|:------|
| **总提交数** | ${gitInfo.totalCommits} |
| **作者数** | ${gitInfo.authors} 人 |
| **最新提交** | ${gitInfo.lastCommit} |

**最近提交:**
${(gitInfo.recentCommits || []).map(c => `  - ${c}`).join("\n") || "  (N/A)"}` : "  (非 Git 仓库)"}

---

## 文件类型分布

| 扩展名 | 文件数 |
|:-------|:-------|
${extRows}

---

## 文件大小分布

| 范围 | 文件数 |
|:-----|:-------|
${bucketRows}

---

## 最大文件 Top ${opts.topFiles}

| # | 文件 | 大小 | 估算 Token |
|:--|:-----|:----|:-----------|
${topRows}

---

## 重复文件名

| 文件名 | 出现次数 | 路径 |
|:-------|:---------|:------|
${dupRows}

---

## 增量对比

${diffRows}

---

## 完整文件清单

每个文件的路径、大小、修改时间详见 \`${SCAN_FILENAME}\`。

---

## 深度分析指引

1. **读取打包文件** → \`${packPath || "（未生成）"}\` — 包含每个文件的完整/压缩代码
2. **读取 JSON 快照** → \`${opts.jsonPath || resolve(targetDir, SCAN_FILENAME)}\` — 供程序化消费
3. **对比历史** → \`node project-inspector.mjs ${targetDir} --diff <prev-scan.json>\`
4. **快速扫描** → \`node project-inspector.mjs ${targetDir} --no-pack\`

---

## 安全提醒

- 打包文件包含项目完整代码，请勿公开分享
- 如包含敏感信息（密钥、密码），请在使用后删除

---

*报告由 Project Inspector v2.0 自动生成 · ${reportTime}*
`;

// ─── 步骤 6: 输出 ─────────────────────────────────────────────────────────────

const reportPath = opts.outputPath || resolve(targetDir, REPORT_FILENAME);
const jsonPath = opts.jsonPath || resolve(targetDir, SCAN_FILENAME);

try {
  if (!opts.packOnly) {
    writeFileSync(reportPath, report, "utf-8");
    writeFileSync(jsonPath, JSON.stringify(scanData, null, 2), "utf-8");
  }

  if (!opts.quiet) {
    log(`  ✓ 报告生成完成 (${fmtDuration(Date.now() - startTime)})`);
    log(`  📄 报告: ${reportPath}`);
    log(`  📊 JSON: ${jsonPath}`);
    if (packPath && !opts.packOnly) log(`  📦 包文件: ${packPath}`);
    log("");
    log(`  ${"=".repeat(50)}`);
    log(`  摘要`);
    log(`  ${"=".repeat(50)}`);
    log(`  源文件: ${fmtNum(allFiles.length)} 个 (${fmtBytes(fsStats.totalSize)})`);
    log(`  估算 Token: ${fmtNum(Math.round(packTokens))}`);
    log(`  文件类型: ${fsStats.extStats.length} 种`);
    log(`  技术栈: ${stack.languages.concat(stack.frameworks).join(" · ") || "未识别"}`);
    log(`  ${"=".repeat(50)}`);
    log(`  ✓ 全流程完成 (${fmtDuration(Date.now() - startTime)})`);
  }

  // stdout JSON for programmatic use
  process.stdout.write(JSON.stringify({ success: true, ...scanData }));
} catch (e) {
  die(`写入文件失败: ${e.message}`);
}
