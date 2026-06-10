---
name: skill-library
description: 技能工具库索引 — 285技能按领域分类/调度规则/CCSwitch修复
metadata: 
  node_type: memory
  type: reference
  priority: high
  date: 2026-06-07
  originSessionId: 78dc3a1b-a605-40e5-a273-68cf4a9b61ab
---

# 技能工具库

> 285技能 @ ~/.claude/skills/ | 调度: .claude/rules/tool-dispatch.md

## 核心组合

| 任务 | 组合 |
|------|------|
| 新页面 | design-taste-frontend + react-patterns + motion-ui |
| UI翻新 | redesign-existing-projects + frontend-a11y |
| 安全审查 | security-review + security-scan |
| 性能优化 | react-performance + cost-tracking |
| 视频生成 | hyperframes + gsap + three |

## CCSwitch修复 (2026-06-07)
- **问题**: MiniMax拒绝tool_call arguments (error 2013)
- **根因**: translate.js arguments类型未保护/index.js cacheResponse参数未校验/repairMessages误删未执行tool_call
- **修复**: safeJsonArgs()统一序列化 + repairMessages保留未执行tool_call
- **文件**: `D:\DevTools\ccswitch\lib\translate.js + index.js`
