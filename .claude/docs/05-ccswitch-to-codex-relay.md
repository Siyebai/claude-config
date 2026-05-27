# 05 — 协议代理迁移：CCSwitch → codex-relay

## 为什么 CCSwitch 被弃用

### CCSwitch 架构
```
Codex → CCSwitch (Node.js, 自建) → DeepSeek API
         :11435
```

### 保留的问题

| 问题 | 影响 | 严重度 |
|------|------|--------|
| 协议翻译不完整 | 工具调用、SSE 流、上下文衔接有 bug | CRITICAL |
| PERSONA 注入在前 | DeepSeek 先看身份后看任务 → 上下文混乱 | HIGH |
| 无 model_properties | Codex 用错误默认值 | HIGH |
| Windows 持久化不稳定 | bash 后台进程频繁挂掉 | MEDIUM |
| 非社区方案 | 无测试覆盖、无社区验证 | MEDIUM |

### codex-relay 优势

| 特性 | CCSwitch | codex-relay |
|------|----------|-------------|
| 语言 | Node.js (自建) | Rust + Python (社区) |
| 维护者 | 个人 | 开源社区 (GitHub 400+ stars) |
| 协议翻译 | 不完整 | 完整，经过验证 |
| model_properties | 不支持 | 自动生成 |
| MCP namespace | 不支持 | 完整支持 |
| 流式 usage | 不支持 | 正确转发 |
| config 生成 | 手动 | `--print-config` 自动生成 |

## 迁移步骤

### 1. 停止 CCSwitch
```bash
taskkill /F /IM node.exe  # 或找到 CCSwitch 的 PID
```

### 2. 安装 codex-relay
```bash
pip install codex-relay
```

### 3. 启动 codex-relay
```bash
$env:CODEX_RELAY_UPSTREAM="https://api.deepseek.com/v1"
$env:CODEX_RELAY_API_KEY="sk-your-key"
$env:CODEX_RELAY_PORT="4444"
codex-relay
```

### 4. 更新 config.toml
```toml
# 之前 (CCSwitch)
model = "gpt-4.1"
model_provider = "openai"
openai_base_url = "http://127.0.0.1:11435/v1"

# 之后 (codex-relay)
model_provider = "deepseek"
model = "deepseek-v4-flash"

[model_providers.deepseek]
name = "deepseek"
base_url = "http://127.0.0.1:4444/v1"
wire_api = "responses"
env_key = "OPENAI_API_KEY"

[model_properties."deepseek-v4-flash"]
context_window = 262144
max_context_window = 1048576
supports_parallel_tool_calls = true
supports_reasoning_summaries = true
input_modalities = ["text"]
```

### 5. 更新 Guardian
将 SERVICES 中 CCSwitch 替换为 codex-relay：
```python
SERVICES = {
    # "CCSwitch": {"port": 11435, ...},  # 移除
    "codex-relay": {"port": 4444, "check_only": True, "health_url": None},
}
```

### 6. 验证
```bash
# 检查代理
curl http://127.0.0.1:4444/v1/models
# 预期: deepseek-v4-flash, deepseek-v4-pro

# 检查 Codex 配置
codex doctor | grep -E "model|wire|reachability|sandbox"
# 预期: 13 ok · 0 fail
```

## 技术细节

### Responses API vs Chat Completions API

```
Responses API (Codex 使用的):
{
  "model": "deepseek-v4-flash",
  "input": [{"role": "user", "content": "hello"}],
  "tools": [...],
  "previous_response_id": "resp_abc123",  // 有状态
  "stream": true
}

Chat Completions API (DeepSeek 支持的):
{
  "model": "deepseek-v4-flash",
  "messages": [{"role": "user", "content": "hello"}],
  "tools": [...],
  "stream": true
  // 无 previous_response_id — 上下文由客户端拼接
}
```

### codex-relay 的翻译工作

1. **消息转换**：`input[]` → `messages[]`，serial number → role mapping
2. **工具翻译**：Responses tool format → Chat Completions tool format
3. **SSE 事件映射**：`response.output_text.delta` → `choices[0].delta.content`
4. **状态管理**：`previous_response_id` → 客户端缓存的历史消息拼接
5. **MCP 命名空间**：`mcp__server__tool` namespace 完整支持

## CCSwitch 保留文件

`D:\DevTools\ccswitch\` 目录保留作为参考，但不再使用：
- `PERSONA.md` — Codex 人设定义
- `CODEX-MEMORY.md` — Codex 长期记忆
- `index.js` — 协议翻译逻辑（参考用）
