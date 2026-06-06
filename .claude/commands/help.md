# /help — 任务→命令映射

## 用法
`/help <关键词>` — 查找对应命令/技能

## 映射表

| 你想做什么 | 用这个 |
|-----------|--------|
| 审查代码 / review | `/review` |
| 调试bug / 测试失败 | Skill("debug") |
| 安全检查 / 密钥管理 | Skill("security-review") 或 `/security:security-audit` |
| 项目审视 / 全景 | Skill("project-vision") |
| 验证完成 / 确认 | Skill("verify") |
| 执行shell命令 | Skill("shell") |
| Git操作 / 分支 / rebase | Skill("git") |
| 架构设计 / 方案 | Agent({subagent_type: "architect"}) |
| 代码探索 / 理解流程 | Agent({subagent_type: "code-explorer"}) |
| 构建错误 / 类型错误 | Agent({subagent_type: "build-error-resolver"}) |
| 紧急问题 / 生产挂了 | Agent({subagent_type: "triage"}) |
| 写PR | `/pr` |
| 写commit | `/commit` |
| 写计划 | `/plan` |
| 测试覆盖 | `/test-coverage` |
| 写测试 | `/test:write-tests` |
| 特性构建 | `/dev:build` |
| 重构代码 | `/dev:refactor-code` |
| 解释代码 | `/dev:explain-code` |
| 创建checkpoint | `/checkpoint` |
| 会话管理 | `/session` |
| 更新文档 | `/update-docs` |
| 综合审计 | `/audit` |
