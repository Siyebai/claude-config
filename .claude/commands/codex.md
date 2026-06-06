# /codex — 与Codex（夜不悔）协同工作

## 工作流

```
我(Claude Code)  ──→  写任务到 inbox/  ──→  你审核
                                            ↓
                                    你转发给 Codex 执行
                                            ↓
                                   Codex 写结果到 done/
                                            ↓
                                    我读取结果继续推进
```

## 任务通道

| 目录 | 说明 |
|:-----|:------|
| `agent-hub/codex/inbox/` | 我写的待办任务，你审核后转发 |
| `agent-hub/codex/done/` | Codex 完成归档，我读取结果 |

## 任务文件格式
```
# 任务：xxx
优先级: P0/P1/P2
交给: 夜不悔

## 背景
...

## 需求
1. ...
2. ...

## 产出要求
- 文件路径
- 验收标准
```

## 转发给 Codex
审核后，在 Codex 终端（或命令行）执行：
```bash
codex exec -m "deepseek-v4-flash" < agent-hub/codex/inbox/任务文件.md
```

或直接拖进 Codex 对话窗口。
