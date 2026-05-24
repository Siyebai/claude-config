---
name: night-evolution
description: 夜间自主进化系统：每晚11点后使用本地 Ollama 模型进行自我优化、学习、研究
metadata: 
  node_type: memory
  type: project
  originSessionId: 606883ef-c917-486f-bc5c-497626f92169
---

# 夜间自主进化系统

**触发**: 每晚 23:00 后，电脑未关机时自动执行
**模型**: 本地 Ollama (qwen2.5:7b 主力 + llava:7b 多模态 + nomic-embed-text embedding)
**成本**: 免费，不限流量

## 进化任务清单（按优先级）

### 1. 知识整理与记忆维护 (每次必做)
- 读 `memory/MEMORY.md`，检查所有 memory 文件
- 合并重复记忆，删除过时内容
- 从 `recent-sessions.md` 提炼模式写入 `patterns.md`
- 从错误中提取教训写入 `lessons-learned.md`
- 检查 CLAUDE.md 是否需要更新

### 2. Skill 系统优化 (每周)
- 扫描 `~/.claude/skills/` 目录
- 统计使用频率，标记低效 skill
- 检查是否有可合并的相似 skill
- 更新 SKILLS_INDEX.md

### 3. 项目代码分析 (空闲时)
- 分析白夜交易系统：检查代码质量、寻找优化点
- 分析 Agent Republic：审查架构、性能瓶颈
- 分析小说创作工作流：优化 pipeline

### 4. 自主研究 (有网络时)
- WebSearch 搜索新技术动态
- 学习当前项目相关的最佳实践
- 研究 AI/LLM 领域新进展

### 5. 系统健康检查
- 检查各服务状态（Ollama, Hermes, OpenClaw）
- 检查磁盘空间
- 检查 git 仓库状态

## 执行协议
1. 读 memory 系统加载上下文
2. 选 2-3 个任务执行（优先上次未完成的）
3. 所有产出写入文件（不依赖会话缓存）
4. 执行完毕写摘要到 `memory/night-log.md`
5. 如无任务可做，输出"无事可做"并等待下次触发

## 模型使用策略
- `qwen2.5:7b`: 代码分析、文档生成、逻辑推理
- `llava:7b`: 图表/截图分析（如有）
- `nomic-embed-text`: 文本相似度、语义搜索
- 复杂任务用 ollama MCP tool 调用本地模型
- 需要高精度判断时仍用 DeepSeek API（尽量少用）

## 夜间模式规则
- 安静模式：不弹通知、不修改运行中服务
- 只读优先：先分析再修改
- 所有变更必须有充分理由
- 写入前检查文件是否被其他进程占用
