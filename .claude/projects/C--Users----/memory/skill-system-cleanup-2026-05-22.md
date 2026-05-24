---
name: skill-system-cleanup-2026-05-22
description: "457→448 skills, ~30 commands deleted, 4 toggle skills consolidated, SKILLS_INDEX rewritten"
metadata: 
  node_type: memory
  type: project
  originSessionId: 5102d8c9-5998-476e-8358-79d826bcc17c
---

# Skill 系统清理 (2026-05-22)

清理结果: 457 skills → 448 (-9), ~293 commands → 263 (-30), 88 agents → 89 (净增1)

## 删除的 Skills (9)
- `continuous-learning` — 自标记 DEPRECATED，已有 v2
- `core/` — 无 SKILL.md 废弃空壳
- `commit` — 被 `writing-commits` + 内置 `/commit` 覆盖
- `tdd` — 被 `tdd-workflow` (ECC 详细版) 覆盖
- `azure-network-calculator` — 与 `devops-network-calculator-for-azure` 功能重复

## 合并的 Skills (4→2)
- `dbmap-auto-on` + `dbmap-auto-off` → 功能合并入 `dbmap`
- `repomap-auto-on` + `repomap-auto-off` → 功能合并入 `repomap`

## 删除的 Commands (~30)
- webmcp/* (5) — skill 包装器
- 2 个 demo — 无实际功能
- 5 个薄包装 — setup/agent-tail, dev/create-ui-component 等
- 18 个语言专项 — cpp-review/cpp-build/go-test 等, Agent 已自动触发
- 4 个重复 review — code-quality/pr-review/review-pr/quality-gate
- 3 个 agent 包装 — build-fix/refactor-clean/security-scan
- 1 个重复 status — orchestration/status
- 1 个重复 learn — learn (保留 learn-eval)

## 删除的非 Agent 文件 (3)
- agents/README.md, TASK-STATUS-PROTOCOL.md, WORKFLOW_EXAMPLES.md

## 重写
- SKILLS_INDEX.md — 全新 4-Tier 结构，功能注释，关联索引，冲突规则
- CLAUDE.md — 更新计数

**Why:** 457 skills 存在 5 个明确冗余 + 4 个 toggle 可合并 + ~30 commands 是 agent/skill 包装器。清理后索引更清晰，按功能域分组，便于快速定位。
**How to apply:** 新会话启动时自动加载 SKILLS_INDEX.md。遇到重复 skill 先查索引确认是否已有覆盖，不再重复安装。
