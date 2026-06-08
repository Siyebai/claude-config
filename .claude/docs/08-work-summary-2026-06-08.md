# 2026-06-08 工作总结 — Codex独立 + 系统清理

> 核心: 夜不悔(Codex)彻底独立 · 双系统分离 · 配置精简

## 一、Codex 独立化

### 问题: 纠缠根源
- `~/.codex/AGENTS.md` 身份是"思夜白的AI幕僚" → 借用了Claude身份
- `~/.agents/skills/` 280个技能被Codex扫描 → 技能池交叉
- 根目录 `~/` 双方共写临时文件 → 污染
- `agent-hub/codex/` 在Claude的工作区 → 文件纠缠

### 解决方案: 4层隔离
```
身份层:  AGENTS.md 重写(72→51行) → "夜不悔"独立身份,非任何人的幕僚
配置层:  config.toml 固化(删3个bak) → CODEX-MEMORY.md 重写(119→32行)
技能层:  SKILL-INDEX.md 新建 → 明确只读18个自有技能,不读Claude的280个
空间层:  D:/智能体共和国/夜不悔-workspace/ → 独立工作空间
```

### 成果
| 指标 | 前 | 后 |
|------|----|----|
| AGENTS.md | 72行/3.4KB | 51行/2.2KB (-35%) |
| CODEX-MEMORY.md | 119行/~4.5KB | 32行/1.2KB (-73%) |
| 技能引用 | 扫280+19个 | 仅18个自有 |
| 根目录文件 | 9个临时 | 0个 |
| config backup | 3个bak | 0个 |

### 任务流程 (4步闭环)
```
1. 读 CODEX-MEMORY.md → 刷新身份+规则
2. 读 board/_board.md → 确认当前任务
3. 查 SKILL-INDEX.md → 命中→加载→执行
4. 完成 → 更新 board/updates/
```

---

## 二、Claude 自我优化

### 查出的问题
- `agent-hub/codex/` 残留Codex旧文件 → 移走
- 3个.bak文件 → 删除
- 缺少自诊/健康规则 → 补充
- tool-dispatch.md 缺少自检触发 → 新增3条

### 优化项
- `rules/claude.md` → +健康段 +自诊规则 +污染检查
- `tool-dispatch.md` → +自检 +数据分析 +记忆操作触发
- `memory/codex-independence.md` → 新建独立记录

---

## 三、系统架构总览

### 启动链
```
CCSwitch (:11435) ← MiniMax-M3 (Codex用)
         ↕
deepseek-v4-flash (Claude用,全路由)
         ↕
Portal-v3 (:3000) — Next.js + Three.js + R3F
```

### 项目结构
```
D:/智能体共和国/
├── portal-v3/           ← 主项目 (dev分支)
│   └── src/
│       ├── app/         ← 80+路由页面
│       ├── components/  ← 60+组件目录
│       └── lib/         ← 引擎+逻辑
├── 夜不悔-workspace/    ← Codex独立工作区
├── docs/                ← 系统架构/方案
└── agent-hub/           ← 共享知识
D:/DevTools/ccswitch/    ← CCSwitch :11435
```

### P1-P5 交付状态
```
P1: 导航+AGENT舰队 (Three.js星云/数据节点/领航者/Bloom)       ✅
P2: P2街区 (70建筑InstancedMesh + 500AGENT + 5交互)          ✅
P3: P3时间线 (6段里程碑滑块)                                   ✅
P4: P4宪章 (3枚金属勋章 + Medal3D)                            ✅
P5: P5号召行动 (Summit3D双层紫色徽章+粒子)                    ✅
```

---

## 四、关键经验

### 架构决策
1. `next/dynamic` + 客户端渲染用于Three.js组件 (SSR不可行)
2. UnrealBloomPass + curl noise + 体积光 + HDR = Three.js震感
3. InstancedMesh 用于批量AGENT/建筑 (性能关键)
4. CSS变量耦合色值系统 (`--color-primary`等)

### 踩坑纪录
1. **中文编码**: Windows `Get-Content`默认GBK → 强制UTF-8 BOM
2. **tool_call未执行**: 不能删, repairMessages保留
3. **367 TS预存**: buhui-engine类型定义错误,非当前Phase阻塞
4. **WAL/SHM**: SQLite自动生成,禁用功能(goals/memories)后需手动清理
5. **双AI纠缠**: 同一个目录不能同时维护两个AI配置

### Token优化经验
- 系统提示每压缩1KB = 每轮省~1K tokens
- AGENTS.md + CODEX-MEMORY.md → 原7.9KB, 现3.4KB (省57%)
- 技能文件按需加载,不预览未命中技能
- 不打印完整堆栈,读文件不超过200行
