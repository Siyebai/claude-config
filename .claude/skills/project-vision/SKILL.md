---
name: project-vision
description: 项目审视 — 双模式：VTE树形检索 · Inspector全量深扫+快照对比
triggers: ["项目结构", "审视", "全景", "项目概览", "VTE", "扫描项目", "快照", "对比"]
weight: medium
---

# Project Vision — 项目审视（双模式）

## 触发规则

| 你说 | 模式 | 引擎 |
|:-----|:------|:------|
| `审视项目` `项目全景` `查看项目` `项目概览` | **默认·VTE** | `inspect.cjs` |
| `全面扫描` `全量审查` `检查整个项目` `完整审视` `地毯式检查` | **深扫·Inspector** | `project-inspector.mjs` |
| `快照` `对比上次` `增量` `diff` | **对比** | `--diff` 参数 |

---

## 模式 A：默认 — VTE 树形结构（日常 · 覆盖 65% 需求）

快速输出目录树 + 文件清单 + 符号预览。

```bash
node scripts/inspect.cjs                    # 当前目录
node scripts/inspect.cjs --depth=5          # 指定深度
node scripts/inspect.cjs --filter="*.tsx"   # 过滤类型
node scripts/inspect.cjs --search="function:handle"  # 搜索符号
node scripts/inspect.cjs --quick            # 快速模式
node scripts/inspect.cjs --json             # JSON 输出
```

**引擎**: Visual Tree Explorer (`scripts/inspect.cjs`)
**速度**: < 1s

---

## 模式 B：深扫 — Project Inspector v2（主力 · 99%+ 覆盖率）

读取项目的**每一个源文件**，输出分析报告 + JSON快照，支持增量对比。

```bash
# 标准全量扫描（推荐）
node ~/.claude/scripts/project-inspector.mjs <目标目录>

# 快速扫描（不运行repomix，仅文件系统）
node ~/.claude/scripts/project-inspector.mjs <目标目录> --no-pack

# 对比历史快照
node ~/.claude/scripts/project-inspector.mjs <目标目录> --diff ./project-scan.json

# 指定深度/过滤
node ~/.claude/scripts/project-inspector.mjs <目标目录> --depth 5 --filter "*.ts"
```

**产出：**
| 文件 | 说明 |
|:-----|:------|
| `project-report.md` | 结构化分析报告（概览·技术栈·类型分布·大小分布·重复文件·Git） |
| `project-scan.json` | JSON快照（供程序化消费 + 下次 --diff 对比） |
| `repomix-packed-output.md` | 全量打包文件（Tree-sitter压缩，每个文件的代码内容） |

**引擎**: Repomix (`npx repomix@latest`) + fs scan
**速度**: 快速扫描 <1s · 全量扫描 3-5s

---

## 工具位置

| 工具 | 路径 | 版本 |
|:-----|:------|:-----|
| `project-inspector.mjs` | `~/.claude/scripts/project-inspector.mjs` | **v2.0** |
| `inspect.cjs` | `{项目}/scripts/inspect.cjs` | VTE |

## 注意事项

- 深扫产出的打包文件包含完整代码，请勿公开分享
- 首次扫描生成 `project-scan.json`，后续可用 `--diff` 对比变化
- VTE 依赖 `~/.codex/skills/visual-tree-explorer/`，不可用时自动降级
