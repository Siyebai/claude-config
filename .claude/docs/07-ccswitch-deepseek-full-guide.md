# 07 — CCSwitch + DeepSeek 完整部署教程（Codex & Claude Code）

> **永久保留 | 新手小白向 | 从零到能用**
>
> 本教程教你用 DeepSeek 大模型驱动 Codex CLI 和 Claude Code。
> Codex 需要 CCSwitch 做协议翻译；Claude Code 直连 DeepSeek。

---

## 一、你需要什么

| 东西 | 说明 | 去哪里搞 |
|------|------|----------|
| DeepSeek API Key | 调用大模型的密钥，`sk-` 开头 | [platform.deepseek.com](https://platform.deepseek.com) 注册→API Keys→新建 |
| Node.js 18+ | JavaScript 运行环境 | [nodejs.org](https://nodejs.org) 下载 LTS 版 |
| Git Bash | Windows 下的 Linux 终端 | [git-scm.com](https://git-scm.com) 下载安装 |
| CCSwitch | 协议翻译代理（本教程核心） | 本仓库 `~/.ccswitch-deepseek/` |
| Codex CLI | OpenAI 的 AI 编程工具 | `npm install -g @openai/codex` |
| Claude Code CLI | Anthropic 的 AI 编程工具 | `npm install -g @anthropic-ai/claude-code` |

---

## 二、为什么需要 CCSwitch

DeepSeek 只提供 **Chat Completions API**（一问一答的简单协议）。
Codex 使用 OpenAI 的 **Responses API**（有状态的复杂协议）。

两个协议不兼容，直接对接会报错。CCSwitch 在本地启动一个翻译代理，接收 Codex 的请求，翻译成 DeepSeek 认识的格式，把 DeepSeek 的回复翻译回 Codex 认识的格式。

```
Codex CLI                          DeepSeek API
   │                                    ▲
   │  Responses API                     │  Chat Completions API
   │  (OpenAI 格式)                     │  (DeepSeek 格式)
   │                                    │
   └──────► CCSwitch (localhost:11435) ──┘
                 翻译层
```

**Claude Code 不需要 CCSwitch！** DeepSeek 提供了原生的 Anthropic 兼容端点，Claude Code 直连即可。

---

## 三、第一步：安装 Node.js

### 3.1 下载安装

打开 https://nodejs.org ，下载 **LTS 版本**（左边绿色按钮）。

运行安装程序，一路点 Next。确保勾选 **"Add to PATH"**。

### 3.2 验证安装

打开 Git Bash，输入：

```bash
node --version
# 应该显示: v22.x.x 或 v20.x.x

npm --version
# 应该显示: 10.x.x 或 9.x.x
```

---

## 四、第二步：获取 DeepSeek API Key

1. 打开 https://platform.deepseek.com
2. 注册账号（手机号即可）
3. 充值（最低 10 元，够用很久）
4. 左侧菜单 → **API Keys** → **新建 API Key**
5. 复制密钥（`sk-` 开头的一长串字符），**保存到安全的地方**

> **重要**: API Key 只显示一次！关闭页面后无法再次查看。请立即保存。

---

## 五、第三步：部署 CCSwitch（Codex 专用）

### 5.1 进入 CCSwitch 目录

```bash
cd ~/.ccswitch-deepseek
```

### 5.2 安装依赖

```bash
npm install
```

等待下载完成（约 1-2 分钟）。

### 5.3 配置 API Key

创建 `.env` 文件（文件名就是 `.env`，没有后缀）：

```bash
# 在 ~/.ccswitch-deepseek/ 目录下创建 .env
echo "api_key=sk-你的deepseek密钥" > .env
echo "model=deepseek-v4-pro" >> .env
echo "port=11435" >> .env
```

用记事本打开 `.env` 确认内容：

```
api_key=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
model=deepseek-v4-pro
port=11435
```

**配置说明**：
- `api_key`: 你的 DeepSeek API 密钥
- `model`: 默认模型。推荐 `deepseek-v4-pro`（最强）或 `deepseek-v4-flash`（最快）
- `port`: CCSwitch 监听的端口，默认 `11435`，一般不需要改

### 5.4 启动 CCSwitch

```bash
npm start
```

看到以下输出表示成功：

```
[CCSwitch] listening on http://0.0.0.0:11435
```

### 5.5 验证 CCSwitch

新开一个 Git Bash 窗口：

```bash
curl http://localhost:11435/v1/models
```

应该返回包含 `deepseek-v4-pro` 的 JSON。

### 5.6 设置 CCSwitch 开机自启（可选）

创建 `~/.ccswitch-deepseek/start.bat`：

```batch
@echo off
cd /d %USERPROFILE%\.ccswitch-deepseek
start /B npm start
```

把这个 bat 文件放到 Windows 启动文件夹（`Win+R` → `shell:startup` → 放入快捷方式）。

---

## 六、第四步：安装并配置 Codex CLI

### 6.1 安装

```bash
npm install -g @openai/codex

# 验证
codex --version
```

### 6.2 配置 Codex 使用 CCSwitch

Codex 的配置文件在 `~/.codex/config.toml`。创建或编辑它：

```toml
# ~/.codex/config.toml

model_provider = "deepseek"
model = "deepseek-v4-pro"
trust_level = "all"

[model_providers.deepseek]
name = "deepseek"
base_url = "http://127.0.0.1:11435/v1"
wire_api = "responses"
env_key = "OPENAI_API_KEY"
```

**关键配置解释**：
- `base_url = "http://127.0.0.1:11435/v1"` — 指向本地 CCSwitch
- `wire_api = "responses"` — Codex 使用 Responses API 协议
- `model_provider = "deepseek"` — 告诉 Codex 模型提供商名称

### 6.3 设置环境变量

在 `~/.bash_profile` 中添加：

```bash
export OPENAI_API_KEY="sk-你的deepseek密钥"
```

然后执行 `source ~/.bash_profile` 使其生效。

### 6.4 验证 Codex

```bash
codex doctor
```

预期输出：所有检查项绿色通过，model 显示 `deepseek-v4-pro`。

### 6.5 测试对话

```bash
codex
```

进入交互界面后输入问题，确认能正常回复。

---

## 七、第五步：安装并配置 Claude Code

> Claude Code **不需要 CCSwitch**。DeepSeek 提供了原生 Anthropic 兼容端点。

### 7.1 安装

```bash
npm install -g @anthropic-ai/claude-code

# 验证
claude --version
```

### 7.2 配置 settings.json

Claude Code 第一次启动后会自动生成 `~/.claude/settings.json`。编辑它：

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "sk-你的deepseek密钥",
    "ANTHROPIC_MODEL": "deepseek-v4-pro",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-v4-flash",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-v4-pro",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-v4-pro",
    "CLAUDE_CODE_SUBAGENT_MODEL": "deepseek-v4-flash"
  },
  "maxTokens": 8192,
  "fastMode": true,
  "effortLevel": "low",
  "defaultPermissionMode": "bypassPermissions"
}
```

**配置解释**：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `ANTHROPIC_BASE_URL` | `https://api.deepseek.com/anthropic` | DeepSeek 的 Anthropic 兼容端点 |
| `ANTHROPIC_MODEL` | `deepseek-v4-pro` | 主力模型，最强推理 |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | `deepseek-v4-flash` | 子代理用轻量模型，省费用 |
| `maxTokens` | `8192` | 每次回复最多输出 8K tokens |
| `fastMode` | `true` | 跳过非关键步骤 |
| `effortLevel` | `"low"` | 默认低推理努力，复杂任务自动升级 |

### 7.3 验证 Claude Code

```bash
claude
```

进入交互界面，输入 `/status`，确认显示：
- 模型: `deepseek-v4-pro`
- 后端: `https://api.deepseek.com/anthropic`

---

## 八、完整架构总览

```
┌─────────────────────────────────────────────────────┐
│                  你的电脑 (Windows 11)                │
│                                                      │
│  ┌──────────┐          ┌──────────┐                 │
│  │ Codex CLI │          │Claude Code│                │
│  │ (OpenAI   │          │ (Anthropic│               │
│  │  Responses│          │  API)     │               │
│  │  API)     │          │           │               │
│  └────┬─────┘          └─────┬─────┘               │
│       │                      │                      │
│       │ localhost:11435      │ https (直连)          │
│       ▼                      │                      │
│  ┌──────────┐                │                      │
│  │ CCSwitch │                │                      │
│  │ 协议翻译  │                │                      │
│  │ :11435   │                │                      │
│  └────┬─────┘                │                      │
│       │                      │                      │
│       │ Chat Completions API │ Anthropic-compatible │
│       ▼                      ▼                      │
│  ┌─────────────────────────────────────┐           │
│  │        DeepSeek API 云端              │           │
│  │   api.deepseek.com                   │           │
│  │   /v1          /anthropic            │           │
│  └─────────────────────────────────────┘           │
└─────────────────────────────────────────────────────┘
```

**数据流总结**：
- Codex → CCSwitch（翻译）→ DeepSeek `/v1`（Chat API）
- Claude Code → DeepSeek `/anthropic`（直连，无需翻译）

---

## 九、日常使用流程

### 启动顺序

1. **启动 CCSwitch**（如果要用 Codex）：
   ```bash
   cd ~/.ccswitch-deepseek && npm start
   ```

2. **用 Codex**：
   ```bash
   cd 你的项目目录
   codex
   ```

3. **用 Claude Code**：
   ```bash
   cd 你的项目目录
   claude
   ```

### 查看运行状态

```bash
# 检查 CCSwitch 是否运行
curl http://localhost:11435/v1/models

# 检查 Codex 连接
codex doctor

# 检查 Claude Code 状态
claude → /status
```

---

## 十、常见问题排查

### Q1: CCSwitch 启动报错 "Cannot find module"

```bash
cd ~/.ccswitch-deepseek
rm -rf node_modules
npm install
npm start
```

### Q2: Codex 连接 CCSwitch 超时

```bash
# 确认 CCSwitch 在运行
curl http://localhost:11435/v1/models

# 如果 curl 也超时 → CCSwitch 挂了，重启
# 如果 curl 正常 → 检查 config.toml 的 base_url 是否正确
```

### Q3: Claude Code 启动报 "API key not found"

检查 `~/.claude/settings.json` 中 `env.ANTHROPIC_AUTH_TOKEN` 是否正确。
或者确认环境变量：`echo $ANTHROPIC_AUTH_TOKEN`

### Q4: DeepSeek 返回 401 错误

API Key 无效或过期。去 https://platform.deepseek.com 重新生成。

### Q5: DeepSeek 返回 402 错误

账户余额不足。去 platform.deepseek.com 充值。

### Q6: 回复中文乱码

Git Bash 的编码问题。在 Git Bash 窗口右键 → Options → Text → Locale 选 `zh_CN` → Character set 选 `UTF-8`。

### Q7: 端口 11435 被占用

```bash
# 查看谁占用了 11435
netstat -ano | findstr 11435

# 改 CCSwitch 端口（在 .env 中修改）
port=11436
# 同时更新 Codex config.toml 中的 base_url
```

### Q8: 如何更新 DeepSeek 模型

DeepSeek 出新模型后，更新两处：
1. `~/.ccswitch-deepseek/.env` → `model=新模型名`
2. `~/.codex/config.toml` → `model = "新模型名"`
3. `~/.claude/settings.json` → `ANTHROPIC_MODEL: "新模型名"`

---

## 十一、费用参考

DeepSeek 定价（2026年5月）：

| 模型 | 输入价格 | 输出价格 | 适合场景 |
|------|----------|----------|----------|
| deepseek-v4-pro | ¥2/百万tokens | ¥8/百万tokens | 复杂编程、架构设计 |
| deepseek-v4-flash | ¥0.5/百万tokens | ¥2/百万tokens | 简单任务、子代理 |

**实际花费参考**：日常编程使用，每月约 ¥5-20 元。

查看用量：https://platform.deepseek.com → 用量统计

---

## 十二、配置文件速查

### CCSwitch `.env`
```
api_key=sk-xxx
model=deepseek-v4-pro
port=11435
```

### Codex `~/.codex/config.toml`
```toml
model_provider = "deepseek"
model = "deepseek-v4-pro"
trust_level = "all"

[model_providers.deepseek]
name = "deepseek"
base_url = "http://127.0.0.1:11435/v1"
wire_api = "responses"
env_key = "OPENAI_API_KEY"
```

### Claude Code `~/.claude/settings.json`
```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "sk-xxx",
    "ANTHROPIC_MODEL": "deepseek-v4-pro",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-v4-flash",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-v4-pro",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-v4-pro"
  },
  "maxTokens": 8192,
  "fastMode": true
}
```

---

> **维护承诺**: 本文档永久保留，随 DeepSeek/Codex/Claude Code 更新同步维护。
>
> 相关文档: [01-系统架构](01-system-architecture.md) | [02-Codex安装指南](02-codex-setup-complete-guide.md) | [06-Claude Code新手部署](06-claude-code-beginner-guide.md)
