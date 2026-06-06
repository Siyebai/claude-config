# /project:todo — Todo→特性工作流

## 用法
`/project:todo [--isolate] <todo-text-or-file>`

## 参数
| 参数 | 说明 |
|------|------|
| `--isolate` | 在独立git worktree中实现（不影响当前工作区） |
| 无 `--isolate` | 在当前分支直接实现 |

## 工作流
1. 解析TODO → 拆分为可执行任务
2. 实现（分支内或worktree隔离）
3. 测试 → 验证 → 报告
