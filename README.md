# Claude Code 配置仓库

姜出尘 (Siyebai) 的 Claude Code 轻量配置 — 精简至核心，缓存命中率 90%+。

## 目录结构

```
.claude/
├── rules/              # 3 核心规则（每次启动自动加载）
│   ├── craft.md        #   代码工艺：不可变/文件上限/错误处理/安全审查
│   ├── identity.md     #   身份定义：全栈伙伴·自主推进·最高信任
│   └── ops.md          #   运维规则：性能/清理/简洁输出
├── skills/             # 16 核心技能（/命令 或 Skill工具调用）
│   ├── playwright      #   浏览器自动化/E2E测试
│   ├── git             #   Git操作
│   ├── git-workflow    #   Git工作流（分支/PR）
│   ├── pre-commit      #   提交前检查
│   ├── code-review     #   代码审查
│   ├── security-review #   安全审查
│   ├── context7        #   文档查询
│   ├── debug           #   调试
│   ├── verify          #   验证变更
│   ├── cavecrew        #   极简操作
│   ├── caveman-commit  #   极简提交
│   ├── caveman-review  #   极简审查
│   ├── repomap         #   仓库映射
│   ├── shellcheck      #   Shell检查
│   ├── shell-prompt    #   Shell提示
│   └── tldr            #   快速摘要
├── agents/             # 7 子代理（Agent工具 subagent_type）
│   ├── architect.md        #   架构设计
│   ├── build-error-resolver.md # 构建错误修复
│   ├── code-explorer.md    #   代码探索
│   ├── code-reviewer.md    #   代码审查
│   ├── github-workflow.md  #   Git/PR操作
│   ├── security-reviewer.md #  安全审查
│   └── triage.md           #   紧急修复
├── hooks/              # 会话钩子（自动清理缓存）
│   ├── session-start.ps1   #   启动时清理临时目录
│   └── session-end.ps1     #   结束时压缩大文件
├── commands/           # 内置命令（Claude Code 自带）
├── docs/               # 系统文档（Codex/Guardian 参考）
├── projects/.../memory/# 持久记忆系统（跨会话）
│   ├── MEMORY.md           #   记忆索引（稳定，无日期行）
│   ├── user-identity.md    #   用户身份/偏好
│   ├── lessons-learned.md  #   经验教训
│   └── ...                 #   项目/平台相关记忆
├── settings.json       # 全局配置（DeepSeek后端/maxTokens=8192/fastMode）
└── settings.local.json # 本地权限覆盖
```

## 缓存优化策略

核心原则：**autoload文件保持稳定 → 跨会话缓存命中率最大化**

| 优化点 | 措施 | 效果 |
|--------|------|------|
| MEMORY.md | 去日期行，索引静态化 | 消除每次会话的必cache-miss |
| Skills | 448→16，删除未调用技能 | 技能列表缩减96% |
| Agents | 89→7，删除冗余子代理 | 代理列表缩减92% |
| Rules | 16→3，合并重复规则 | 规则加载量缩减81% |
| 内存文件 | 14→9，清除编码损坏文件 | 向量检索更精准 |

## 配置要点

- **后端**: DeepSeek API (api.deepseek.com/anthropic)
- **模型**: deepseek-v4-pro (主力) / deepseek-v4-flash (子代理)
- **上下文**: 1M窗口 / 8K输出上限
- **模式**: fastMode + bypassPermissions + low effort

## 维护

更新配置后提交：
```bash
git add .claude/ && git commit -m "chore: update claude config" && git push
```

---
> 维护者: [Siyebai](https://github.com/Siyebai) | 环境: Windows 11 + Git Bash | 后端: DeepSeek | 轻量·稳定·高缓存命中
