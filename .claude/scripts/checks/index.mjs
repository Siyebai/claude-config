/**
 * checks/index.mjs — 质量检测引擎入口 + 抗合理化退出验证
 *
 * 用法:
 *   import { runAllChecks, calcScore, verifyEvidence } from './checks/index.mjs';
 *   const result = runAllChecks(files);
 *
 * ── 抗合理化表（Anti-Rationalization）────────────────
 * 以下列出 Agent 常用来跳过验证的借口及应对策略。
 * 执行本引擎前请逐条确认：
 * [ ] "文件太多，我抽样检查" → 必须跑全量 walkDir，不抽样
 * [ ] "看起来没问题" → 必须输出 Issues[]，不能空手返回
 * [ ] "我之前跑过了" → 必须重新执行，不能复用旧结果
 * [ ] "这个检测器不重要" → 必须全部运行，除非 --only 显式指定
 * [ ] "结果已经写到文件了" → 必须检查文件是否存在且非空
 * ─────────────────────────────────────────────────
 */

import { checkTsNoCheck } from "./ts-nocheck.mjs";
import { checkAnyUsage } from "./any-usage.mjs";
import { checkConsoleLog } from "./console-log.mjs";
import { checkHardcodedSecrets } from "./security-hardcoded.mjs";
import { checkTodoFixme } from "./todo-fixme.mjs";
import { checkEval } from "./eval-detector.mjs";
import { checkLargeFiles } from "./large-files.mjs";
import { checkDeepNesting } from "./deep-nesting.mjs";

const ALL_CHECKS = [
  checkTsNoCheck,
  checkAnyUsage,
  checkConsoleLog,
  checkHardcodedSecrets,
  checkTodoFixme,
  checkEval,
  checkLargeFiles,
  checkDeepNesting,
];

/**
 * 对所有文件运行全部检测器（可选只跑指定检测器）
 * @param {{ path: string, content: string, extension: string, size: number }[]} files
 * @param {string[]|null} onlyCheckerNames - 仅运行这些检测器（name 属性匹配）
 * @returns {{ issues: Issue[], stats: object }}
 */
export function runAllChecks(files, onlyCheckerNames = null) {
  const allIssues = [];
  const stats = {};

  for (const checker of ALL_CHECKS) {
    if (onlyCheckerNames && !onlyCheckerNames.includes(checker.name)) continue;
    const t0 = Date.now();
    const issues = checker(files);
    const elapsed = Date.now() - t0;

    stats[checker.name] = {
      label: checker.label || checker.name,
      severity: checker.defaultSeverity || "P3",
      issues: issues.length,
      ms: elapsed,
    };
    allIssues.push(...issues);
  }

  return { issues: allIssues, stats };
}

/**
 * 质量评分 (0-100) — 按比例扣分制
 *
 * 基于每 100 文件的问题率而非绝对数量评分，
 * 避免大项目因绝对数多而过度扣分。
 *
 * @param {ImportMeta[]} issues
 * @param {{ fileCount: number }} meta
 */
export function calcScore(issues, meta = {}) {
  const { fileCount = 100 } = meta;
  if (fileCount <= 0 || issues.length === 0) return 100;

  const p0 = issues.filter((i) => i.severity === "P0").length;
  const p1 = issues.filter((i) => i.severity === "P1").length;
  const p2 = issues.filter((i) => i.severity === "P2").length;
  const p3 = issues.filter((i) => i.severity === "P3").length;

  // 计算每 100 文件的问题率
  const rate = (count) => (count / fileCount) * 100;
  const p0Rate = rate(p0);
  const p1Rate = rate(p1);
  const p2Rate = rate(p2);
  const p3Rate = rate(p3);

  let score = 100;

  // P0: 每 5% 的文件有 P0 问题 → -10 分，上限 -40
  if (p0Rate > 0) score -= Math.min(Math.floor(p0Rate / 5) * 10, 40);

  // P1: 每 10% → -5 分，上限 -25
  if (p1Rate > 0) score -= Math.min(Math.floor(p1Rate / 10) * 5, 25);

  // P2: 每 10% → -2 分，上限 -10
  if (p2Rate > 0) score -= Math.min(Math.floor(p2Rate / 10) * 2, 10);

  // P3: 每 10% → -1 分，上限 -5
  if (p3Rate > 0) score -= Math.min(Math.floor(p3Rate / 10) * 1, 5);

  // 无 P0/P1 问题 → 额外 +5 奖励分
  if (p0 === 0 && p1 === 0 && p2 < fileCount * 0.1) score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * 按严重度分组
 */
export function groupBySeverity(issues) {
  const groups = { P0: [], P1: [], P2: [], P3: [] };
  for (const issue of issues) {
    if (groups[issue.severity]) groups[issue.severity].push(issue);
    else groups.P3.push(issue);
  }
  return groups;
}

/**
 * 抗合理化退出验证
 * 检查检测器执行结果是否符合最低证据要求
 *
 * @param {{ issues: Issue[], stats: object, fileCount: number }} runResult
 * @returns {{ passed: boolean, evidence: string[], failures: string[] }}
 */
export function verifyEvidence(runResult) {
  const evidence = [];
  const failures = [];

  // 1. 文件是否真的被扫描了？
  if (runResult.fileCount > 0) {
    evidence.push(`✅ 扫描了 ${runResult.fileCount} 个源文件`);
  } else {
    failures.push("❌ 无文件被扫描 — walkDir 可能未执行");
  }

  // 2. 检测器是否真的全部运行了？
  const activeCheckers = Object.values(runResult.stats).filter(s => s.issues >= 0);
  if (activeCheckers.length > 0) {
    evidence.push(`✅ 运行了 ${activeCheckers.length} 个检测器`);
  } else {
    failures.push("❌ 0 个检测器运行 — 可能被跳过");
  }

  // 3. Issues 是否真的被写入了？
  if (runResult.issues.length > 0) {
    evidence.push(`✅ 发现 ${runResult.issues.length} 个问题`);
  } else {
    evidence.push("ℹ️ 未发现问题（可能项目很干净）");
  }

  // 4. 是否有 P0 问题未处理？
  const p0Count = runResult.issues.filter(i => i.severity === "P0").length;
  if (p0Count > 0) {
    failures.push(`⚠️ ${p0Count} 个 P0 问题待处理`);
  }

  return { passed: failures.length === 0, evidence, failures };
}
