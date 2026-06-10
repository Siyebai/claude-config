---
name: system-diagnosis-methodology
description: 系统诊断方法论 — SCOUT协议/异常分类/修复策略/工具决策
metadata: 
  node_type: memory
  type: feedback
  date: 2026-06-06
  originSessionId: 78dc3a1b-a605-40e5-a273-68cf4a9b61ab
---

# 系统诊断方法论

## SCOUT诊断协议
1. **多维快查**: 同时查git状态/安全/目录结构/配置 — 不逐文件走
2. **异常分类**: P0-P2 × 安全/结构/运维，先P0
3. **根因验证**: `git ls-tree HEAD <file>` 确认HEAD存在，`git diff-tree` 查历史

## 修复优先级
| 层 | 典型问题 | 修复 |
|----|---------|------|
| P0安全 | PAT泄露/凭据明文/NTFS关闭 | 删helper→manager认证，恢复protectntfs |
| P1结构 | staging污染/技能冗余/命令碎片 | git add精准控制，合并冗余技能，命令标准化 |
| P2效率 | 大量临时文件/大技能文件 | 清理tmp，压缩SKILL.md至<10KB |

## 工具决策
- 小任务: Read/Grep/Bash → 直接做
- 复杂探索: Explore agent（只读，比逐文件快10x）
- 并行: 多个Agent同时启动
- 修改: 自己Edit/Write（必须先Read）
- 审计: code-reviewer / security-reviewer agent

## 关键教训
- ` D`=工作区删除, `D `=staged删除, ` M`=修改未stage
- PAT存三处: .git/config + ~/.gitconfig + ~/.git-credentials
- .gitignore可覆盖hooks文件 → `git add -f`
- 复杂重构必须走EnterPlanMode先探索
metadata: 
  node_type: memory
  type: feedback
  priority: highest
  originSessionId: 78dc3a1b-a605-40e5-a273-68cf4a9b61ab
---

# 审计方法论

**教训**: 2026-06-09 用 Workflow + 6个Agent 做全量代码审计，浪费大量token。
正确的做法是直接用 **ripgrep (Grep工具) + bash** 扫描。

## 高效审计方式
```
ripgrep 扫描全项目   → 几秒，几百token
Workflow Agent扫全量 → 几分钟，几万token
```

## 审计标准流程
1. `find . -name "*.ts" | wc -l` — 先探文件规模
2. `grep -rn "pattern" --include="*.ts"` — 靶向扫描关键模式
3. `find -exec wc -l {} +` — 按目录统计行数（不用 xargs）
4. 只在需要理解深层逻辑时才起 Agent

## token纪律
- 审计/统计类任务：bash + ripgrep 直出
- 设计/讨论类任务：可以直接对话
- Workflow Agent：只在真正需要并行执行多步骤作时使用
