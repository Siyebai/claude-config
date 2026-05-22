# Dual Agent Sync — 双智能体同步机制

本地同时运行 2 个 Claude Code：CLI + VS Code。同一文件系统，独立对话上下文。

## 同步规则

完成以下操作后**必须写入文件**：

| 操作 | 写入位置 |
|------|---------|
| 学到新知识 | `memory/*.md` |
| 执行新配置 | `memory/*.md` 或 `rules/` |
| 完成任务 | `memory/YYYY-MM-DD.md` |
| 知识库更新 | `D:\openclaw\knowledge-base\` |
| 行为变更 | `CLAUDE.md` 或 `~/.claude/rules/` |

## 冲突预防

- ❌ 禁止同时编辑同一文件
- ❌ 禁止同时 `npm install` / `git commit` / `git push`
- ✅ 一方写操作时，另一方只读
- ✅ 任务分区：VS Code 前端，CLI 后端/系统
- ✅ 追加内容时不覆盖已有内容

## 启动时

检查 `memory/YYYY-MM-DD.md` 是否存在 → 加载当日对方写入的更新。
