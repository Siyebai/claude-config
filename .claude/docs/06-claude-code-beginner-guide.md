# 06 — Claude Code 新手部署指南

> 从零安装 Claude Code CLI，对接 DeepSeek API，VS Code 集成

## 前置条件

| 条件 | 要求 | 检查命令 |
|------|------|----------|
| Node.js | 18+ | `node -v` |
| npm | 9+（随 Node.js 安装） | `npm -v` |
| Git | 2.40+（可选，用于配置备份） | `git --version` |
| DeepSeek API Key | [platform.deepseek.com](https://platform.deepseek.com) 注册获取 | 有 sk- 开头的 key |
| 操作系统 | Windows 11 / macOS / Linux 均可 | — |

## 第一步：安装 Node.js（Windows）

已有 Node.js 可跳过。

```bash
# 用 nvm-windows 管理版本（推荐）
# 下载: https://github.com/coreybutler/nvm-windows/releases
nvm install 22
nvm use 22
```

## 第二步：安装 Claude Code CLI

```bash
npm install -g @anthropic-ai/claude-code

# 验证安装
claude --version
```

## 第三步：配置 DeepSeek 后端

Claude Code 默认使用 Anthropic API，需要指向 DeepSeek。

### 3.1 设置环境变量

在 `~/.bash_profile`（Git Bash）或系统环境变量中添加：

```bash
export ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
export ANTHROPIC_AUTH_TOKEN=sk-your-deepseek-api-key
export ANTHROPIC_MODEL=deepseek-v4-pro
export ANTHROPIC_DEFAULT_HAIKU_MODEL=deepseek-v4-flash
export ANTHROPIC_DEFAULT_SONNET_MODEL=deepseek-v4-pro
export ANTHROPIC_DEFAULT_OPUS_MODEL=deepseek-v4-pro
```

### 3.2 或写入 settings.json

Claude Code 启动后会生成 `~/.claude/settings.json`，可直接编辑：

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "sk-your-deepseek-api-key",
    "ANTHROPIC_MODEL": "deepseek-v4-pro",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-v4-flash",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-v4-pro",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-v4-pro"
  },
  "maxTokens": 8192,
  "fastMode": true
}
```

### 3.3 Windows 启动命令

```bash
# Git Bash 中启动
claude

# 或指定工作目录
claude --project ~/my-project
```

## 第四步：VS Code 集成（可选）

```bash
# VS Code 扩展商店搜索 "Claude Code" 安装
# 或在终端执行：
code --install-extension anthropic.claude-code
```

安装后在 VS Code 侧边栏会出现 Claude Code 面板。

## 第五步：验证安装

```bash
# 启动 Claude Code
claude

# 在交互界面中输入：
/status

# 应显示：
# - 模型: deepseek-v4-pro
# - 后端: https://api.deepseek.com/anthropic
# - 上下文窗口: 1M
```

## 配置备份与同步

本仓库 (`Siyebai/claude-config`) 包含完整配置备份：

```bash
git clone https://github.com/Siyebai/claude-config.git ~/claude-config-backup
# 按需复制 skills/agents/rules 到 ~/.claude/
```

## 常见问题

### Q: 启动报错 "API key not found"
A: 检查 `ANTHROPIC_AUTH_TOKEN` 环境变量是否设置，或 `settings.json` 中的 `env.ANTHROPIC_AUTH_TOKEN`。

### Q: 报错 "Connection refused" 或超时
A: DeepSeek API 在国内可直接访问。检查 `ANTHROPIC_BASE_URL` 是否正确。如果开了代理/梯子，尝试关闭或设置 `NO_PROXY=api.deepseek.com`。

### Q: 输出全是英文
A: 在项目根目录创建 `CLAUDE.md`：
```markdown
# 语言
- 始终用中文回复
```
或在 rules/ 下创建 `identity.md` 指定语言偏好。

### Q: 每次启动都要输入 API key
A: 将 API key 写入 `settings.json` 的 `env` 字段，或设置永久环境变量。

### Q: 上下文窗口 1M 但还是很贵
A: 
- 开启 `fastMode: true`（跳过非关键步骤）
- 设置 `effortLevel: "low"`（默认低推理努力）
- 精简 `CLAUDE.md` 和 rules 文件

---

> 相关文档：[02-Codex安装指南](02-codex-setup-complete-guide.md) | [01-系统架构](01-system-architecture.md)
