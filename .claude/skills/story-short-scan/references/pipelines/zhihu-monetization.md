# 知乎短篇变现管线 (Zhihu Short Story Monetization Pipeline)

> 版本: 1.0 | 2026-05-22
> 7 阶段管道：热点 → 选题 → 拆文 → 创作 → 审查 → 润色 → 发布

## 架构总览

```
┌──────────────────────────────────────────────────────────────────┐
│                    知乎短篇变现 7-Stage Pipeline                    │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┤
│ Stage 1  │ Stage 2  │ Stage 3  │ Stage 4  │ Stage 5  │ Stage 6  │
│ 热点发现 │ 选题决策 │ 对标拆文 │ AI 创作  │ 多角审查 │ 去AI味   │
│          │          │          │          │          │          │
│ hotnews  │ scan +   │ analyze  │ write    │ review   │ deslop   │
│ -mcp     │ rubric   │          │          │          │          │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ MCP 工具 │ Skill    │ Skill    │ Skill    │ Skill    │ Skill    │
│ 实时数据 │ 市场分析 │ 深度拆解 │ 创作执行 │ 质量审查 │ 风格润色 │
├──────────┴──────────┴──────────┴──────────┴──────────┴──────────┤
│                          Stage 7: 发布与传播                       │
│  zhihu-mcp (wingAGI) 发布 + baoyu-image-cards 配图 + 数据回收     │
└──────────────────────────────────────────────────────────────────┘
```

## 数据流

```
外部世界                    本地 Skill 管道                   外部平台
─────────                  ──────────────                   ────────
知乎热榜 ──→ hotnews-mcp ──→ story-short-scan ──→ 选题决策
                                                    │
已发布爆款 ←── zhihu-mcp ──→ story-short-analyze ←─┘
  (search)                       │
                                 ▼
                           story-short-write ──→ 初稿.md
                                                    │
                                                    ▼
                              story-review (4 Agents)
                              ├─ story-architect    │
                              ├─ character-designer ├─→ 审查报告.md
                              ├─ consistency-checker│
                              └─ prose-polisher     │
                                                    ▼
                              story-deslop ──→ 去味稿.md
                                                    │
                                                    ▼
                              baoyu-image-cards ──→ 配图/
                                                    │
                                                    ▼
                              zhihu-mcp (wingAGI) ──→ 知乎盐选
                              (publish)                 │
                                                    ▼
                                              数据回收 (7天后)
                                              ──→ 复盘报告.md
```

## Stage 1: 热点发现

**工具**: `hotnews-mcp` (MCP Server)
**输入**: 实时知乎热榜、盐选热榜
**输出**: 结构化热点数据 → 注入 Stage 2

```
调用: mcp__hotnews__get_zhihu_hot
返回: 热榜条目 (排名, 标题, 热度, 话题标签)
```

**策略**:
- 每日早晚各抓一次，捕捉热点轮动
- 关注 "情感/两性/家庭/职场/悬疑" 标签（短篇主力赛道）
- 过滤纯新闻/政治/科技类（不做短篇素材）
- 热点生命周期通常 3-7 天，需快速响应

## Stage 2: 选题决策

**工具**: `story-short-scan` skill
**输入**: Stage 1 热点 + 用户方向偏好 + 知乎 Rubric 四、市场匹配
**输出**: 选题候选列表（含热度、竞争度、适配度评估）

**决策矩阵**:

| 维度 | 权重 | 数据来源 |
|------|------|---------|
| 市场热度 | 30% | hotnews-mcp 热榜数据 |
| 竞争程度 | 25% | zhihu-mcp search 同题材数量 |
| 创作门槛 | 20% | story-short-analyze 对标拆解 |
| 情绪适配 | 15% | 知乎 Rubric 三、情绪工程 |
| 变现潜力 | 10% | 盐选专栏历史数据 |

**触发**: `/短篇扫榜` 或提供热点方向 → 输出选题报告

## Stage 3: 对标拆文

**工具**: `story-short-analyze` skill
**输入**: Stage 2 选定的选题 + 3 篇同题材爆款（zhihu-mcp search 获取）
**输出**: 拆文报告（故事核 + 结构 + 情感线 + 反转机制 + 写作手法）

**标准输出文件** (存 `拆文库/{书名}/`):
- `拆文报告.md` — 完整分析
- `情节节点.md` — 节点清单 (精细模式)
- `写作手法.md` — 技法详解 (精细模式)

**关键提取**:
- 对标品的情绪目标 → 确定自己写什么情绪
- 对标品的反转位置 → 安排自己的反转位置
- 对标品的金句类型 → 设计自己的金句

## Stage 4: AI 创作

**工具**: `story-short-write` skill
**输入**: Stage 3 拆文结论 + 知乎 Rubric 一/二/三维度
**输出**: 初稿（8000-13000 字，第一人称）

**写作前必须加载**:
1. `story-short-write/references/format-and-structure.md`
2. `story-review/references/rubrics/zhihu.md` (一至三维度)
3. Stage 3 提取的对标品模式

**写作流程**:
- Phase 1: 确定情绪目标 → 对齐 Rubric 三
- Phase 2: 选题材框架 → 对齐 Rubric 四
- Phase 3: 写开头钩子 → 对齐 Rubric 二 (开头钩子/跳失率)
- Phase 4: 铺设伏笔 → 对齐 Rubric 二 (反转设计/信息释放)
- Phase 5: 情绪拉扯 → 对齐 Rubric 三 (情绪曲线/共鸣层级)
- Phase 6: 反转引爆 → 对齐 Rubric 二 (反转强度)
- Phase 7: 结尾余韵 → 对齐 Rubric 三 (结尾余韵)

## Stage 5: 多角审查

**工具**: `story-review` skill (4 Agent 并行)
**输入**: Stage 4 初稿 + 知乎 Rubric 全五维
**输出**: 审查报告（PASS/FAIL + 修改建议）

**知乎模式特殊配置**:
- story-architect 加载 `rubrics/zhihu.md` 全五维
- character-designer 额外检查：第一人称一致性 + 对话自然度
- consistency-checker 额外检查：反转伏笔 + 时间线
- prose-polisher 额外检查：段落节奏 + 金句密度

**判定**: APPROVE (无 CRITICAL) / CONCERNS (有 HIGH) / REJECT (有 CRITICAL)

## Stage 6: 去AI味

**工具**: `story-deslop` skill
**输入**: Stage 5 通过审查的稿子
**输出**: 自然化定稿

**知乎盐言特化处理**:
- 重点处理：连续排比、过度解释、书面腔
- 保留：反转机制、伏笔结构、金句
- 添加：口语词、生活化比喻、省略留白
- AI味等级阈值: 轻度 → ≤15% 删除 / 中度 → ≤25% / 重度 → ≤35%

## Stage 7: 发布与传播

**工具**: `zhihu-mcp` (wingAGI) + `baoyu-image-cards`
**输入**: Stage 6 定稿 + 配图
**输出**: 已发布文章 + 数据跟踪

**发布检查清单**:
- [ ] 正文格式：无空行，半角双引号，小节标记规范
- [ ] 标题优化：<15 字，含冲突/反转/悬念
- [ ] 配图 ≥3 张：封面图 (story-cover) + 金句卡 (baoyu-image-cards)
- [ ] 话题标签选择 (zhihu-mcp search 查相关话题热度)
- [ ] 发布时间：工作日晚 20:00-22:00 或周末早 10:00

**数据回收 (7 天后)**:
- 阅读量、点赞、收藏、评论
- 盐选转化率（如有）
- → 复盘报告 → 更新选题决策矩阵

## MCP Server 配置

在 `~/.claude/mcp.json` 中配置:

```json
{
  "mcpServers": {
    "hotnews": {
      "command": "uv",
      "args": ["run", "--directory", "C:/Users/李初尘/mcp-servers/hotnews-mcp", "python", "main.py"],
      "env": {}
    },
    "zhihu-search": {
      "command": "uv",
      "args": ["run", "--directory", "C:/Users/李初尘/mcp-servers/zhihu-search-mcp", "zhihu-mcp"],
      "env": {}
    },
    "zhihu-publish": {
      "command": "uv",
      "args": ["run", "--directory", "C:/Users/李初尘/mcp-servers/zhihu-publish-mcp", "zhihu-mcp"],
      "env": {}
    }
  }
}
```

## 快速启动

```bash
# 完整管线（从热点到发布）
/story-short-scan zhihu → /story-short-analyze {对标URL} → /story-short-write → /story-review → /story-deslop → 发布

# 已有选题（跳过热点+拆文）
/story-short-write {选题} → /story-review → /story-deslop → 发布

# 仅润色已有稿子
/story-review → /story-deslop → 发布
```

## 成本与效率

| 阶段 | 耗时 | 工具成本 | 说明 |
|------|------|---------|------|
| 1. 热点发现 | 1min | MCP | 自动化 |
| 2. 选题决策 | 5-10min | Skill | 需人工确认方向 |
| 3. 对标拆文 | 15-30min | Skill | 精细模式更久 |
| 4. AI 创作 | 30-60min | Skill | 核心耗时 |
| 5. 多角审查 | 10-15min | 4 Agents | 并行 |
| 6. 去AI味 | 10-20min | Skill | 取决于AI味程度 |
| 7. 发布配图 | 10-15min | MCP + Skill | 配图耗时取决于数量 |
| **总计** | **~2-3h** | | 从选题到发布 |
