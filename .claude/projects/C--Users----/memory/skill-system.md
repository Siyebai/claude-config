---
name: skill-system
description: Claude Code Skill 系统完整说明：安装记录 + 发现机制 + 三层漏斗 + 维护流程
metadata:
  node_type: memory
  type: reference
  originSessionId: 127bcddb-b672-4c27-b772-ad337294a248
  replaces: skill-system-guide.md, skill-system-installed.md, skill-system-quality-analysis.md
---

# Skill 系统

## 安装规模

457 skills / 89 commands / 87 agents from 8 marketplaces (2026-05-21).

| 来源 | Skills | 路径 |
|------|--------|------|
| ECC | 232 | `~/.claude/skills/` |
| julianobarbosa | 117 | ~ |
| superskills | 41 | ~ |
| baoyu | 22 | ~ |
| oh-story | 13 | ~ |
| CCSuite | 12 | ~ |
| caveman | 7 | ~ |
| story-skills, novel-creator, novel-control-station, others | 13 | ~ |

**优先级**: `~/.claude/rules/` > Skill 指令 > 默认行为。SOUL/身份/权限 skills 禁用。

## 三层发现漏斗

```
启动时:  扫描全部 SKILL.md (438×~100 tokens) → 提取 description → 建立索引
请求时:  语义匹配 description → 候选 1-3 个 → 仅加载命中的完整 SKILL.md
调用时:  触发后 Skill 内容进入上下文 → 任务完成后释放
```

- **Skills**: description 语义匹配，自动触发。成本最低，覆盖面最广。
- **Commands**: 用户手动 `/命令` 触发。精确调用，无歧义。
- **Agents**: Agent 工具 subagent_type 匹配。复杂多步骤任务。

## Description 质量

实测: 428 优秀 / 3 中等 / 0 需修复。

常见 YAML 多行语法（`>`、`|`、`>-`）被 Claude Code 正确解析，但 shell grep 无法处理 → 不要用 shell 工具验证 YAML 质量。

## 维护

```bash
# 更新来源
cd ~/.claude/skill-repos/<repo> && git pull
cp -r skills/* ~/.claude/skills/

# 刷新索引
skill-stocktake
```

## 核心文件

- `~/.claude/SKILLS_INDEX.md` — 按 DAILY/FREQUENT/DOMAIN/NOVEL/RARE 四级分类
- `~/.claude/skills/` — 457 个 skill 目录
- `~/.claude/commands/` — 89 个 slash commands
- `~/.claude/agents/` — 87 个 specialized agents
- `~/.claude/plugins/known_marketplaces.json` — 8 个注册市场
