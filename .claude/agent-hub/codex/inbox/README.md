# Codex 任务通道

## 流程
```
我(Claude Code) ─→ 写任务到 inbox/
        ↓
你(用户) 审核 → 确认 → 转发给 Codex(夜不悔) 执行
        ↓
Codex 执行完毕 → 写结果到 done/
        ↓
我读结果 → 继续推进
```

## 任务文件格式
每个任务一个 `.md` 文件，命名: `YYYYMMDD-HHMM-简述.md`

## 当前任务
- `inbox/` — 待你审核的任务
- `done/` — Codex 已完成的任务（含结果）
