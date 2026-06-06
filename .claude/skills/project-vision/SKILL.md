---
name: project-vision
description: 项目审视 — 双模式：默认VTE树形检索 · 显式触发Repomix全量深扫
---

# Project Vision — 项目审视（双模式）

## 触发规则

| 你说 | 模式 | 引擎 |
|:-----|:------|:------|
| `审视项目` `项目全景` `扫描项目` `查看项目` `项目概览` | **默认·VTE** | `inspect.cjs` |
| `全面扫描` `全量审查` `检查整个项目` `完整审视` `地毯式检查` | **深扫·Repomix** | `project-inspector.mjs` |

---

## 模式 A：默认 — VTE 树形结构（日常 · 覆盖 65% 需求）

快速输出目录树 + 文件清单 + 符号预览。

```bash
# 当前目录
node scripts/inspect.cjs

# 指定深度
node scripts/inspect.cjs --depth=5

# 过滤类型
node scripts/inspect.cjs --filter="*.tsx"

# 搜索符号
node scripts/inspect.cjs --search="function:handle"

# 快速模式（depth=1, 无预览）
node scripts/inspect.cjs --quick

# JSON 输出
node scripts/inspect.cjs --json
```

**引擎**: Visual Tree Explorer (`~/.codex/skills/visual-tree-explorer/`)
**速度**: < 1s

---

## 模式 B：深扫 — Repomix 全量扫描（显式触发 · 99%+ 覆盖率）

读取项目的**每一个源文件**，生成完整代码包 + 分析报告。

```bash
node ~/.claude/scripts/project-inspector.mjs <目标目录>
```

**产出：**
- `project-report.md` — 结构化分析报告（概览·类型分布·目录树·文件清单·Git）
- `repomix-packed-output.md` — 全量打包文件（Tree-sitter压缩，每个文件的代码内容）

**引擎**: Repomix (`npx repomix@latest`)
**速度**: 大型项目 3-5s
**Token**: 0（打包阶段纯本地，不调用 API）

---

## 工具位置

| 工具 | 路径 | 用于 |
|:-----|:------|:------|
| `inspect.cjs` | `{项目}/scripts/inspect.cjs` | VTE 树形检索 |
| `scout.cjs` | `{项目}/scripts/scout.cjs` | 快速统计（Git + 模块数） |
| `project-inspector.mjs` | `~/.claude/scripts/project-inspector.mjs` | Repomix 全量深扫 |

## 注意事项

- VTE 模式依赖于 `~/.codex/skills/visual-tree-explorer/`，若不可用则降级到基础目录树
- 深扫模式仅在你说"全面扫描/全量审查/检查整个项目"时触发，日常审视走 VTE
- 深扫产出的打包文件包含完整代码，请勿公开分享
