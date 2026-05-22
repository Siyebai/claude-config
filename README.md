# Claude Code 配置仓库

姜出尘 (Siyebai) 的 Claude Code 完整配置备份。

## 目录

```
.claude/
├── SKILLS_INDEX.md          # 全技能分类索引 (4-Tier: Daily/Frequent/Domain/Rare)
├── skills/                  # 448 skills (12个市场来源)
│   ├── code-reviewer/       #   代码审查 (7 skills)
│   ├── tdd-workflow/        #   测试驱动开发
│   ├── agentic-engineering/ #   Agent 工程 (8 skills)
│   ├── baoyu-*/             #   内容创作套件 (21 skills)
│   ├── story-*/             #   小说创作 (14 skills)
│   ├── novel-creator/       #   中文长篇创作引擎
│   ├── python-*/            #   Python 生态 (8 skills)
│   ├── azure-*/             #   Azure 云服务 (10 skills)
│   ├── argocd*/             #   GitOps/K8s (10 skills)
│   └── ...                  #   300+ 其他 skills
├── commands/                # 263 commands (28个命名空间)
│   ├── code-review.md       #   代码审查
│   ├── dev:*/               #   开发工具 (20 commands)
│   ├── deploy:*/            #   部署 (8 commands)
│   ├── security:*/          #   安全 (4 commands)
│   └── ...                  #   200+ 其他 commands
├── agents/                  # 89 agents
│   ├── code-reviewer.md     #   代码审查 agent
│   ├── tdd-guide.md         #   TDD agent
│   ├── security-reviewer.md #   安全审查 agent
│   └── ...                  #   86 其他 agents
└── rules/                   # 16 规则文件
    ├── soul.md              #   身份定义
    ├── user.md              #   用户信息
    ├── common/              #   通用规则 (coding-style, security, testing)
    └── python/              #   Python 专项规则
```

## 使用方式

### 1. 克隆配置
```bash
git clone https://github.com/Siyebai/claude-config.git ~/.claude-backup
# 然后软链接或复制需要的部分到 ~/.claude/
```

### 2. 快速查找 Skill

打开 `SKILLS_INDEX.md` 查看完整索引，或按场景查找：

| 场景 | Skill |
|------|-------|
| 审查代码 | `code-reviewer` agent 或 `/code-review` |
| 写测试 | `tdd-workflow` skill → `tdd-guide` agent |
| 提交代码 | `writing-commits` skill |
| 安全审查 | `security-review` + `security-reviewer` agent |
| Debug | `systematic-debugging` skill |
| API 设计 | `api-design` skill |
| 数据库 | `db-optimize` + `database-reviewer` agent |
| 写小说 | `story-long-write` + `novel-creator` + `chapter-writing` |
| 内容创作 | `baoyu-*` 系列 (21 skills) |
| Azure/K8s | `argocd` + `azure-devops` + `k8s-clusters` |

### 3. 安装到本地

将这些目录复制到 `~/.claude/` 对应位置后，Claude Code 会自动发现所有 skills/commands/agents。

## 统计

| 类型 | 数量 | 说明 |
|------|------|------|
| Skills | 448 | 上下文自动触发 |
| Commands | 263 | `/命令名` 手动触发 |
| Agents | 89 | Agent 工具 subagent_type 匹配 |
| Rules | 16 | 行为准则 (身份/安全/代码风格/测试) |
| 市场来源 | 12 | ECC, superskills, caveman, baoyu, oh-story, story-skills, novel-creator 等 |

## 维护

- **索引**: 更新 `SKILLS_INDEX.md`
- **安装**: `git pull` 后自动加载
- **清理**: 定期运行 `skills-audit` 检查冗余

## 最后清理

2026-05-22: 457→448 skills (-9), ~293→263 commands (-30), 4 toggle skills 合并, SKILLS_INDEX 重写

---

> 维护者: [Siyebai](https://github.com/Siyebai) | 环境: Windows 11 + Git Bash | Claude Code + VS Code 双端
