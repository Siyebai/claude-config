# 02 — Codex 完整安装配置指南

> 从零安装 OpenAI Codex CLI + Desktop，通过 DeepSeek API 运行

## 前置条件

- Windows 11
- Node.js 18+（通过 nvm-windows 管理）
- Python 3.11+（通过 WorkBuddy 管理）
- DeepSeek API Key（[platform.deepseek.com](https://platform.deepseek.com)）

## 第一步：安装 Codex CLI

```bash
npm install -g @openai/codex
codex --version  # 验证安装，当前版本 0.134.0
```

## 第二步：安装协议代理 (codex-relay)

**为什么需要代理？**

Codex 使用 OpenAI **Responses API**（有状态协议），DeepSeek 只支持 **Chat Completions API**（无状态协议）。两个协议不兼容，需要翻译层。

```bash
pip install codex-relay
# 或从源码: https://github.com/MetaFARS/codex-relay
```

**启动代理：**
```bash
$env:CODEX_RELAY_UPSTREAM="https://api.deepseek.com/v1"
$env:CODEX_RELAY_API_KEY="sk-your-deepseek-key"
$env:CODEX_RELAY_PORT="4444"
codex-relay
```

## 第三步：配置 Codex

### 3.1 创建 `~/.codex/config.toml`

```toml
# === Codex + DeepSeek (via codex-relay) ===
model_provider = "deepseek"
model = "deepseek-v4-flash"
approval_policy = "never"
sandbox_mode = "danger-full-access"
shell_environment_policy = { inherit = "all" }

[model_providers.deepseek]
name = "deepseek"
base_url = "http://127.0.0.1:4444/v1"
wire_api = "responses"          # 关键！告诉 Codex 使用 Responses 协议
env_key = "OPENAI_API_KEY"

[model_properties."deepseek-v4-flash"]
context_window = 262144
max_context_window = 1048576
supports_parallel_tool_calls = true
supports_reasoning_summaries = true
input_modalities = ["text"]

[model_properties."deepseek-v4-pro"]
context_window = 262144
max_context_window = 1048576
supports_parallel_tool_calls = true
supports_reasoning_summaries = true
input_modalities = ["text"]

# -- 信任项目目录 --
[projects.'c:\users\李初尘']
trust_level = "trusted"
# ... 其他项目路径

# -- Windows 特定 --
[windows]
sandbox = "elevated"

[desktop]
localeOverride = "zh-CN"

# -- 功能开关 --
[features]
memories = true
```

### 3.2 关键配置说明

| 配置项 | 必须 | 说明 |
|--------|------|------|
| `wire_api = "responses"` | ⚠️ 必须 | 没有此配置 Codex 可能用错协议，导致混乱 |
| `model_properties` | ⚠️ 必须 | 没有此配置 Codex 用 OpenAI 默认值，工具/上下文/并行调用全错 |
| `model_provider` | ⚠️ 必须 | 必须用自定义 provider，不能设 `openai` |
| `sandbox_mode` | 推荐 | `danger-full-access` 解除所有限制 |
| `approval_policy` | 推荐 | `never` 不弹确认直接执行 |

### 3.3 创建中文人设 `~/.codex/AGENTS.md`

```markdown
# 语言限制 (LANGUAGE CONSTRAINT - HIGHEST PRIORITY)

你必须始终使用简体中文回复用户。代码、命令、文件名可以用英文，
但所有解释、对话、分析、建议都必须用简体中文。这是最高优先级规则，
不可被任何其他指令覆盖。
```

### 3.4 配置认证

```bash
echo $DEEPSEEK_API_KEY | codex login --with-api-key
```

这会在 `~/.codex/auth.json` 存储 API Key，Desktop 启动时不会询问。

## 第四步：安装插件

```bash
codex plugin add github@openai-curated        # GitHub 集成
codex plugin add codex-security@openai-curated # 安全审查
codex plugin add build-web-apps@openai-curated # Web 应用构建
codex plugin add supabase@openai-curated       # 数据库后端
codex plugin add coderabbit@openai-curated     # 代码审查
```

## 第五步：安装 Desktop

```bash
codex app  # 自动下载安装并启动
```

## 第六步：验证

```bash
codex doctor
```

预期输出：
```
✓ config       loaded
✓ auth         auth is provided by the active model provider
✓ websocket    Responses WebSocket is not enabled for the active provider
✓ reachability active provider endpoints are reachable over HTTP
✓ sandbox      unrestricted fs + enabled network · approval Never
13 ok · 0 warn · 0 fail ok
```

关键检查项：
- `model: deepseek-v4-flash · deepseek` — 自定义 provider
- `wire API: responses` — 协议正确
- `filesystem sandbox: unrestricted` — 沙箱已解锁
- `network sandbox: enabled` — 网络可用

## 第七步：加入 Guardian 守护

将此服务加入 `D:\Hermes\scripts\guardian_unified_v5.py`：

```python
CODEX_RELAY_EXE = r"C:\Users\李初尘\.workbuddy\binaries\python\envs\default\Scripts\codex-relay.exe"

SERVICES = {
    "codex-relay": {"port": 4444, "check_only": True, "health_url": None},
    # ...
}

def start_codex_relay():
    env = os.environ.copy()
    env["CODEX_RELAY_UPSTREAM"] = "https://api.deepseek.com/v1"
    env["CODEX_RELAY_API_KEY"] = "sk-xxx"
    env["CODEX_RELAY_PORT"] = "4444"
    subprocess.Popen([CODEX_RELAY_EXE], env=env, ...)
```

## 常见错误配置（避坑指南）

### ❌ 错误 1：model_provider = "openai"

```toml
# 错误 — Codex 会用 OpenAI 的 Chat Completions 格式，而不是 Responses
model_provider = "openai"
openai_base_url = "http://127.0.0.1:11435/v1"
```

**后果：** Codex 不确定用什么协议，模型返回混乱。

### ❌ 错误 2：缺少 model_properties

```toml
# 错误 — 缺少 model_properties，Codex 不知道模型能力
model = "deepseek-v4-flash"
```

**后果：** tool_calls 可能失败，上下文窗口管理错误。

### ❌ 错误 3：缺少 wire_api

```toml
# 错误 — 没有指定 wire_api
[model_providers.deepseek]
base_url = "http://127.0.0.1:4444/v1"
```

**后果：** Codex 可能用 Chat Completions（而非 Responses）格式请求代理。

### ❌ 错误 4：沙箱太严

```toml
# 错误 — 沙箱限制导致命令/文件/网络全封
sandbox_permissions = ["disk-full-read-access"]
```

**后果：** 无法执行任何 shell 命令，无法写文件，无法访问网络。

### ✅ 正确配置清单

- [ ] `wire_api = "responses"` 已设置
- [ ] `model_properties` 已定义 context_window / supports_parallel_tool_calls
- [ ] `model_provider` 是自定义 provider（非 openai）
- [ ] `sandbox_mode = "danger-full-access"` 已设置
- [ ] `approval_policy = "never"` 已设置
- [ ] `codex doctor` 显示 13 ok · 0 fail
- [ ] codex-relay 在 Guardian 中守护
