# 03 — Codex 问题诊断手册

## 问题 1：Codex 回答混乱、驴唇不对马嘴

### 症状
- 问 A，回答 B（如问知乎问题，回复小说创作指南）
- 模型在对话中跳跃到不相关话题
- 工具调用失败后上下文断裂

### 根因分析

经过多次排查，确定**三个根本原因**：

| # | 根因 | 严重度 | 说明 |
|---|------|--------|------|
| 1 | CCSwitch 协议翻译有 bug | CRITICAL | 自建 Node.js 代理的 Responses→Chat 翻译不完整，消息丢失、工具链断裂 |
| 2 | 缺少 `wire_api` + `model_properties` | CRITICAL | Codex 不知道用什么协议、模型有什么能力，全用错误默认值 |
| 3 | PERSONA 注入顺序错误 | HIGH | PERSONA 被放在任务指令前面，DeepSeek 先看到身份后看到任务 |

### 修复

1. **替换 CCSwitch → codex-relay**
   ```bash
   pip install codex-relay
   codex-relay --upstream https://api.deepseek.com/v1 --api-key sk-xxx --port 4444
   ```

2. **config.toml 加入关键配置**
   ```toml
   wire_api = "responses"  # 明确指定协议
   [model_properties."deepseek-v4-flash"]  # 模型能力声明
   context_window = 262144
   supports_parallel_tool_calls = true
   ```

3. **PERSONA 从"前置"改为"追加"**
   - 旧：PERSONA + Codex 指令 → DeepSeek 先看到身份
   - 新：Codex 指令 + PERSONA → DeepSeek 先处理任务

### 验证
```bash
codex doctor | grep -E "wire_api|model_properties|reachability"
```

---

## 问题 2：Codex Desktop 启动时要求 API Key

### 症状
Desktop 启动后弹出 API Key 输入框，即使 config.toml 已配置。

### 根因
Desktop 从 Windows GUI 启动时不继承终端环境变量。`OPENAI_API_KEY` 未在 auth.json 中持久化。

### 修复
```bash
echo $OPENAI_API_KEY | codex login --with-api-key
# 创建 ~/.codex/auth.json，Desktop 启动时直接读取
```

---

## 问题 3：Codex Desktop 崩溃 (code=3221225477)

### 症状
```
An error has occurred
Codex crashed with the following error:
  (code=3221225477, signal=null)
Unknown model deepseek-v4-flash is used.
```

### 根因
Codex Desktop 有模型名白名单，不识别 `deepseek-v4-flash`。3221225477 = STATUS_ACCESS_VIOLATION (Windows segfault)。

### 修复
1. 修改 codex-relay 强制覆盖模型名：
   ```javascript
   // index.js line 96
   const chatBody = { model: MODEL, messages, stream };
   // 使用 .env 中配置的 MODEL，忽略 Codex 发送的模型名
   ```
2. config.toml 使用 Codex 识别的模型名（如 `gpt-4.1`），由代理层强制替换

> **最终方案：** 使用 codex-relay 替代 CCSwitch 后，此问题自动解决。codex-relay 正确暴露 deepseek-v4-flash 模型给 Codex。

---

## 问题 4：Codex 无法执行命令 / 写文件 / 访问网络

### 症状
```
🔧 执行命令 ❌ 被策略拦截
📂 写入文件 ❌ 受限制 (沙箱 read-only)
🌐 网络访问 ❌ 受限制
```

### 根因
`codex doctor` 显示 `filesystem: restricted, network: restricted`。

config.toml 缺少 `sandbox_mode` 设置，默认使用严格沙箱。

### 修复
```toml
# 之前（错误）
sandbox_permissions = ["disk-full-read-access"]

# 之后（正确）
sandbox_mode = "danger-full-access"
```

验证：
```bash
codex doctor | grep sandbox
# 预期: unrestricted fs + enabled network · approval Never
```

---

## 问题 5：codex-relay 进程频繁挂掉

### 症状
`curl http://127.0.0.1:4444/v1/models` 返回 Connection Refused。

netstat 显示端口关闭，但之前正常运行。

### 根因
bash `nohup & disown` 在 Windows 上不可靠。bash 会话结束后子进程被清理。

### 修复
1. 将 codex-relay 加入 Guardian v5.1 服务列表
2. 用 `subprocess.Popen` + `DETACHED` + `CREATE_NO_WINDOW` 标志启动
3. Guardian 每 15 秒检查端口，挂掉自动拉起

```python
# guardian_unified_v5.py
SERVICES = {
    "codex-relay": {"port": 4444, "check_only": True, "health_url": None},
}

def start_codex_relay():
    env = os.environ.copy()
    env["CODEX_RELAY_UPSTREAM"] = "https://api.deepseek.com/v1"
    env["CODEX_RELAY_API_KEY"] = "sk-xxx"
    env["CODEX_RELAY_PORT"] = "4444"
    subprocess.Popen(
        [CODEX_RELAY_EXE], env=env,
        creationflags=CREATE_NO_WINDOW | DETACHED,
    )
```

---

## 诊断速查

```bash
# 1. 全面诊断
codex doctor

# 2. 检查代理运行
curl http://127.0.0.1:4444/v1/models

# 3. 检查守护状态
cat D:\Hermes\.guardian_heartbeat

# 4. 查看所有服务
netstat -ano | grep -E "4444|8642|11434|18789"
```

## 终极修复检查清单

- [ ] codex-relay (非 CCSwitch) 运行在 :4444
- [ ] `wire_api = "responses"` 在 config.toml 中
- [ ] `model_properties` 定义了 context_window 和 tool 支持
- [ ] `sandbox_mode = "danger-full-access"`
- [ ] `codex doctor` 全绿 (13 ok · 0 fail)
- [ ] codex-relay 在 Guardian 中守护
- [ ] `auth.json` 已创建
- [ ] 已安装 Playwright (`npx playwright install chromium`)
