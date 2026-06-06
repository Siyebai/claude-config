# /session — 会话管理（独立版，无ECC依赖）

## 用法
`/session save [name]` — 保存当前会话到 `.claude/session-data/`
`/session load <name>` — 恢复指定会话
`/session list` — 列出保存的会话
`/session delete <name>` — 删除指定会话

## 实现
- 保存: 收集当前状态（git分支、未commit文件、已加载技能）→ 写入 `~/.claude/session-data/<name>.json`
- 加载: 读文件 → 恢复上下文提示
- 自包含: 不依赖任何外部工具/插件
