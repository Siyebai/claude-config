---
name: codex-independence
description: 2026-06-08 Codex(夜不悔)彻底独立 — 不再与Claude共享配置/技能/空间
metadata: 
  node_type: memory
  type: reference
  priority: high
  originSessionId: 9f9a6a39-c501-4092-9d14-df8528ba066b
---

# Codex 彻底独立 (2026-06-08)

> 夜不悔不再是我(思夜白/Claude)的"AI幕僚",独立运作。

## 关键变更
- **身份独立**: AGENTS.md 重写,移除"思夜白的AI幕僚"引用
- **工作空间独立**: `D:/智能体共和国/夜不悔-workspace/`
- **技能隔离**: 只用 `~/.codex/skills/` (18个),不读 `~/.agents/skills/` (Claude的280个)
- **配置清洁**: config.toml 无bak,根目录无临时文件,sqlite仅保留必要的
- **系统提示压缩**: AGENTS.md 3.4KB→2.2KB, CODEX-MEMORY.md 4.5KB→1.2KB

## 不越界规则
- 不读对方配置/技能
- 不同时改同一文件
- 根目录不留临时文件
- 收到对方域的指令 → 拒绝执行

## 关联
- [[session-checkpoint]]
- [[skill-library]]
