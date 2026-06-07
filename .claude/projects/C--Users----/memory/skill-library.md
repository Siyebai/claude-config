---
name: skill-library
description: 技能工具库索引 — taste-skill/ECC/HyperFrames/markitdown 调度配置
metadata: 
  node_type: memory
  type: reference
  priority: high
  date: 2026-06-07
  originSessionId: 51aeb3b9-8cfa-40c3-962c-4a0a2541d3f4
---

# 技能工具库 — 290+ 技能分类索引

> 安装位置: ~/.agents/skills/（265） + ~/.codex/skills/（50）
> 调度规则: .claude/rules/tool-dispatch.md
> 完整索引: .claude/SKILL-INDEX.md

---

## 核心技能（Tier 1 — 自动匹配调用）

### 🎨 前端 & 设计（taste-skill 14个）
- **design-taste-frontend** — 反模板化UI，3档旋钮控风格
- **high-end-visual-design** — 高端视觉/精品/奢华
- **minimalist-ui** — Notion/Linear极简
- **industrial-brutalist-ui** — 瑞士排版工业风
- **brandkit** — 品牌套装生成
- **stitch-design-taste** — 多风格缝合统一
- **redesign-existing-projects** — 现有代码审计改造
- **make-interfaces-feel-better** — 界面手感微调

### 🧩 前端模式 & React（ECC 24个）
- **react-patterns** / **frontend-patterns** — React/前端最佳实践
- **frontend-a11y** — 无障碍标准
- **motion-ui** / **motion-patterns** / **motion-advanced** — 动效指南/模式库/高阶
- **nextjs-turbopack** / **vite-patterns** — 构建工具

### 🔒 安全 & 质量
- **security-scan** — 1282测试/102规则安全扫描
- **coding-standards** — 编码规范
- **error-handling** / **production-audit** — 错误处理/生产审计

### ⚡ 性能 & 成本
- **cost-tracking** / **token-budget-advisor** — Token消耗追踪
- **strategic-compact** / **context-budget** — 上下文压缩优化

### 🎬 视频生成（HyperFrames 13个）
- **hyperframes** + **hyperframes-cli** — HTML写视频渲染MP4
- **gsap** / **animejs** / **lottie** — 动效动画库
- **three** / **typegpu** — Three.js 3D/WebGPU
- **website-to-hyperframes** — 网页→视频

### 📄 文档工具
- **markitdown**（CLI） — PDF/DOCX/PPTX→Markdown
  Path: `~/.workbuddy/binaries/python/envs/default/Scripts/markitdown.exe`

---

## 组合调度规则

| 任务 | 自动组合 |
|------|---------|
| 做新页面 | design-taste-frontend + react-patterns + motion-ui + coding-standards |
| 审计UI | redesign-existing-projects + frontend-a11y + high-end-visual-design |
| 安全审查 | security-review + security-scan + coding-standards |
| 性能优化 | react-performance + cost-tracking + strategic-compact |
| 生成视频 | hyperframes + gsap + three |

---

## CCSwitch 修复记录（2026-06-07）

**问题**: tool_call arguments JSON 被 MiniMax 拒绝（error 2013）
**根因**: 
1. translate.js: arguments 类型未保护（object需JSON.stringify）
2. index.js: cacheResponse/buildNonStreamResponse 未做参数校验
3. repairMessages: 错误删除未执行的 tool_call（无tool回复的）
**修复**:
- safeJsonArgs() 统一处理所有 arguments 序列化
- repairMessages 重写：保留尚未执行的 tool_call
- 重试条件扩大到 tool_call/tool_call_id/function_arguments 错误
**文件**: D:\DevTools\ccswitch\lib\translate.js + index.js
