---
name: system-diagnosis-methodology
description: 系统诊断与重构方法论 — 2026-06-06 全系统修复经验
metadata: 
  node_type: memory
  type: feedback
  date: 2026-06-06
  originSessionId: 516ed4da-1bae-4ba8-823a-06da34d01716
---

# 系统诊断与重构方法论

## 背景
2026-06-06 执行系统自优化任务后发现系统异常，进行了一次完整的**系统体检→修复→重构→加固**全流程。

---

## 诊断方法（SCOUT Protocol）

### 1. 多维快查
同时从四个维度入手，不逐个文件检查：

```yaml
并行检查:
  - git状态: status --short, diff HEAD, log --oneline
  - 安全: .git/config凭据, settings.json密钥, gitignore覆盖
  - 目录: .claude/全目录扫描, 子目录大小排序
  - 配置: settings.json, hooks, rules, gitconfig全局
```

**关键心法**: 不读全文，先grep/glob定位异常再深入。Token纪律铁律。

### 2. 异常分类矩阵
发现异常后按 **严重度(P0-P2) × 类型(安全/结构/运维)** 分类，优先处理P0。

### 3. 根因判断：悬空删除的真相
105个文件显示 `D` 状态在 `git diff HEAD` 中，最初以为是 `0f7df965` 提交未完成。验证关键命令：
```bash
git ls-tree HEAD .claude/commands/dev/cloudflare-worker.md  # 确认文件确实在HEAD中
git diff-tree --no-commit-id -r --name-status 0f7df965       # 确认历史提交实际删了哪些
```

结论: 文件在HEAD中但被从磁盘物理删除，未staging/commit。不是git回滚问题。

---

## 修复策略

### 安全修复（P0优先）

| 问题 | 定位方法 | 修复 |
|------|---------|------|
| GitHub PAT暴露 | `git config --global --list` 发现明文helper | 删除local config + global config + .git-credentials文件 |
| 凭据存储不安全 | `store` helper存明文文件 | 切换到 `manager` (Windows Credential Manager) |
| NTFS保护关闭 | gitconfig中 `protectntfs=false` | sed删除该行（恢复默认true） |

### 结构修复
1. **staging精确控制**: `git add -A` 会误抓无关文件（zhihu截图等） → 改用逐个 `git add <path>` 精确控制
2. **force-add**: .gitignore覆盖的文件用 `git add -f` 
3. **commit粒度**: 一个commit解决一个主题

### 技能重构（8→6）
合并策略: 读两个SKILL.md → 提取独特内容 → 合并为一个 → 删除冗余
删除策略: 低价值/玩笑/ECC依赖 → 直接 `rm -rf`
标准化: 所有SKILL.md添加 `triggers` 和 `weight` 元数据

### 命令重构（55→30）
- 先读所有命令文件（通过Explore agent批量扫描，不是逐个读）
- 识别3大冗余组（review pipeline / planning family / test coverage）
- 合并为新文件，添加 `--tier` / `--strategy` 参数区分模式
- 删除ECC依赖命令后重写README移除幽灵引用

### 调度加固
- 创建 `tool-dispatch.md` 作为注入到每个会话的调度规则
- 不重新造注册系统（Claude Code自动发现文件系统），只加映射规则
- hooks加固: preExec加CCSwitch健康检查, session-end加时间戳+日志

---

## 关键工具使用模式

### Agent（子代理）使用决策
```
简单确定 → 直接Read/Grep/Bash
复杂探索 → Explore agent（只读）
并行任务 → 多个Agent同时启动
需要代码修改 → 自己直接Edit/Write
需要审计验证 → code-reviewer / security-reviewer agent
```

### Workflow vs Agent 选择
```
小任务（1-2步）→ Agent
中等（3-5步，需判断）→ 自己串行Agent
大规模并行（10+） → Workflow({script})
```

### 文件编辑纪律
- 必须Read后才能Write/Edit
- 先Read改动的文件的前几行确保路径正确
- Write覆盖整个文件比Edit多次更可靠
- Edit失败时用sed/Bash替代

---

## 教训

1. **git状态解读**: ` D`=工作区删除但HEAD有, `D `=staged删除, ` M`=修改未stage
2. **PAT可能存三处**: local .git/config + global ~/.gitconfig + ~/.git-credentials
3. **.gitignore陷阱**: hooks文件可能被.gitignore的宽泛规则覆盖，需 `git add -f`
4. **Agent的plan模式**: 复杂系统重构必须走 `EnterPlanMode` 先探索再执行
5. **Explore agent优于手动grep**: 需要理解多文件关系时，Explorer agent的扫描比逐文件Read快10x

---

## 相关记忆
- [[project-audit-lesson]] — 审计失败教训（扫名不读码/确认偏见）
- [[project-scan-standard]] — 项目审视默认scout --deep
