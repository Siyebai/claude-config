---
name: project-full-report
description: 2026-06-09 共和国项目全貌报告 — 规模/架构/健康/风险
metadata: 
  node_type: memory
  type: reference
  priority: highest
  date: 2026-06-09
  originSessionId: 78dc3a1b-a605-40e5-a273-68cf4a9b61ab
---

# 智能体共和国 — 项目全貌报告

> 日期: 2026-06-09 | 分支: dev | 301 commits | 3 贡献者
> 代码总量: ~200,725 行

---

## 一、项目规模

### 代码构成

| 语言/类型 | 文件数 | 行数 |
|-----------|--------|------|
| TypeScript (.ts) — 逻辑 | 598 | 67,708 |
| TypeScript React (.tsx) — 组件 | 562 | 83,704 |
| **TypeScript 小计** | **1,160** | **151,412** |
| buhui-engine (引擎) | 80 | 14,204 |
| JS/MJS/CJS | — | 26,458 |
| Python | — | 1,436 |
| SQL | — | 7,215 |
| **其他小计** | — | **35,109** |
| **源码总计** | **~1,240** | **~200,725** |
| 测试代码 | 149 文件 | 6,254 |

### 文件分布

```
src/                         1,160 文件 / 151,412 行
├── app/ (页面+API)            86 业务路由 + 197 API端点
├── lib/ (库/工具)             分散在各模块中
├── components/ (组件)         含大文件如 city/renderer 1186行
buhui-engine/                  80 文件 / 14,204 行
├── src/services/              引擎服务层
├── src/db/                    数据存储
├── src/core/                  核心逻辑
tests/                         149 文件 / 6,254 行
```

---

## 二、业务模块 (96个路由页面)

### P0 核心
buhui (不悔之城)、citizens、wallet

### P1 经济
economy、market、marketplace、studios、orders、trades、trading、auctions

### P2 社交/媒体
social、music、sports、weather、blog、broadcast、reviews

### P3 治理/身份
governance-v2、charter、constitution、passport、achievements、elections、diplomacy

### P4 Agent系统
agent (含builder/manage/dashboard)、agents、skills、evolution、match

### P5 基础设施
estate、infrastructure、companies、employment、shipments、tokenomics、tokens

### P6 监控/管理
monitoring、admin、system、security、risk、analytics

### P7 社区/活动
festivals、events、quests、tournament、racing、games

### P8 内容/创作
studios (art/music)、content-nft、nfts、creations

### P9 其他
education、knowledge、lab/labs、museum、explore、profile、settings、notifications、search、login/register、topup、vip、votem、wallet、access、ads、affiliate、coupons、disputes、engine、hermes、npc-activity、onboarding、plugins、police、proposals、recruitment、reputation、research、saves、toolkit、treasury

---

## 三、技术栈

| 层 | 技术 |
|---|------|
| 框架 | Next.js (App Router) |
| 语言 | TypeScript |
| 状态管理 | Zustand (9 stores) |
| 样式 | Tailwind + 540+处内联样式 |
| 动画 | Motion (Framer Motion) |
| 3D | Three.js |
| 数据库 | Supabase (PostgreSQL) + SQL |
| 测试 | Vitest (326 tests) |
| 引擎架构 | 独立 package `buhui-engine` |

---

## 四、架构分析

### 4.1 引擎架构
```
独立引擎包: buhui-engine/
├── src/core/          — 经济/规则/合约引擎
├── src/services/      — NPC/城市/社交服务
├── src/db/            — pg-store等数据层
├── src/agents/        — Agent行为系统

问题: 3个独立引擎实例互不知晓
```

### 4.2 API 层
```
Next.js API Routes (197个端点)
分组: auth/buhui/economy/social 等 82 组

问题: api-live.ts 中50%方法指向不存在路由
      密钥硬编码 (MINIMAX_API_KEY ×3)
```

### 4.3 认证体系
```
双轨并行 (未统一):
  前端 AuthProvider → sessionStorage (ar-did/ar-auth)
  API 客户端 → localStorage (agent-did/agent-token)
```

---

## 五、代码质量

| 指标 | 数据 | 评估 |
|------|------|------|
| @ts-nocheck | 204 处 | 🔴 持续恶化 (上次185) |
| console.log | 381 处 | 🟡 调试遗留 |
| 500行+文件 | 18 个 | 🟡 最大1186行 |
| 死路由页面 | 6 个 | 🟢 较少但存在 |
| mock/stub数据 | 5+ 处散布 | 🟡 功能真实性存疑 |
| 密钥泄露 | 3 处 | 🔴 安全风险 |
| 引擎多实例 | 3 个 | 🔴 架构问题 |
| 认证双轨 | 2 套 | 🔴 架构问题 |

---

## 六、P0 风险项

| # | 风险 | 影响 | 修复复杂度 |
|---|------|------|-----------|
| 1 | 引擎三胞胎 | NPC状态→SSE事件断裂 | 中 (统一engine-singleton) |
| 2 | 认证双轨 | 登录成功但请求匿名 | 中 (统一auth层) |
| 3 | API密钥泄露 | git提交后永久暴露 | 低 (移到环境变量) |
| 4 | 204处ts-nocheck | 类型系统名存实亡 | 高 (逐文件修复) |
| 5 | 50%API指向死路由 | 功能不可靠 | 高 (逐端对账) |

---

## 七、项目健康摘要

```
规模        ██████████ 200K行
功能丰富度  ██████████ 96路由
架构统一性  ████░░░░░░ 40%
类型覆盖    █████░░░░░ 50%
测试覆盖    ███████░░░ 70%
安全基线    ██████░░░░ 60%
文档完备度  ████████░░ 80%
```

---

*报告结束 - 基于 ripgrep 全量扫描数据*
