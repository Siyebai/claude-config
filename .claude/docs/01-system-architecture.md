# 01 — 系统架构总览

## 服务拓扑

```
┌─────────────────────────────────────────────────────────┐
│                    Guardian v5.1 (PID 守护)               │
│                  D:\Hermes\scripts\guardian_unified_v5.py │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────┐  ┌──────────┐  ┌──────┐│
│  │ codex-relay  │  │Hermes-API│  │OpenClaw  │  │Ollama││
│  │   :4444      │  │  :8642   │  │  :18789  │  │:11434││
│  │  (Rust/Python)│  │(Python)  │  │(Node.js) │  │(Go)  ││
│  └──────┬───────┘  └────┬─────┘  └────┬─────┘  └──┬───┘│
│         │               │             │            │    │
└─────────┼───────────────┼─────────────┼────────────┼────┘
          │               │             │            │
          ▼               ▼             ▼            ▼
   DeepSeek API    本地 AI 服务    Web 面板    本地 LLM
```

## 端口映射

| 端口 | 服务 | 技术栈 | 用途 | 守护 |
|------|------|--------|------|------|
| 4444 | codex-relay | Python/Rust | Responses→Chat API 翻译 | ✅ |
| 8642 | Hermes-API | Python/FastAPI | AI Gateway 主服务 | ✅ |
| 11434 | Ollama | Go | 本地 LLM 推理 | ✅ |
| 18789 | OpenClaw-GW | Node.js | WebSocket 控制面板 | ✅ |

## 数据流

### Codex → DeepSeek
```
Codex Desktop/CLI
  │  Responses API (OpenAI 格式)
  ▼
codex-relay (:4444)
  │  翻译: Responses API → Chat Completions API
  ▼
DeepSeek API (api.deepseek.com/v1)
  │  model: deepseek-v4-flash
  ▼
响应返回 → codex-relay 翻译 → Codex
```

### OpenClaw → DeepSeek
```
OpenClaw Web Panel (:18789)
  │  WebSocket
  ▼
OpenClaw Gateway (Node.js)
  │  Chat Completions API
  ▼
DeepSeek API / Ollama (本地)
```

### Hermes → 本地/云端
```
Hermes-API (:8642)
  │  FastAPI + WebSocket
  ▼
DeepSeek API (云端) + Ollama (本地)
```

## 依赖链

```
Guardian v5.1
  ├─ 启动 codex-relay → 依赖: Python + codex-relay pkg
  ├─ 启动 Hermes-API → 依赖: Python venv + hermes-cli
  ├─ 启动 OpenClaw-GW → 依赖: Node.js + openclaw npm pkg
  └─ 启动 Ollama → 依赖: ollama.exe
```

## 关键路径

| 路径 | 说明 |
|------|------|
| `D:\Hermes\` | Hermes Agent 主目录 |
| `D:\Hermes\scripts\guardian_unified_v5.py` | 守护进程 |
| `D:\openclaw\` | OpenClaw 主目录 |
| `D:\openclaw\config\openclaw.json` | OpenClaw 配置 |
| `D:\DevTools\ccswitch\` | CCSwitch (已弃用) |
| `C:\Users\李初尘\.codex\` | Codex 配置目录 |
| `C:\Users\李初尘\.claude\` | Claude Code 配置 |
| `C:\Users\李初尘\.workbuddy\` | WorkBuddy Python 环境 |
