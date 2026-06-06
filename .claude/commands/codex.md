# /codex — 与Codex（夜不悔）协同工作

## 工作流

两种通信方式：

### 方式A：Bash 直呼（推荐）
```bash
echo "<任务描述>" | codex exec -m "deepseek-v4-flash" 
```

由 Agent Hub 共享知识库中转：
```
我 ──→ agent-hub/codex/inbox/ 写任务
                    ↓
Codex ─→ 读取 → 执行 → 写回 agent-hub/codex/outbox/
                    ↓
我 ──→ 读取结果
```

### 方式B：文件传递（异步、持久）
```
# 我交办任务
echo "任务内容" > .claude/agent-hub/codex/tasks/$(date +%s).md

# Codex 完成后写回
cat .claude/agent-hub/codex/results/latest.md
```

### 方式C：MCP Server（工具注册）
已在 `.claude/mcp.json` 注册 `codex-exec` 工具。
重启后可作为 MCP 工具直接调用。

## 适用场景
| 场景 | 方式 | 说明 |
|:-----|:-----|:------|
| 快速问答 | A/Bash | `echo "xxx" \| codex exec -m "deepseek-v4-flash"` |
| 前端任务交办 | B/文件 | 写任务到 agent-hub，Codex 读取执行 |
| 架构同步 | B/文件 | 设计文档写入 agent-hub，双方共享 |
| 嵌入工作流 | C/MCP | 作为工具链的一环自动调用 |

## 注意事项
- Codex 使用 MiniMax M3 模型作为主力，通过 CCSwitch 代理
- 指定 `-m deepseek-v4-flash` 使用与当前系统一致的模型
- agent-hub 是共享工作区，任务完成后清理 inbox
