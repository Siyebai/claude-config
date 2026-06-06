# /review — 统一代码审查

## 用法
`/review [--tier quick|default|full|security] [--target <path>]`

## 参数
| 参数 | 说明 | 默认 |
|------|------|------|
| `--tier quick` | 快速检查：lint + 类型 + 明显缺陷 | quick (纯local) |
| `--tier default` | 标准审查：正确性 + 性能 + 安全 | default |
| `--tier full` | 全量审查：正确性 + 安全 + 设计 + QA | — |
| `--tier security` | 安全专项：OWASP Top 10 + 密钥泄漏 + 注入 | — |
| `--target <path>` | 指定文件/目录审查 | 当前diff |

## 执行
1. **quick**: `git diff` → Grep搜索常见反模式 → 报告
2. **default**: Agent(code-reviewer) → 读diff → 逐文件审查
3. **full**: Workflow( 审查 + 安全审计 + 设计评审 + QA ) → 综合报告
4. **security**: Skill(security-review) + Agent(security-reviewer) 并行
