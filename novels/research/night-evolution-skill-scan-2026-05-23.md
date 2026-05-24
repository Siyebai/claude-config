# 夜间Skill系统扫描 — 2026-05-23

## 当前状态

- **Skills**: 449 个 (每个有SKILL.md ✅)
- **Commands**: 90 个
- **Agents**: 85 个
- **总计**: 624 个可调用单元

## 扫描结果

### 完整度
- 全部 449 skills 有 SKILL.md — 无缺失 ✅
- 无空目录 ✅
- 无重复名称 ✅

### 体积问题

10个最大的SKILL.md (全部来自 gstack/):

| Skill | 大小 | 建议 |
|-------|------|------|
| plan-ceo-review | 121KB | ⚠️ 极重。每次触发消耗大量上下文 |
| office-hours | 106KB | ⚠️ 同上 |
| land-and-deploy | 85KB | ⚠️ 同上 |
| retro | 73KB | ⚠️ 同上 |
| cso | 69KB | ⚠️ 同上 |
| codex | 63KB | ⚠️ 同上 |
| design-html | 61KB | ⚠️ 同上 |
| devex-review | 58KB | ⚠️ 同上 |
| plan-deep-review | 58KB | ⚠️ 同上 |
| design-shotgun | 56KB | ⚠️ 同上 |

这些 gstack/ skills 是 Google Cloud 相关的工作流（CEO review / office hours / land & deploy / CSO / Codex / design review 等）。对于当前工作（小说创作、白夜交易、Agent Republic），这些 skills **永远不会被触发**。

### 建议

1. **gstack/ 归档**: 10个 skills 合计 ~750KB，但触发概率 ≈ 0。建议移到 `~/.claude/skills-archive/gstack/` 或删除
2. **无其他低效项**: 没有发现缺失文件、空目录、重复名称等常见问题
3. **不需要新增合并**: 没有高度相似的 skill 对

### 小说相关 Skills (已知可用)

从 SKILLS_INDEX.md 中提取的小说创作相关技能约 22 个（story-*/novel-*/writing-* 系列），直接支持当前工作流。全部健康。
