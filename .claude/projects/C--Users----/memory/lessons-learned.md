---
name: lessons-learned
description: 错误记录 — 根因+修复，不再重复犯错
metadata: 
  node_type: memory
  type: reference
  originSessionId: b2b31d18-cd53-4118-bc4e-06c31dd60516
---

### 1. 权限弹窗 → bypassPermissions 缺失 → settings.json 加 defaultMode
### 2. 新会话失忆 → 无 CLAUDE.md + 记忆极简 → CLAUDE.md + daily + MEMORY.md
### 3. Token 硬编码 → 快速实现偷懒 → 轮换 + 环境变量；代码审查检查密钥
### 4. settings.json schema → 用 accept-all 无效 → 改用 bypassPermissions；先查 schema
### 5. Codex 配置 key 错误 → api.base_url 不生效 → 正确 key: openai_base_url；先查 codex doctor
### 6. WS 消息体取错字段 → Codex WS 顶层 vs Claude Code 嵌套 → body = msg.response || msg
### 7. tool_calls 消息断裂 → 空文本 tool_calls 被丢弃 → 条件含 tool_calls；保证链完整
### 8. previous_response_id 未处理 → tool 成孤儿消息 → responseCache + injectPreviousResponse()
### 9. Codex TOML 权限格式 → [permissions] section 无效 → 顶层 approval_policy="never"
### 10. Win11 Home 沙箱 1344 → 缺安全令牌 API → 删除 [windows] section；Home 版无沙箱支持
### 11. GitHub push 被 GFW 拦截 → HTTPS/SSH 都堵 → REST API (api.github.com) + base64 上传
### 12. Python GBK 编码 → Windows 默认 GBK → PYTHONIOENCODING=utf-8 + chcp 65001
### 13. Codex 沙箱拦 bash → Codex Desktop 只认 PowerShell → PERSONA.md 明确用 PowerShell
### 14. 知识库路径不存在 → novels/ zhihu/ 未验证 → 全部路径实测验证后更新 PERSONA.md
### 15. shell grep 误判 YAML 质量 → `description: >` 多行被截断显示为空 → 用 YAML parser 而非文本提取；Claude Code 正确解析所有多行语法
### 16. 记忆文件分裂增殖 → 每次系统升级创建独立文档，7个文件互相交叉引用、内容大量重复 → 定期7合1整合；≥5个同主题文件必须触发合并；保留详细参考但不放入主索引
