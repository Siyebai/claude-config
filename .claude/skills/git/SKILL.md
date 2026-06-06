---
name: git
description: 完整Git工作流 — 历史操作+分支策略+提交规范+冲突解决。合并自git-workflow。
triggers: ["commit", "push", "rebase", "merge", "分支", "git", "PR", "pull request"]
weight: high
---

# Git 完整指南

## 适用场景
- 清理提交历史 / 交互式变基
- 跨分支应用提交（cherry-pick）
- 二分查找引入bug的提交（bisect）
- 多分支并行开发（worktree）
- 从Git错误中恢复（reflog）
- 分支策略决策、Conventional Commits、PR管理
- 合并冲突解决、语义化版本

---

## 一、高级历史操作

### 1.1 交互式变基
```bash
git rebase -i HEAD~5
git rebase -i $(git merge-base HEAD main)
```
操作: pick/reword/edit/squash/fixup/drop

### 1.2 Cherry-Pick
```bash
git cherry-pick abc123
git cherry-pick -n abc123  # 只暂存不提交
git cherry-pick -e abc123  # 编辑提交信息
git cherry-pick abc123..def456  # 范围（exclusive起始）
```

### 1.3 Bisect（二分查找）
```bash
git bisect start HEAD v1.0.0
git bisect run ./test.sh   # 自动化: exit 0=好, 非0=坏
```

### 1.4 Worktree（并行分支）
```bash
git worktree add ../project-feature feature/new-feature
git worktree add -b bugfix/urgent ../hotfix main
git worktree prune
```

### 1.5 Reflog（安全网）
```bash
git reflog
git reset --hard abc123   # 恢复丢失的提交
git branch recovered abc123
```

---

## 二、分支策略

| 策略 | 适用场景 | 特点 |
|------|---------|------|
| **GitHub Flow** | 持续部署/小型团队 | main+特性分支, PR→merge→deploy |
| **Trunk-Based** | CI/CD成熟团队 | 短命特性分支, 每日合并到main |
| **GitFlow** | 版本发布周期明确 | develop/release/hotfix/main多线 |

**选择规则**: 单人项目→GitHub Flow · 多版本发布→GitFlow · DevOps成熟→Trunk-Based

---

## 三、提交规范（Conventional Commits）

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```
**类型**: feat/fix/docs/style/refactor/perf/test/build/ci/chore/revert

**示例**:
```
feat(auth): add OAuth2 login flow
fix(api): handle null pointer in user query
docs(readme): update installation guide
```

---

## 四、变基 vs 合并

| 操作 | 何时用 |
|------|--------|
| **rebase** | 更新特性分支与main同步 · 清理本地历史 |
| **merge** | 合并完成特性到main · 保留协作历史 |
| **squash merge** | PR合并到main（保持主线整洁） |

---

## 五、PR工作流

1. `git checkout -b feat/xxx` → 开发 → 测试
2. `git rebase main` （同步最新）
3. `git push --force-with-lease origin feat/xxx` （安全推送）
4. 创建PR → 代码审查 → 通过
5. 合并（squash merge到main）
6. 删除特性分支

---

## 六、冲突解决

```bash
# 冲突时
git status  # 查看冲突文件
# 手动解决 → git add . → git rebase --continue
# 或放弃: git rebase --abort / git merge --abort
```

---

## 七、安全操作

```bash
git push --force-with-lease origin branch  # 代替 --force
git branch backup-branch  # 危险操作前备份
git restore --source=abc123 path/to/file   # 恢复特定版本
```

---

## 八、恢复命令

```bash
git rebase --abort / git merge --abort / git cherry-pick --abort / git bisect reset
git reset --soft HEAD^    # 撤销提交保留更改
git reset --hard HEAD^    # 撤销提交丢弃更改
```

---

## 参考资料
- `references/ConventionalCommits.md` — 提交规范详解
- `references/GitBestPractices.md` — 最佳实践
- `references/GitWorktree.md` — 工作树深入指南
- `references/SecurityChecklist.md` — Git安全检查
- `workflows/` — 13个专项工作流文件
