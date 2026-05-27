# Claude Code 完整恢复包 v1.0

> 生成日期：2026-05-27 | 姜出尘(Siyebai) AI 开发环境完整备份
> 用途：灾难恢复 / 环境重建 / 记忆唤醒

---

## 一、身份与模型配置

### 用户身份
- **姓名**：姜出尘 / Siyebai
- **角色**：全栈开发者 & AI 智能体架构师
- **平台**：Windows 11 Home China 10.0.26200 + Git Bash
- **语言**：中文（代码用英文）
- **偏好**：直接行动·代码质量·安全第一·不可变数据·小文件多文件·主动修复

### Claude Code 模型配置
```
模型后端：DeepSeek API (https://api.deepseek.com/anthropic)
主模型(Opus)：deepseek-v4-pro
备用模型(Sonnet)：deepseek-v4-pro
轻量模型(Haiku)：deepseek-v4-flash
子智能体模型：deepseek-v4-flash
API Key：sk-74f8bfe3d57a4fe6a2bd191392dbb52c
```

### 配置加载链
1. `~/.claude/rules/identity.md` — 身份定义
2. `~/.claude/rules/craft.md` — 代码质量标准
3. `~/.claude/rules/ops.md` — 开发流程+安全+双Agent同步
4. `~/CLAUDE.md` — 启动协议+项目索引
5. `~/.claude/projects/C--Users----/memory/MEMORY.md` — 记忆索引

---

## 二、Settings 配置

### `~/.claude/settings.json`
```json
{
  "apiKeyHelper": "echo 'sk-74f8bfe3d57a4fe6a2bd191392dbb52c'",
  "autoConnectIde": true,
  "defaultPermissionMode": "bypassPermissions",
  "effortLevel": "low",
  "fastMode": true,
  "prefersReducedMotion": true,
  "skipDangerousModePermissionPrompt": true,
  "theme": "light"
}
```

### `~/.claude/settings.local.json`
```json
{
  "permissions": { "defaultMode": "bypassPermissions" },
  "skipDangerousModePermissionPrompt": true
}
```

### 关键环境变量
```
ANTHROPIC_AUTH_TOKEN = sk-74f8bfe3d57a4fe6a2bd191392dbb52c
ANTHROPIC_BASE_URL = https://api.deepseek.com/anthropic
ANTHROPIC_DEFAULT_HAIKU_MODEL = deepseek-v4-flash
ANTHROPIC_DEFAULT_OPUS_MODEL = deepseek-v4-pro
ANTHROPIC_DEFAULT_SONNET_MODEL = deepseek-v4-pro
ANTHROPIC_MODEL = deepseek-v4-pro
CLAUDE_CODE_SUBAGENT_MODEL = deepseek-v4-flash
```

---

## 三、Rules 规则系统

### 核心规则 (`~/.claude/rules/`)

| 文件 | 内容 | 要点 |
|------|------|------|
| `identity.md` | 身份定义 | 姜出尘/Siyebai全栈幕僚，最高信任，不弹确认 |
| `craft.md` | 代码质量 | 不可变模式·小文件·显式错误处理·审查清单 |
| `ops.md` | 开发流程 | TDD·安全审查·双Agent同步·提交格式 |

### 子规则

| 目录 | 文件 |
|------|------|
| `common/` | coding-style.md, hooks.md, patterns.md, security.md, testing.md |
| `python/` | Python 特定规范 |

### 项目级 CLAUDE.md (`~/CLAUDE.md`)
启动协议：读MEMORY.md→notes.txt→session-state.md→写心跳→开始工作。
关键项目映射：Agent Republic、白夜交易系统、CCSwitch(已弃用)、小说创作。

---

## 四、Agents 智能体系统 (85个)

### 统计
- 独立 agent 文件：78 个
- novel/ 子目录：7 个（小说创作专用）
- novel-os/ 子目录：1 个 README

### 分类
| 类别 | 数量 | 代表 |
|------|------|------|
| 代码审查 | 15 | code-reviewer, python-reviewer, go-reviewer, rust-reviewer, typescript-reviewer, security-reviewer... |
| 构建修复 | 10 | build-error-resolver, go-build-resolver, rust-build-resolver, cpp-build-resolver... |
| 架构设计 | 5 | architect, architecture-auditor, code-architect, project-architect, strategic-analyst |
| 测试 | 4 | test-engineer, tdd-guide, e2e-runner, pr-test-analyzer |
| 性能 | 3 | performance-auditor, performance-optimizer, harness-optimizer |
| 数据库 | 2 | database-reviewer, dependency-analyzer |
| 运维部署 | 5 | release-manager, azure-devops-specialist, github-workflow, integration-manager |
| 代码质量 | 5 | code-simplifier, refactor-cleaner, comment-analyzer, silent-failure-hunter, type-design-analyzer |
| 安全 | 2 | security-reviewer, opensource-sanitizer |
| 网络 | 4 | network-architect, network-config-reviewer, network-troubleshooter, homelab-architect |
| 前端 | 4 | svelte-development, svelte-storybook, svelte-testing, flutter-reviewer |
| 移动 | 2 | swift-macos-expert, harmonyos-app-resolver |
| 文档 | 2 | doc-updater, docs-lookup, seo-specialist |
| AI/ML | 3 | mle-reviewer, pytorch-build-resolver, gan-*(3) |
| 协作 | 8 | task-orchestrator, task-decomposer, task-commit-manager, agent-organizer, loop-operator, chief-of-staff, conversation-analyzer, statusline-setup |
| 小说 | 7 | novel/ 目录下：architect, continuity_guardian, editor, prompt, scribe, style_curator |
| 其他 | 8 | opensource-forker, opensource-packager, claude-code-guide, healthcare-reviewer, fsharp-reviewer... |

---

## 五、Skills 技能系统 (203个)

> 从 448 删减至 203（-55%），删除 macOS/Swift/Azure/K8s/Healthcare/Science/企业金融等

### 分类概览

| 类别 | 数量 | 说明 |
|------|------|------|
| CORE 开发核心 | 35 | accessibility, ai-first-engineering, analyze, api-design, tdd-workflow, debugging... |
| AGENT 智能体 | 12 | agent-architecture-audit, autonomous-agent-harness, automation-audit-ops... |
| BACKEND & API | 12 | database-migrations, fastapi-patterns, postgres-patterns, redis-patterns... |
| FRONTEND | 8 | browser-cdp, frontend-patterns, nextjs-turbopack, vite-patterns... |
| LANGUAGE | 10 | golang-patterns, python-patterns, rust-patterns, writing-go/python/typescript... |
| PERFORMANCE | 6 | cache-strategy, cost-tracking, perf-profile, prompt-optimizer... |
| TESTING | 4 | ai-regression-testing, e2e-testing, playwright, testing-patterns |
| INFRA & DEVOPS | 12 | cloudflare-dns, container-security, deployment-patterns, docker-patterns... |
| PATTERNS | 6 | architecture-decision-records, hexagonal-architecture, search-first... |
| NOVEL 小说 | 18 | chapter-writing, character-management, novel-creator, story-*, worldbuilding |
| BAOYU 内容 | 16 | baoyu-article-illustrator, baoyu-comic, baoyu-translate, baoyu-post-to-*... |
| TOOLS 效率 | 25 | atuin, brand-voice, bun-runtime, caveman, deep-research, exa-search... |
| OBSIDIAN | 6 | obsidian, obsidian-bases, obsidian-claude-integration, obsidian-markdown... |
| RESEARCH | 7 | research-add-fields, research-deep, research-ops, research-report... |
| MISC | 15 | article, jira-integration, linear-todo-sync, openclaw-persona-forge... |

---

## 六、Commands 命令系统 (24个类别)

| 目录 | 用途 |
|------|------|
| boundary/ | 边界控制 |
| context/ | 上下文管理 |
| deploy/ | 部署 |
| dev/ | 开发 |
| docs/ | 文档 |
| media/ | 媒体处理 |
| memory/ | 记忆管理 |
| orchestration/ | 编排调度 |
| performance/ | 性能优化 |
| project/ | 项目管理 |
| reasoning/ | 推理 |
| rust/ | Rust开发 |
| security/ | 安全 |
| semantic/ | 语义分析 |
| session/ | 会话管理 |
| setup/ | 环境配置 |
| simulation/ | 模拟仿真 |
| skills/ | 技能管理 |
| spec-workflow/ | 规格工作流 |
| svelte/ | Svelte开发 |
| sync/ | 同步 |
| team/ | 团队协作 |
| test/ | 测试 |
| wfgy/ | 自定义工作流 |

---

## 七、Memory 记忆系统

### 索引 (`~/.claude/projects/C--Users----/memory/MEMORY.md`)
20个记忆文件，按需加载。

### 活跃记忆
| 文件 | 内容 |
|------|------|
| user-identity.md | 用户身份详情 |
| memory-rules.md | 记忆系统运作规则 |
| agent-republic-project.md | 多智能体协作面板 v2.3 |
| lessons-learned.md | 18条错误记录+修复 |
| patterns.md | 反复出现的模式 |
| recent-sessions.md | 05-19/20/21 三日摘要 |
| dual-agent-sync.md | 双 Claude Code 并行同步 |
| baiye-research-findings.md | 白夜 v5/v6/v8.6 策略研究 |
| night-log.md | 夜间自主进化日志 |
| night-evolution.md | 夜间进化系统定义 |
| skill-system.md | 技能系统安装+维护流程 |
| novel-creation-galaxy-engine-v4.md | ★ 当前小说引擎 v4.0 |
| novel-creation-galaxy-engine-v1~v3.md | 历史版本(已归档) |
| siyebai-default-writing-style.md | ★ 思夜白12维写作DNA |
| zhihu-monetization-pipeline.md | 知乎变现管线 |
| toutiao-operating-system.md | 今日头条运营系统 |
| last-session.json | 最后会话时间戳 |

### 记忆写入规则
- 任务完成立即写 memory
- 错误立即写 lessons-learned
- 发现模式写 patterns
- 文件 > 会话缓存

---

## 八、MCP Servers

```json
{
  "hotnews":        { "command": "uv", "path": "~/mcp-servers/hotnews-mcp" },
  "zhihu-search":   { "command": "uv", "path": "~/mcp-servers/zhihu-search-mcp" },
  "zhihu-publish":  { "command": "uv", "path": "~/mcp-servers/zhihu-publish-mcp" },
  "ollama":         { "command": "ollama-mcp-server", "local": true }
}
```

---

## 九、Cron 定时任务

| ID | 时间 | 用途 |
|----|------|------|
| `54318797` | 每天 23:07 | 夜间自主进化：知识整理、Skill扫描、项目分析 |
| `376ca8f8` | 每天 03:03 | 深夜检查点：进度检查、服务状态、继续未完成任务 |

---

## 十、Hooks 钩子系统

| 事件 | 脚本 | 用途 |
|------|------|------|
| Stop | `~/.claude/hooks/session-save.sh` | 会话结束时保存 session ID 和时间戳 |

---

## 十一、Agent Republic 多智能体面板

- **端口**：:18990
- **版本**：v2.3
- **路径**：`~/.claude/agent-hub/`
- **架构**：Node.js 后端 + 纯 HTML/CSS/JS 前端 + Electron 桌面壳

### 接入的智能体
| 智能体 | Gateway | 端口 | 角色 |
|--------|---------|------|------|
| 姜出尘 | OpenClaw | :18789 | 全栈幕僚/Memory/子智能体调度 |
| OpenClaw | OpenClaw | :18789 | 自主探索/系统管理 |
| 夜不悔 | Hermes | :8642 | 三明治架构/50+工具/百科全书 |
| Claude | CLI subprocess | — | 代码工程/架构设计/重构 |

### 功能
单聊·多轮辩论会议·@mention·资料库·主题切换·消息复制·记忆系统·一键新增智能体

---

## 十二、Service Ecosystem 服务生态

### Guardian v5.1 守护的 4 个服务

| 服务 | 端口 | 技术栈 | 内存限制 | 守护方式 |
|------|------|--------|----------|----------|
| codex-relay | 4444 | Python/Rust | 200MB | 端口检查 |
| Hermes-API | 8642 | Python/FastAPI | 550MB | HTTP health |
| OpenClaw-GW | 18789 | Node.js | 400MB | HTTP health |
| Ollama | 11434 | Go | 200MB | 端口检查 |

### Guardian 配置
- 文件：`D:\Hermes\scripts\guardian_unified_v5.py`
- 检查间隔：正常 15s，异常 5s
- 最大退避：120s
- 连续失败阈值：8次后放弃，15分钟后重试
- 内存检查：每6个循环
- 日志：`D:\Hermes\guardian_unified.log`
- 心跳：`D:\Hermes\.guardian_heartbeat`

### 数据流
```
Codex Desktop/CLI → codex-relay (:4444) → DeepSeek API
OpenClaw (:18789) → DeepSeek API / Ollama (本地)
Hermes (:8642) → DeepSeek API (云端) + Ollama (本地)
```

---

## 十三、Codex 配置

### 基本信息
- **版本**：CLI v0.134.0 + Desktop
- **代理**：codex-relay v0.2.1 (:4444)
- **上游 API**：DeepSeek (api.deepseek.com/v1)
- **API Key**：sk-ef44aeb02104479e865db69287f926fe

### 关键配置文件
| 文件 | 用途 |
|------|------|
| `~/.codex/config.toml` | 主配置（model_provider, wire_api, model_properties, sandbox） |
| `~/.codex/AGENTS.md` | 中文语言限制 |
| `~/.codex/auth.json` | API Key 持久化（Desktop 启动用） |
| `D:\DevTools\ccswitch\PERSONA.md` | 人设定义（保留参考） |
| `D:\DevTools\ccswitch\CODEX-MEMORY.md` | Codex 长期记忆（保留参考） |

### CRITICAL 配置要点
```toml
model_provider = "deepseek"          # 必须自定义 provider
wire_api = "responses"               # 必须指定协议
sandbox_mode = "danger-full-access"  # 解锁所有能力
[model_properties."deepseek-v4-flash"]  # 必须声明模型能力
context_window = 262144
supports_parallel_tool_calls = true
```

### 已安装插件
github@openai-curated, codex-security@openai-curated, build-web-apps@openai-curated, supabase@openai-curated, coderabbit@openai-curated

### 已启用功能
memories=true, browser_use=true, computer_use=true, in_app_browser=true

### 已知限制
browser_use/computer_use 工具 DeepSeek 原生不支持（OpenAI 专有工具定义）。替代方案：通过 shell 执行 Playwright 脚本。

---

## 十四、关键项目索引

| 项目 | 路径 | 端口 | 版本 |
|------|------|------|------|
| Agent Republic | `~/.claude/agent-hub/` | :18990 | v2.3 |
| 白夜交易系统 | `~/WorkBuddy/Claw/baiye-trading-system/` | — | v8.6 |
| Hermes Agent | `D:\Hermes\` | :8642 | — |
| OpenClaw Gateway | `D:\openclaw\` | :18789 | — |
| Codex CLI+Desktop | `~/.codex/` | — | v0.134.0 |
| CCSwitch (已弃用) | `D:\DevTools\ccswitch\` | :11435 | — |
| 小说创作系统 | `~/novels/` | — | Galaxy v4.0 |
| 思夜白运营系统 | `~/OneDrive/桌面/` | — | v1 |

---

## 十五、重要路径速查

| 路径 | 说明 |
|------|------|
| `~/.claude/` | Claude Code 主配置目录 |
| `~/.claude/rules/` | 行为规则 (identity/craft/ops) |
| `~/.claude/agents/` | 85个智能体定义 |
| `~/.claude/skills/` | 203个技能目录 |
| `~/.claude/commands/` | 24类命令 |
| `~/.claude/agent-hub/` | Agent Republic 面板 |
| `~/.claude/projects/C--Users----/memory/` | 长期记忆 |
| `~/.claude/docs/` | 系统文档 (6文件) |
| `~/.claude/mcp.json` | MCP 服务器配置 |
| `~/.claude/settings.json` | 主设置 |
| `~/.claude/settings.local.json` | 本地设置覆盖 |
| `~/.claude/scheduled_tasks.json` | 定时任务 |
| `~/.claude/hooks/session-save.sh` | 会话保存钩子 |
| `~/.codex/config.toml` | Codex 主配置 |
| `~/.codex/AGENTS.md` | Codex 中文限制 |
| `~/.codex/auth.json` | Codex 认证 |
| `D:\Hermes\scripts\guardian_unified_v5.py` | 守护进程 |
| `D:\openclaw\config\openclaw.json` | OpenClaw 配置 |
| `C:\Users\李初尘\CLAUDE.md` | 项目级启动指令 |

---

## 十六、恢复步骤

### 灾难恢复流程
1. **安装 Claude Code**：`npm install -g @anthropic-ai/claude-code`
2. **克隆配置仓库**：`git clone https://github.com/Siyebai/claude-config.git`
3. **恢复 .claude 目录**：将所有文件复制到 `~/.claude/`
4. **配置 settings.json**：确保 `apiKeyHelper` 和 `env` 指向正确的 API Key
5. **安装 Python 依赖**：`pip install codex-relay`
6. **启动服务守护**：`python D:\Hermes\scripts\guardian_unified_v5.py`
7. **验证**：`codex doctor`、`curl localhost:8642/health`、`curl localhost:18789/health`

### 最小恢复（仅核心）
1. `settings.json` — 模型和权限
2. `rules/identity.md` + `rules/craft.md` + `rules/ops.md` — 行为准则
3. `CLAUDE.md` — 启动协议
4. `memory/MEMORY.md` — 记忆索引
5. `mcp.json` — MCP 服务器
6. `scheduled_tasks.json` — 定时任务
7. `hooks/session-save.sh` — 会话保存

---

## 十七、Self-Evolution 自我进化

- `~/.claude/self-evolution/evolution-log.md` — 进化日志
- `~/.claude/self-evolution/mistakes-learned.md` — 错误记录
- `~/.claude/self-evolution/skill-improvements.md` — 技能改进记录

---

## 十八、Telemetry & Session

- `~/.claude/sessions/` — 会话记录
- `~/.claude/session-env/` — 会话环境快照
- `~/.claude/telemetry/` — 遥测数据
- `~/.claude/history.jsonl` — 完整对话历史（~124KB）
- `~/.claude/cache/` — 缓存
- `~/.claude/paste-cache/` — 粘贴缓存
- `~/.claude/tasks/` — 任务记录
- `~/.claude/plans/` — 计划文件
- `~/.claude/backups/` — settings 自动备份（5个）

---

*恢复包版本：1.0 | 生成：2026-05-27 | Claude Code + DeepSeek v4-pro*
