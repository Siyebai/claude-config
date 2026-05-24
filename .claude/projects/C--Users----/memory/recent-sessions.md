---
name: recent-sessions
description: 最近会话摘要（05-19/20/21 合并压缩）
metadata: 
  node_type: memory
  type: daily
  originSessionId: b2b31d18-cd53-4118-bc4e-06c31dd60516
---

## 05-19 — 启动协议 + 记忆系统 + 技能集成

- 建立 CLAUDE.md + SOUL/USER + MEMORY.md + lessons-learned 体系
- bypassPermissions 配置完成，权限弹窗根除
- 深度清理：~1.5GB（Electron 361MB + npm 684MB + pip 38MB + tmp 24MB）
- 规则合并：19→15 文件，25KB→15KB（-40%）
- 安全：删除 3 处明文 Token
- 技能：安装 38 技能（办公6 + 浏览器2 + 小说22 + 音频1 + 内置7）
- Agent Hub 面板修复 + 守护进程 + 统一启动器 start-all.cmd
- 图片 OCR：tesseract.js v6 集成

## 05-20 — 双智能体同步 + 知识库整合 + 小说重构

- 双 Claude Code 同步机制：dual-agent-sync.md + 心跳文件 + 状态文件
- 知识库整合：NOVEL-WRITING-PLAYBOOK.md (15章13.5KB) + XIAOHONGSHU v2 + ZHIHU
- VS Code 端修复同步：权限覆盖冲突、记忆丢失、CLAUDE.md 110→56行
- 白夜交易系统 v8.4 深度整合（3引擎 + 8修复 + 78/78测试）
- GitHub 备份：20 文件同步至 Siyebai/agent-republic/claude-code/

## 05-21 — v8.6 策略集成 + 39技能 + 全量压缩

- VS Code 端 v8.6 FarAboveEMA SHORT 主力策略（PF=2.90, WR=65.6%, MC 99.9%）
- 第 39 技能：Pollinations.AI 图像生成（D:/DevTools/image-gen.py，免费无Key）
- Codex Desktop 修复：approval_policy="never" + sandbox + PERSONA.md 重写
- CCSwitch 六层代理加固完成
- CLAUDE-CODE-WAKEUP.md 灾难恢复蓝图
- GitHub 全量同步至 Siyebai/cloud-code（29+文件）
- 系统深度压缩：WAKEUP -87%, PERSONA -60%, 日融合并, lessons-learned 精简

## 05-23 — 小说创作引擎 v4→v5 + 夜间进化系统

- 小说工具链: 5→8 CLI工具 (style-checker + knowledge-graph + style-modes 新增)
- 风格注入引擎: 9位大师参数化 + 7命令CLI + 4场景拆解 + 风格混合
- v5.0整合: 7记忆文件合一 (supreme-engine + workflow + SOP + style + quality + plot + craft)
- 文笔Lint v1.1: Vale 12类型 + write-good 9检查 → 中文7类规则
- 夜间进化: Ollama本地模型(4个) + 风格深度矩阵 + 反AI味规则v2.0 + 冷热切换v2.0 + 角色语音工具包
- 样板: 古言重生摆烂(贤妃选秀怼人) — 风格宪法零违规验证
- 知乎变现管线 v1.0: 7阶段MCP工具链 + 35指标五维Rubric
