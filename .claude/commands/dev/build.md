# /dev:build — 特性构建

## 用法
`/dev:build [--strategy incremental|parallel] <description>`

## 参数
| 参数 | 说明 | 默认 |
|------|------|------|
| `--strategy incremental` | 增量构建：分步实现，每步验证 | incremental |
| `--strategy parallel` | 并行构建：多Agent并发，dep分批 | — |

## 使用场景
- **incremental**: 复杂特性，需要逐步构建+每步验证
- **parallel**: 独立模块可并行实现的特性

## 工作流
1. 分析需求 → 拆分子任务
2. 按策略执行（增量: 逐步Agent / 并行: Workflow多Agent）
3. 每步验证通过后继续
4. 最终整合测试
