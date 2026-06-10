---
name: project-scan-and-vision
description: TurboInspector v3.0 — 三模式审计引擎 / 0 Token / 全量检测
metadata: 
  node_type: memory
  type: reference
  originSessionId: 1c123986-b885-4290-bd1c-b5204ac4ecad
---

# 项目审视与扫描标准 v3.0

## 三模式
- **快速全景(scout)** — `node project-inspector.mjs <路径>` — 文件统计+技术栈+Git, ~1s
- **质量审计(quality)** — `+ --quality` — 8个内容检测器+评分+问题清单, ~2s, **0 Token**
- **完整审计(deep)** — `+ --deep` — 质量审计+Repomix全量打包, ~5s
- **增量模式** — `+ --incremental` — 仅扫 git diff 变更文件

## 质量审计检测器（全部纯正则，0 Token）
- P0: @ts-nocheck / 硬编码密钥
- P1: as any / eval / 动态执行
- P2: console.log / TODO/FIXME / 超大文件 / 深度嵌套

## 命令速查
```bash
# 快速全景（默认）
node ~/.claude/scripts/project-inspector.mjs <路径>

# 质量审计（推荐）
node ~/.claude/scripts/project-inspector.mjs <路径> --quality

# 完整审计
node ~/.claude/scripts/project-inspector.mjs <路径> --deep

# 增量模式
node ~/.claude/scripts/project-inspector.mjs <路径> --incremental

# 对比历史快照
node ~/.claude/scripts/project-inspector.mjs <路径> --diff ./project-scan.json
```

## 关键特性
- **0 Token**：纯本地运行，不调用 LLM
- **全量读取**：每个源码文件都读到，行级扫描
- **可操作输出**：P0-P3 问题清单 + 修复建议，不是数字统计
- **向后兼容**：v3.0 完全保留 v2.0 全部功能

## 工具路径
- 主引擎: `~/.claude/scripts/project-inspector.mjs`
- 检测器模块: `~/.claude/scripts/checks/`
- 技能: `project-vision` — 三模式自动路由
