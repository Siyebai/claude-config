# Code Review

## When to Review

**强制触发**: 写/改代码后、提交前、安全敏感代码变更、架构变更、合并 PR 前。

## Review Checklist

- [ ] 可读性好，命名清晰
- [ ] 函数聚焦 (<50行)
- [ ] 文件内聚 (<800行)
- [ ] 无深层嵌套 (>4层)
- [ ] 错误处理完整
- [ ] 无硬编码密钥
- [ ] 新功能有测试，覆盖率 ≥80%

## Security Review Triggers

**立即用 security-reviewer agent**：认证/授权、用户输入、数据库查询、文件操作、外部API、加密、支付

## Severity

| Level | Meaning | Action |
|-------|---------|--------|
| CRITICAL | 安全漏洞或数据丢失 | BLOCK |
| HIGH | Bug 或重大质量 | WARN |
| MEDIUM | 可维护性 | INFO |
| LOW | 风格建议 | NOTE |

## Quality Gate

- 代码修改 → 自检 + code-reviewer
- 文件写入 → 确认文件存在、大小合理
- 外部操作 → 确认操作成功

## 置信度评分

| 等级 | 阈值 | 行动 |
|------|------|------|
| 高 | ≥0.8 | 直接执行 |
| 中 | 0.5-0.8 | 执行但标注不确定 |
| 低 | <0.5 | 先研究确认 |

触发词: "我确信"/"肯定是"→高; "可能"/"也许"→中; "不确定"→低

## Approval

- Approve: 无 CRITICAL/HIGH
- Warning: 仅有 HIGH
- Block: 有 CRITICAL
