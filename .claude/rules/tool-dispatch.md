---
name: tool-dispatch
description: 完整技能调度系统 — 任务到来时自动匹配并调用正确的工具/技能
---

# 工具调度协议 v3.0（总纲）

> 详细索引：`.claude/SKILL-INDEX.md`（265技能全表）
> 优先级：紧急 > 设计/前端 > 开发/架构 > Git/Shell > 通用

---

## 🔴 紧急问题

| 触发词 | 调用 |
|--------|------|
| `挂了` `502` `崩溃` `紧急` `宕机` `hotfix` `incident` `prod down` `on-fire` | `triage agent` |

## 🐛 Bug/调试

| 触发词 | 调用 |
|--------|------|
| `bug` `报错` `不通过` `失败` `异常` `错误` `出错` | `debug` skill |
| `Agent行为异常` `调试Agent` `introspect` | `agent-introspection-debugging` skill |

## 🎨 UI/前端/设计 — 自动技能组合

| 触发词 | 技能组合 |
|--------|---------|
| `做页面` `写UI` `设计` `布局` `前端` `样式` | `design-taste-frontend` + `react-patterns` + `motion-ui` |
| `高端` `premium` `精品` `奢华` `品牌` | `high-end-visual-design` + `brandkit` |
| `极简` `简洁` `clean` `modern` | `minimalist-ui` |
| `动效` `动画` `过渡` `framer` `transition` | `motion-patterns` + `motion-advanced` |
| `改UI` `翻新` `重设计` `改造页面` | `redesign-existing-projects` + `frontend-a11y` |
| `审美` `好看` `精致` `品味` | `stitch-design-taste` |
| `手感` `交互` `UX` `体验` `好用的` | `make-interfaces-feel-better` |
| `React` `组件` `hooks` `状态` | `react-patterns` + `react-performance` |
| `无障碍` `a11y` `WCAG` `屏幕阅读器` | `frontend-a11y` |

## 🔒 安全

| 触发词 | 调用 |
|--------|------|
| `安全` `认证` `密钥` `XSS` `SQL注入` `OWASP` `渗透` | `security-review` + `security-scan` |
| `漏洞` `CVE` `审计` `风险` | `security-bounty-hunter` + `coding-standards` |

## 🏗️ 架构/系统

| 触发词 | 调用 |
|--------|------|
| `架构` `重构方案` `技术选型` `高可用` `扩展` `系统设计` | `architect agent` + `architecture-decision-records` |
| `Agent系统` `Agent架构` `Agent框架` | `agent-architecture-audit` + `autonomous-agent-harness` |
| `设计系统` `设计Token` `组件库` | `design-system` skill |
| `API设计` `接口设计` `REST` | `api-design` skill |

## 📋 代码审查

| 触发词 | 调用 |
|--------|------|
| `review` `审查` `PR` `code review` | 小改动→`Grep/Read` · 大改动→`/review` |
| `代码质量` `编码规范` `合规` | `coding-standards` skill |

## 🚀 构建/部署

| 触发词 | 调用 |
|--------|------|
| `构建失败` `类型错误` `TypeScript` `编译` `tsc` `build error` | `build-error-resolver agent` |
| `部署` `发布` `CI/CD` `docker` | `deployment-patterns` + `docker-patterns` |
| `Next.js` `Turbopack` `构建配置` | `nextjs-turbopack` skill |

## 🔍 探索/分析

| 触发词 | 调用 |
|--------|------|
| `代码是做什么` `理解代码` `流程` `数据流` `explore` `分析` | `code-explorer agent` |
| `项目结构` `全景` `项目概览` `扫描项目` `审视` | `project-vision` skill |
| `接手项目` `代码库` `入职` `入门` | `codebase-onboarding` + `code-tour` |

## 📊 性能/成本

| 触发词 | 调用 |
|--------|------|
| `性能优化` `慢` `卡顿` `加载慢` | `react-performance` + `benchmark` |
| `Token消耗` `成本` `API费用` `省钱` | `cost-tracking` + `token-budget-advisor` |
| `上下文超长` `context` `token超限` | `strategic-compact` + `context-budget` |

## 🔧 开发任务

| 触发词 | 调用 |
|--------|------|
| `实现` `添加` `修改` `优化` `重构` `写代码` `开发` | 直接 `Read/Write/Edit/Bash/Grep` + 相关技能辅助 |
| `TDD` `测试驱动` `先写测试` | `tdd-workflow` skill |
| `测试` `E2E` `集成测试` `单元测试` | `e2e-testing` + `browser-qa` |

## ✅ 验证

| 触发词 | 调用 |
|--------|------|
| `验证` `确认` `检测` `测试通过` `verify` `check` `确保` | `verify` skill + `verification-loop` |

## 📊 Git

| 触发词 | 调用 |
|--------|------|
| `commit` `push` `rebase` `merge` `分支` `git` `cherry-pick` `bisect` | `git` skill |

## 📝 Shell

| 触发词 | 调用 |
|--------|------|
| `执行命令` `shell` `终端` `运行` `启动` `命令行` `ps` `kill` | `shell` skill |

## 📄 文档处理

| 触发词 | 调用 |
|--------|------|
| `转Markdown` `PDF转` `Word转` `文档转换` | `markitdown <文件> -o <输出>` |
| `写文档` `更新README` `文档` | `docs:doc-api` / 直接读写 |

---

## 组合调用规则

当任务涉及多个领域时，自动组合相关技能：

```
"帮我做一个新页面"
  → design-taste-frontend + react-patterns + motion-ui + coding-standards
  → 输出: 审美指导 + React最佳实践 + 动效方案 + 代码规范

"审计当前UI并改进"
  → redesign-existing-projects + frontend-a11y + high-end-visual-design
  → 输出: 现有代码风格审计 + 无障碍修复 + 视觉升级方案

"安全审查"
  → security-review + security-scan + coding-standards
  → 输出: 安全漏洞报告 + 运行时扫描结果 + 编码违规检查
```

---

## 🎬 视频生成 — HyperFrames

| 触发词 | 调用 |
|--------|------|
| `做视频` `生成视频` `宣传片` `渲染` `MP4` | `hyperframes` + `hyperframes-cli` |
| `视频动效` `GSAP` `动画` `转场` | `gsap` + `animejs` + `css-animations` |
| `网页转视频` `产品演示` | `website-to-hyperframes` |
| `Three.js 3D` `3D场景` `WebGL` | `three` + `typegpu` |
| `Lottie 动画` | `lottie` |
| `从 Remotion 迁移` | `remotion-to-hyperframes` |

### 使用方式

```bash
# 技能调用
hyperframes skill

# 手动 CLI
npx hyperframes init my-video
npx hyperframes preview
npx hyperframes render
```

---

## 无匹配时的默认行为

```
通用开发 → Read/Write/Edit/Bash/Grep（直接执行）
信息查询 → WebSearch/WebFetch
复杂多步 → Agent/Workflow
```

---

## 快速参考

```
技能索引: .claude/SKILL-INDEX.md
技能目录: ~/.agents/skills/（265个）
安装方式: npx skills add <github-url>
测试工具: markitdown（文档转Markdown）
```
