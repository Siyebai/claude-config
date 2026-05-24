# Claude Code 工具索引 — 448 Skills / 263 Commands / 89 Agents

> 2026-05-22 精简版。来源: ECC, superskills, caveman, claude-code-showcase, borkweb, CCSuite, baoyu, julianobarbosa, oh-story, story-skills, novel-creator, 等 12 个市场。

## 快速导航

| 你想做什么 | 用这个 |
|------------|--------|
| 审查代码 | `code-reviewer` agent 或 `/code-review` |
| 写测试 | `tdd-workflow` skill, `tdd-guide` agent |
| 提交代码 | `writing-commits` skill, `/commit` (内置) |
| 安全审查 | `security-review` skill, `security-reviewer` agent |
| Debug | `systematic-debugging` skill |
| API 设计 | `api-design` skill |
| 数据库 | `db-optimize` skill, `database-reviewer` agent |
| 性能优化 | `perf-profile` skill |
| 写小说 | `story-long-write` + `novel-creator` + `chapter-writing` |
| 内容创作 | `baoyu-*` 系列 (21 skills) |
| Azure/K8s | `argocd`, `azure-devops`, `k8s-clusters` |
| Agent 开发 | `agentic-engineering`, `agent-harness-construction` |

---

## Tier 1: 🔴 DAILY — 每次会话必用

### 代码质量 (7 skills)
| Skill | Size | 说明 |
|-------|------|------|
| `code-reviewer` | - | **Agent**: 结构化代码审查 (安全/逻辑/边界/性能) |
| `reviewing-code` | 1.7K | 替代审查流程 |
| `minimalist-review` | - | 小改动精简审查 |
| `caveman-review` | - | Token 高效审查 (~65% 节省) |
| `security-review` | - | 深度安全审查 + CVE 模式匹配 |
| `coding-standards` | - | 命名/可读性/不可变性基线 |
| `simplify` | - | 3 并行 agent 代码简化 |

### Git & 提交 (4 skills)
| Skill | Size | 说明 |
|-------|------|------|
| `writing-commits` | 6.9K | Conventional Commits 消息生成 |
| `caveman-commit` | 2.5K | Token 压缩提交流程 |
| `pre-commit` | - | Pre-commit hook 质量检查 |
| `git` | - | 完整 Git 操作 (含 worktree/branch/merge) |

### Agent 工程 (你的核心领域 — 8 skills)
| Skill | Size | 说明 |
|-------|------|------|
| `agentic-engineering` | 1.8K | Eval-first 执行 / 任务分解 / 成本路由 |
| `agentic-os` | - | 构建持久多 Agent 操作系统 |
| `agent-architecture-audit` | - | 12 层 Agent 栈诊断 |
| `agent-harness-construction` | 2.1K | 设计 AI Agent 动作空间 |
| `agent-introspection-debugging` | - | Agent 故障结构化自调试 |
| `autonomous-agent-harness` | - | 将 Claude 转换为自主 Agent 系统 |
| `autonomous-loops` | - | 自主循环模式 |
| `agent-eval` | - | Agent 对比基准测试 |

---

## Tier 2: 🟡 FREQUENT — 按任务触发

### 开发流程 (12 skills)
| Skill | 说明 |
|-------|------|
| `tdd-workflow` | RED-GREEN-REFACTOR 循环 (ECC 详细版) |
| `systematic-debugging` | 结构化调试方法论 |
| `debug` | 交互式调试流程 |
| `specify` | 规格驱动开发 |
| `analyze` | 跨制品一致性分析 |
| `clarify` | 识别规格中未明确区域 |
| `checklist` | 生成功能特定检查清单 |
| `blueprint` | 架构蓝图生成 |
| `finish-branch` | 分支完成流程 |
| `codebase-onboarding` | 从陌生代码库生成入门指南 |
| `error-handling` | 通用错误处理模式 |
| `prototype` | 快速原型搭建 |

### API & 后端 (7 skills)
| Skill | 说明 |
|-------|------|
| `api-design` | REST API 模式: 命名/分页/错误/版本 |
| `api-connector-builder` | 构建新 API 连接器/Provider |
| `graphql-schema` | GraphQL Schema 设计模式 |
| `backend-patterns` | Node.js/Express/Next.js 后端模式 |
| `fastapi-patterns` | FastAPI 最佳实践 |
| `mcp-server-patterns` | MCP Server 构建模式 |
| `database-migrations` | Migration 安全审查 |

### 数据库 (7 skills)
| Skill | 说明 |
|-------|------|
| `db-optimize` | 数据库查询优化 |
| `dbmap` | 数据库 Schema 映射 + 自动更新 |
| `postgres-patterns` | PostgreSQL 最佳实践 |
| `clickhouse-io` | ClickHouse 分析模式 |
| `redis-patterns` | Redis 缓存模式 |
| `mysql-patterns` | MySQL 模式 |
| `prisma-patterns` | Prisma ORM 模式 |

### 安全 (8 skills)
| Skill | 说明 |
|-------|------|
| `security-review` | 深度安全审查 (ECC) |
| `review-security` | 模式匹配安全审查 |
| `security-scan` | 自动化安全扫描 |
| `pentest` | 渗透测试流程 |
| `defense` | 防御性安全模式 |
| `container-security` | 容器镜像扫描 + Dockerfile 加固 |
| `security-bounty-hunter` | Bug Bounty 流程 |
| `safety-guard` | AI 输出安全守卫 |

### 性能 (5 skills)
| Skill | 说明 |
|-------|------|
| `benchmark` | 测量基线 / 检测回归 |
| `perf-profile` | 性能分析 |
| `cache-strategy` | 缓存策略模式 |
| `prompt-optimizer` | LLM Prompt 成本/延迟优化 |
| `cost-tracking` / `cost-aware-llm-pipeline` | LLM 成本监控 |

### 测试 (7 skills)
| Skill | 说明 |
|-------|------|
| `tdd-workflow` | TDD 全流程 (80%+ 覆盖率) |
| `testing-patterns` | 通用测试模式 |
| `e2e-testing` | E2E 测试框架 |
| `playwright` | Playwright 浏览器测试 |
| `test-engineer` | 自动测试生成 + 覆盖率 |
| `fuzz` | Fuzz 测试 |
| `ai-regression-testing` | AI 代码沙盒测试 |

---

## Tier 3: 🔵 DOMAIN — 按项目/领域

### 📝 小说创作系统 (19 skills — 4 套体系融合)

**oh-story (网文全流程)**
| Skill | 说明 |
|-------|------|
| `story-setup` | 小说项目初始化配置 |
| `story-long-scan` | 长篇扫榜 (起点/番茄/晋江) |
| `story-long-analyze` | 拆解爆款长篇: 套路/钩子/爽点 |
| `story-long-write` | 长篇章节正文生成 |
| `story-short-scan` | 短篇扫榜 (知乎盐言/七猫, 支持 MCP 实时数据) |
| `story-short-analyze` | 短篇拆文分析 |
| `story-short-write` | 短篇正文生成 (含知乎盐言特化配置) |
| `story-deslop` | 三遍法去 AI 味 |
| `story-review` | 综合审稿: 一致性/节奏/爽点密度 (zhihu rubric: 35 指标五维加权) |
| `zhihu-monetization` | 📘 知乎短篇变现管线: 热点→选题→拆文→创作→审查→去AI味→发布 (7 阶段) |
| `story-cover` | 小说封面生成 |
| `story-import` | 导入已有小说内容 |
| `story-init` | 初始化: 类型/基调/视角/读者 |
| `story` | 小说创作总入口 |

**story-skills (Save the Cat + 角色)**
| Skill | 说明 |
|-------|------|
| `plot-structure` | Save the Cat 15 节拍 / 三幕式 / 英雄之旅 |
| `character-management` | 角色卡: want/need/flaw/arc + 关系图 |
| `worldbuilding` | 世界观: 物理/社会/隐喻 + 魔法/科技体系 |
| `chapter-writing` | 逐章写作: 概要→正文, POV + 节奏控制 |

**novel-creator (中文长篇 300 万字)**
| Skill | 说明 |
|-------|------|
| `novel-creator` | `/脑洞建图`→`/一键开书`→`/继续写`→`/修复本章`→`/改纲续写` |
| `novel-control-station` | 写作控制台: Smart State + 质量门禁 |

### 📱 内容创作 — baoyu 套件 (21 skills)
| Skill | 说明 |
|-------|------|
| `baoyu-diagram` | SVG 架构图/流程图/时序图/思维导图 |
| `baoyu-slide-deck` | 幻灯片 (16 种风格) |
| `baoyu-infographic` | 专业信息图 (21×22 风格组合) |
| `baoyu-cover-image` | 文章封面图 (5D 定制) |
| `baoyu-comic` | 知识漫画 |
| `baoyu-image-cards` | 小红书/微信图文卡片 |
| `baoyu-article-illustrator` | 文章配图自动生成 |
| `baoyu-image-gen` / `baoyu-imagine` | AI 图片生成 (多模型) |
| `baoyu-xhs-images` | 小红书专用图片 |
| `baoyu-translate` | 三模式翻译 (快速/标准/精细) |
| `baoyu-post-to-x` | X/Twitter 发布 |
| `baoyu-post-to-wechat` | 微信公众号发布 |
| `baoyu-post-to-weibo` | 微博发布 |
| `baoyu-url-to-markdown` | 任意 URL → Markdown |
| `baoyu-markdown-to-html` | MD → 微信兼容 HTML |
| `baoyu-format-markdown` | Markdown 格式化 |
| `baoyu-youtube-transcript` | YouTube 字幕下载 |
| `baoyu-wechat-summary` | 微信群聊精华摘要 |
| `baoyu-compress-image` | 图片压缩 (WebP/PNG) |
| `baoyu-danger-x-to-markdown` | X 推文 → Markdown |
| `baoyu-danger-gemini-web` | Gemini Web 抓取 |

### ☁️ Azure & 云基础设施 (10 skills)
| Skill | 说明 |
|-------|------|
| `az-aks-agent` | AI 驱动 AKS 故障排除 |
| `azure-devops` | Azure DevOps REST API |
| `azure-devops-wiki` | Azure DevOps Wiki 管理 |
| `azure-ad-sso` | Azure AD OAuth2/OIDC for K8s |
| `azure-finops` | FinOps 预留/成本分析 |
| `azure-cost-management-app` | 成本管理应用 |
| `alz-accelerator` | Azure Landing Zones 部署 |
| `aztfexport` | Azure 资源 → Terraform |
| `azure-landing-zone-checklist` | Landing Zone 检查清单 |
| `devops-network-calculator-for-azure` | Azure CIDR/VNet/子网规划 |

### ☸️ Kubernetes & GitOps (10 skills)
| Skill | 说明 |
|-------|------|
| `argocd` | ArgoCD CLI/REST — 完整 GitOps |
| `argocd-advanced` | ApplicationSet/Image Updater/集群 Bootstrap |
| `gitops-principles` | GitOps 模式与最佳实践 |
| `k8s-clusters` | K8s 集群管理 |
| `k8s-timezone-config` | K8s 时区配置 |
| `progressive-delivery` | 渐进式交付 (Canary/Blue-Green) |
| `knative` | Knative Serverless |
| `docker-patterns` | Docker 容器化模式 |
| `deployment-patterns` | 通用部署模式 |
| `external-dns` | External-DNS for K8s |

### 🏠 Homelab & 网络 (9 skills)
| Skill | 说明 |
|-------|------|
| `homelab-network-readiness` | 家庭网络就绪检查 |
| `homelab-network-setup` | 家庭网络搭建 |
| `homelab-pihole-dns` | Pi-hole DNS 配置 |
| `homelab-vlan-segmentation` | VLAN 网段划分 |
| `homelab-wireguard-vpn` | WireGuard VPN 搭建 |
| `network-bgp-diagnostics` | BGP 诊断 |
| `network-config-validation` | 网络配置验证 |
| `network-interface-health` | 网络接口健康检查 |
| `cloudflare-dns` / `cloudflare-manager` | Cloudflare DNS + Workers |

### 📊 监控 & 可观测性 (9 skills)
| Skill | 说明 |
|-------|------|
| `grafana` | Grafana 仪表板 |
| `prometheus` | Prometheus 监控 |
| `loki` | Loki 日志聚合 |
| `mimir` | Mimir 长期存储 |
| `tempo` | Tempo 分布式追踪 |
| `pyroscope` | Pyroscope 持续分析 |
| `opentelemetry` | OpenTelemetry 可观测性 |
| `sentry` | Sentry 错误追踪 |
| `robusta-dev` | Robusta K8s 告警 |

### 🔒 密码 & 密钥管理 (3 skills)
| Skill | 说明 |
|-------|------|
| `1password` | 1Password CLI 集成 |
| `vault-setup` | HashiCorp Vault 配置 |
| `keyvault-csi-driver` | Azure Key Vault CSI Driver |

### 📦 项目管理 & 协作 (15+ skills)
| Skill | 说明 |
|-------|------|
| `jira-integration` | Jira Issue 管理 |
| `linear-todo-sync` | Linear ↔ Todo 同步 |
| `github-ops` | GitHub Issues/PRs/Actions |
| `team-builder` | 团队结构设计 |
| `project-flow-ops` | 项目流程运营 |
| `spec-workflow:*` | 规格工作流 (6 commands) |
| `project:*` | 项目初始化/健康检查/里程碑 (11 commands) |
| `team:*` | 团队协作: 站会/冲刺/回顾/评审 (13 commands) |
| `sync:*` | 跨平台同步: Linear/GitHub/Issues (12 commands) |

---

## Tier 4: ⚪ RARE — 特殊场景

### 各语言生态系统
| 语言 | 模式/最佳实践 | 测试 | 安全 | TDD | 验证 |
|------|-------------|------|------|-----|------|
| Python | `python-patterns` + `python-design-patterns` + `python-anti-patterns` + `python-configuration` + `python-error-handling` + `python-infrastructure` + `python-resource-management` | `python-testing` | - | - | - |
| Go | `golang-patterns` | `golang-testing` | - | - | - |
| Rust | `rust-patterns` | `rust-testing` | - | - | - |
| Kotlin | `kotlin-patterns` + `kotlin-coroutines-flows` + `kotlin-exposed-patterns` + `kotlin-ktor-patterns` | `kotlin-testing` | - | - | - |
| Java | `springboot-patterns` + `quarkus-patterns` + `jpa-patterns` | - | `springboot-security` / `quarkus-security` | `springboot-tdd` / `quarkus-tdd` | `springboot-verification` / `quarkus-verification` |
| C++ | `cpp-coding-standards` | `cpp-testing` | - | - | - |
| C# | `dotnet-patterns` | `csharp-testing` | - | - | - |
| Swift | `swiftui-patterns` + `swift-concurrency-6-2` + `swift-actor-persistence` + `swift-protocol-di-testing` | - | - | - | - |
| Dart | `dart-flutter-patterns` | - | - | - | - |
| JS/TS | `frontend-patterns` + `react-ui-patterns` + `vite-patterns` + `nextjs-turbopack` + `nuxt4-patterns` + `nestjs-patterns` | - | - | - | - |
| PHP | `laravel-patterns` + `laravel-plugin-discovery` | - | `laravel-security` | `laravel-tdd` | `laravel-verification` |
| Perl | `perl-patterns` | `perl-testing` | `perl-security` | - | - |

### 框架专项
| 框架 | Skills |
|------|--------|
| Django | `django-patterns` `django-celery` `django-security` `django-tdd` `django-verification` |
| FastAPI | `fastapi-patterns` |
| Flask | (使用 `python-patterns` + `fastapi-patterns`) |
| Spring Boot | `springboot-patterns` `springboot-security` `springboot-tdd` `springboot-verification` |
| Quarkus | `quarkus-patterns` `quarkus-security` `quarkus-tdd` `quarkus-verification` |
| Laravel | `laravel-patterns` `laravel-security` `laravel-tdd` `laravel-verification` `laravel-plugin-discovery` |
| Svelte | `svelte:*` (16 commands: component/debug/test/storybook) |
| Next.js | `nextjs-turbopack` + `frontend-patterns` |
| Nuxt | `nuxt4-patterns` |
| Prisma | `prisma-patterns` |

### 科学/研究 (5 skills)
- `scientific-thinking-literature-review` — 文献综述
- `scientific-thinking-scholar-evaluation` — 学者影响力评估
- `scientific-db-pubmed-database` — PubMed 数据库
- `scientific-db-uspto-database` — USPTO 专利数据库
- `scientific-pkg-gget` — gget 生物信息包

### 医疗 (4 skills)
- `healthcare-cdss-patterns` — 临床决策支持系统
- `healthcare-emr-patterns` — 电子病历系统
- `healthcare-eval-harness` — 医疗评估框架
- `healthcare-phi-compliance` — PHI 合规 (HIPAA)

### 游戏/媒体/视频 (7 skills)
- `remotion-video-creation` — React 视频编程
- `manim-video` — 数学动画视频
- `video-editing` — 视频编辑
- `videodb` — 视频数据库
- `extract-video-frames` — 视频帧提取
- `fal-ai-media` — Fal.ai 媒体生成
- `blender-motion-state-inspection` — Blender 运动状态

### 商业/金融 (8 skills)
- `bigcommerce-api` — BigCommerce API
- `defi-amm-security` — DeFi AMM 安全审计
- `llm-trading-agent-security` — LLM 交易 Agent 安全
- `evm-token-decimals` — EVM 代币精度
- `pricing` — 定价策略
- `finance-billing-ops` — 财务计费
- `customer-billing-ops` — 客户计费
- `energy-procurement` — 能源采购

### DevOps/CI 工具链 (10+ skills)
- `defectdojo` — 安全漏洞管理
- `dependency-track` — 依赖追踪
- `senhasegura` — PAM 权限管理
- `zabbix-api` — Zabbix 监控 API
- `pre-commit` — Git Pre-commit Hooks
- `github-pages` — GitHub Pages 部署
- `mkdocs` — MkDocs 文档站
- `shellcheck` — Shell 脚本检查
- `configure-ecc` / `ecc-guide` / `ecc-tools-cost-audit` — ECC 配置
- `opensource-pipeline` — 开源发布流水线

### 效率工具 (15+ skills)
- `obsidian` + `obsidian-bases` + `obsidian-markdown` + `obsidian-nvim` + `obsidian-claude-integration` + `obsidian-vault-management`
- `neovim` `tmux` `iterm2` `direnv` `atuin` `zsh-path`
- `macos-cleaner` `macos-setup`
- `terminal-ops` `shell-prompt`
- `tldr` — 简化 man pages
- `justfile` — Just 命令运行器
- `uv` — Python 包管理器

---

## 🔧 Caveman Suite — Token 效率工具 (7 skills)

| Skill | 说明 |
|-------|------|
| `caveman` | 极简压缩模式 (~65-75% token 节省) |
| `caveman-review` | 压缩代码审查 |
| `caveman-commit` | 压缩提交流程 |
| `caveman-compress` | 内容压缩 |
| `caveman-stats` | Token 使用统计 |
| `caveman-help` | Caveman 帮助系统 |
| `cavecrew` | 多 Agent Caveman 编排 |

---

## 🤖 Agent 目录 (89 agents)

### 代码质量 (9 agents)
`code-reviewer` `code-auditor` `code-simplifier` `cpp-reviewer` `django-reviewer` `fastapi-reviewer` `flutter-reviewer` `go-reviewer` `rust-reviewer` `java-reviewer` `kotlin-reviewer` `swift-reviewer` `csharp-reviewer` `fsharp-reviewer` `typescript-reviewer` `python-reviewer` `database-reviewer`

### 安全 (3 agents)
`security-reviewer` `pr-test-analyzer` `silent-failure-hunter`

### 构建修复 (8 agents)
`build-error-resolver` `cpp-build-resolver` `dart-build-resolver` `django-build-resolver` `go-build-resolver` `java-build-resolver` `kotlin-build-resolver` `rust-build-resolver`

### 架构 & 设计 (4 agents)
`architect` `code-architect` `architecture-auditor` `project-architect`

### 测试 (4 agents)
`tdd-guide` `test-engineer` `e2e-runner` `pr-test-analyzer`

### 文档 & 探索 (4 agents)
`doc-updater` `docs-lookup` `code-explorer` `dependency-analyzer`

### 运维/部署 (2 agents)
`release-manager` `github-workflow`

### 性能 (2 agents)
`performance-auditor` `performance-optimizer`

### Meta & 工具 (8 agents)
`agent-organizer` `task-decomposer` `task-orchestrator` `task-commit-manager` `cavecrew-builder` `cavecrew-investigator` `cavecrew-reviewer` `refactor-cleaner`

### 领域专项 (10+ agents)
`a11y-architect` `azure-devops-specialist` `healthcare-reviewer` `mle-reviewer` `network-architect` `network-troubleshooter` `network-config-reviewer` `homelab-architect` `integrations-manager` `seo-specialist` `strategic-analyst` `triage`

### 特殊用途 (7 agents)
`chief-of-staff` `comment-analyzer` `conversation-analyzer` `gan-planner` `gan-generator` `gan-evaluator` `harness-optimizer`

---

## ⌨️ Commands 目录 (263 commands)

### 顶层入口 (常用)
| Command | 说明 |
|---------|------|
| `/code-review` | 代码审查 (→ code-reviewer agent) |
| `/full-review` | 完整审查 (深度, 多维度) |
| `/plan` | 实施计划 (→ planner agent) |
| `/status` | 项目状态报告 |
| `/commit` | 提交 (内置) |
| `/pr` | Pull Request 管理 |
| `/ticket` | Issue/Ticket 管理 |
| `/feature-dev` | 功能开发全流程 |
| `/checkpoint` | 会话检查点 |
| `/onboard` | 项目入门引导 |

### 命名空间树
| 空间 | 用途 | 数量 |
|------|------|------|
| `dev:` | 开发工具 (调试/重构/审查/分支清理) | ~20 |
| `test:` | 测试 (生成/覆盖/E2E/突变/负载) | ~10 |
| `deploy:` | 部署 (发布/回滚/CI/K8s/容器化) | ~8 |
| `security:` | 安全 (审计/加固/认证/依赖扫描) | ~4 |
| `performance:` | 性能 (审计/缓存/CDN/构建优化) | ~8 |
| `project:` | 项目管理 (初始化/健康检查/PAC/里程碑) | ~12 |
| `setup:` | 项目搭建 (数据库/API/环境/格式/监控) | ~10 |
| `docs:` | 文档 (架构/API/入门/迁移/排障) | ~6 |
| `team:` | 团队协作 (站会/冲刺/回顾/评审/工作量) | ~12 |
| `sync:` | 跨平台同步 (GitHub↔Linear↔Issues) | ~11 |
| `simulation:` | 模拟推演 (商业/决策树/数字孪生/市场) | ~8 |
| `semantic:` | 语义树 (节点构建/导入导出/切换/查看) | ~6 |
| `reasoning:` | 推理框架 (链验证/逻辑向量/多路径/共振) | ~5 |
| `boundary:` | 边界检测 (风险/热图/安全桥接/回退) | ~5 |
| `memory:` | 记忆管理 (检查点/压缩/合并/修剪/召回) | ~5 |
| `orchestration:` | 编排 (开始/恢复/同步/日志/报告/移除) | ~9 |
| `session:` | 会话 (交接/继续) | ~2 |
| `rust:` | Rust 生态 (审计/架构/Tauri) | ~12 |
| `svelte:` | Svelte 生态 (组件/调试/测试/Storybook) | ~16 |
| `skills:` | Skill 管理 (构建/打包/模板) | ~7 |
| `spec-workflow:` | 规格工作流 (并行任务/快速规格) | ~6 |
| `wfgy:` | WfGy 公式系统 | ~6 |
| `context:` | 上下文优化 | ~1 |
| `media:` | 媒体处理 | ~1 |

### 多 Agent 编排 (5 commands)
- `multi-plan` — 多 Agent 并行规划
- `multi-execute` — 多 Agent 并行执行
- `multi-workflow` — 通用多 Agent 工作流
- `multi-backend` — 后端专项编排
- `multi-frontend` — 前端专项编排

### PRP 工作流 (5 commands)
- `prp-plan` — PRP 规划 (14K, 详细)
- `prp-prd` — PRD 生成 (15K, 详细)
- `prp-implement` — 实现阶段
- `prp-pr` — PR 创建
- `prp-commit` — 提交管理

### Skill 管理 (5 commands)
- `skills-audit` — Skill 审计 (10K)
- `skills-refine` — Skill 精炼 (8K)
- `skills-suggest` — Skill 建议 (8K)
- `skill-create` — 创建新 Skill (5K)
- `skill-health` — Skill 健康检查 (4K)

### 学习/进化 (1 command)
- `learn-eval` — 学习评估 (5K, 替代已删除的 `learn`)

### 其他工具命令
- `instinct-export` / `instinct-import` / `instinct-status` — Instinct 管理
- `hookify-*` — Hook 配置
- `loop-start` / `loop-status` / `santa-loop` — 循环任务
- `model-route` — 模型路由
- `cost-report` — 成本报告
- `promote` / `prune` — 配置提升/修剪

---

## 🔗 关联索引

### 功能 → 应使用的工具链
| 场景 | 完整工具链 |
|------|-----------|
| **写新功能** | `planner` agent → `tdd-workflow` skill → `code-reviewer` agent → `writing-commits` skill |
| **Bug 修复** | `systematic-debugging` skill → fix → `tdd-workflow` → `code-reviewer` |
| **安全审计** | `security-reviewer` agent + `security-review` skill + `pentest` skill |
| **API 设计** | `api-design` skill → `fastapi-patterns` → `code-reviewer` |
| **数据库变更** | `database-migrations` skill → `db-optimize` → `database-reviewer` agent |
| **部署上线** | `deploy:prepare-release` → `deploy:ci-setup` → `release-manager` agent |
| **写小说** | `story-setup` → `plot-structure` → `chapter-writing` → `story-deslop` → `story-review` |
| **内容发布** | `baoyu-url-to-markdown` → `baoyu-format-markdown` → `baoyu-cover-image` → `baoyu-post-to-*` |
| **架构评审** | `architect` agent + `architecture-auditor` agent |
| **性能优化** | `perf-profile` → `benchmark` → `performance-optimizer` agent |

### 已删除的项目 (本次清理)
- ~~`continuous-learning`~~ → 替换为 `continuous-learning-v2`
- ~~`core/`~~ — 废弃空壳
- ~~`commit`~~ (skill) → 替换为 `writing-commits` + 内置 `/commit`
- ~~`tdd`~~ → 替换为 `tdd-workflow` (ECC 版更详细)
- ~~`azure-network-calculator`~~ → 替换为 `devops-network-calculator-for-azure`
- ~~`dbmap-auto-on/off`~~ → 合并入 `dbmap`
- ~~`repomap-auto-on/off`~~ → 合并入 `repomap`
- ~~18 语言专项 commands~~ (`cpp-review`, `go-build`, `rust-test` 等) → Agent 自动触发
- ~~webmcp commands~~ → 直接使用 `webmcp` skill
- ~~demo/test commands~~ → 无实际功能

---

## ⚙️ 冲突规则

1. **用户 rules 永远优先** — `~/.claude/rules/` > skills > 默认行为
2. **SOUL/身份 skills 禁用** — 身份由 `rules/soul.md` 定义
3. **ECC CLAUDE.md** — 仅项目级适用，不覆盖用户 rules
4. **不可变数据优先** — 即使 skill 建议 mutate，coding-style.md 规则优先
5. **Skill 不覆盖权限/安全规则** — 安全规则始终从 `rules/` 加载

---

> 最后更新: 2026-05-22 | 清理后: 448 skills (-9), 263 commands (-30), 89 agents (净增1)
