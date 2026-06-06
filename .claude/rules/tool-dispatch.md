---
name: tool-dispatch
description: 任务分发规则 — 确保接收到任务时调用正确的工具/技能/代理
---

# 工具调度协议

## 核心原则
1. **前置匹配**: 用户任务到来时，先扫描关键词匹配下方规则
2. **最重优先**: 权重高的匹配优先（紧急 > bug > 安全 > ...）
3. **一次调度**: 选中后不再切换，除非用户明确要求换

## 任务→工具映射

### 🔴 紧急/生产问题 → triage agent
**关键词**: `挂了` `502` `崩溃` `紧急` `宕机` `hotfix` `incident` `prod down` `on-fire`
**调用**: `Agent({subagent_type: "triage", prompt: "<描述>"})`

### 🐛 Bug/测试失败 → debug skill
**关键词**: `bug` `报错` `不通过` `失败` `异常` `test fail` `错误` `出错`
**调用**: `Skill("debug")`

### 🔒 安全相关 → security-review skill
**关键词**: `安全` `认证` `密钥` `XSS` `SQL注入` `权限` `token` `加密` `OWASP`
**调用**: `Skill("security-review")`

### 📋 代码审查 → review command
**关键词**: `review` `审查` `review代码` `PR检查` `code review` `检查代码`
**调用**: 小改动→直接Read/Grep · 大改动→`/review`

### 🏗️ 架构设计 → architect agent
**关键词**: `架构` `设计` `重构方案` `技术选型` `高可用` `扩展` `系统设计`
**调用**: `Agent({subagent_type: "architect"})`

### 🔍 代码探索 → code-explorer agent
**关键词**: `代码是做什么` `流程` `追踪` `数据流` `explore` `理解代码` `分析`
**调用**: `Agent({subagent_type: "code-explorer"})`

### 🚀 构建/类型错误 → build-error-resolver agent
**关键词**: `构建失败` `类型错误` `TypeScript` `编译` `tsc` `build error`
**调用**: `Agent({subagent_type: "build-error-resolver"})`

### 🔧 开发任务 → 直接使用工具
**关键词**: `实现` `添加` `修改` `优化` `重构` `写代码` `开发`
**调用**: `Read` + `Write`/`Edit` + `Bash` + `Grep` — 直接执行

### ✅ 验证 → verify skill
**关键词**: `验证` `确认` `检测` `测试通过` `verify` `check` `确保` `确认完成`
**调用**: `Skill("verify")`

### 📂 项目审视 → project-vision skill
**关键词**: `项目结构` `审视` `全景` `项目概览` `VTE` `扫描项目` `目录`
**调用**: `Skill("project-vision")`

### 📊 Git操作 → git skill
**关键词**: `commit` `push` `rebase` `merge` `分支` `git` `cherry-pick` `bisect`
**调用**: `Skill("git")`

### 📝 Shell命令 → shell skill
**关键词**: `执行命令` `shell` `终端` `运行` `启动` `命令行` `ps` `kill`
**调用**: `Skill("shell")`

## 无匹配时的默认行为
- 通用开发: 直接 Read/Write/Edit/Bash/Grep
- 信息查询: WebSearch/WebFetch
- 复杂多步: Agent/Workflow
