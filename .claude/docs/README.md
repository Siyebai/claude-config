# 姜出尘(Siyebai) 本地 AI 开发环境文档

> 最后更新：2026-05-27 | 维护者：Codex + Claude Code

## 文档索引

| 文档 | 内容 |
|------|------|
| [01-系统架构总览](01-system-architecture.md) | 全部服务拓扑、端口映射、数据流 |
| [02-Codex 完整安装配置指南](02-codex-setup-complete-guide.md) | 从零安装 Codex CLI + Desktop，对接 DeepSeek |
| [03-Codex 问题诊断手册](03-codex-troubleshooting.md) | 常见问题 + 根因分析 + 修复步骤 |
| [04-服务守护系统 v5.1](04-service-guardian-v5.1.md) | Guardian 架构、配置、运维 |
| [05-协议代理：CCSwitch→codex-relay](05-ccswitch-to-codex-relay.md) | 迁移原因、对比、配置 |
| [06-Claude Code 新手部署指南](06-claude-code-beginner-guide.md) | Claude Code 从零安装、DeepSeek 对接、VS Code 集成 |

## 当前运行服务

```
:4444  codex-relay      → DeepSeek API (Codex 协议代理)
:8642  Hermes-API       → AI Gateway (爱马仕)
:11434 Ollama           → 本地模型 (4 models)
:18789 OpenClaw-GW      → WebSocket 面板
```

全部由 Guardian v5.1 守护，崩溃自动拉起。

## 核心配置文件

| 文件 | 路径 |
|------|------|
| Codex 配置 | `~/.codex/config.toml` |
| Codex 人设 | `~/.codex/AGENTS.md` |
| Codex 认证 | `~/.codex/auth.json` |
| 守护脚本 | `D:\Hermes\scripts\guardian_unified_v5.py` |
| OpenClaw 配置 | `D:\openclaw\config\openclaw.json` |
| CCSwitch PERSONA | `D:\DevTools\ccswitch\PERSONA.md` |
