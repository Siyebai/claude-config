---
name: zhihu-monetization-pipeline
description: "知乎短篇变现管线 v1.0: 7阶段管道 + MCP工具链 + 35指标五维Rubric"
metadata: 
  node_type: memory
  type: project
  originSessionId: 5102d8c9-5998-476e-8358-79d826bcc17c
---

# 知乎短篇变现管线 v1.0

2026-05-22 创建。知乎盐言短篇小说创作→发布的全流程管线。

## 管线架构

7 阶段: 热点发现 (hotnews-mcp) → 选题决策 (story-short-scan) → 对标拆文 (story-short-analyze) → AI创作 (story-short-write) → 多角审查 (story-review) → 去AI味 (story-deslop) → 发布配图 (zhihu-mcp + baoyu-image-cards)

## 核心文件

- **管线编排**: `~/.claude/skills/story-short-scan/references/pipelines/zhihu-monetization.md`
- **知乎 Rubric**: `~/.claude/skills/story-review/references/rubrics/zhihu.md` (35 指标, 五维加权)
- **MCP 配置**: `~/.claude/mcp.json`
- **安装脚本**: `~/mcp-servers/setup.sh`

## MCP 工具链 (3 个)

1. `wengchengjian/hotnews-mcp` — 知乎热榜/微博/百度/抖音实时数据
2. `futurehafuture/zhihu-mcp` — 知乎搜索 & 内容获取 (Playwright)
3. `wingAGI/zhihu-mcp` — 知乎 Markdown 发布 (Playwright)

## 阻塞

MCP 服务器未安装 — 网络不通无法 git clone。setup.sh 和 mcp.json 已就绪，网络恢复后运行 `bash ~/mcp-servers/setup.sh` 即可。

## 改进点 (vs 原始状态)

- zhihu rubric: 8 个 PASS/FAIL → 35 指标五维加权 (情绪工程 1.5x 权重最高)
- 数据来源: CDP only → MCP 优先 → CDP 降级
- 管线: 零散 skill 调用 → 7 阶段统一编排
- 交叉引用: rubric ↔ pipeline ↔ skills 全部互链
- story-short-write: 明确知乎盐言加载 rubric 指令

**Why:** 知乎盐选是短篇变现最直接路径。原有 14 个 story-* skills 功能完备但缺乏知乎平台特化配置和管线编排。
**How to apply:** `/story-short-scan zhihu` 触发完整管线。MCP 安装前用 CDP 或用户提供数据降级运行。
