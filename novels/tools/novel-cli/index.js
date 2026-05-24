#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TOOLS = path.resolve(__dirname, '..');

function execNode(script, args = []) {
  try {
    const result = execSync(`node "${script}" ${args.join(' ')}`, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] });
    console.log(result.trim());
  } catch (e) {
    console.error(e.stderr || e.message);
    process.exit(e.status || 1);
  }
}

const cmd = process.argv[2];
const args = process.argv.slice(3);

function usage() {
  console.log(`
novel — 小说创作工具链 v3.2

Commands:
  novel init <name>              创建新小说项目 (18目录 + 16模板，含雪花法+五点追踪)
  novel status [path]            显示项目状态
  novel beat <total-chapters>    生成 Save the Cat 节拍表
  novel deslop <mode> <file>     去AI味扫描 (scan|report|check)
  novel score <mode> <file>      八维质量评分 (chapter|milestone|final|trend)
  novel entropy <mode> <dir>     一致性度量 (batch|etc|ewc|facts|dedup|audit)
  novel style <mode> <file>      风格检测+Lint (profile|check|diff|batch|lint|lint-batch)
  novel mode <cmd> <args>        大师风格模式 (list|load|apply|compare|blend|generate|inject)
  novel graph <mode> <dir>       知识图谱 (build|relations|query|heal|conflicts|export)
  novel check <project-path>     运行完整门禁检查
  `);
}

function init(name) {
  if (!name) { console.error('Usage: novel init <project-name>'); process.exit(1); }
  const root = path.resolve(name);
  if (fs.existsSync(root)) { console.error(`目录已存在: ${root}`); process.exit(1); }

  // 创建完整项目骨架 — 基于 novel-supreme-engine v3.0 结构
  const dirs = [
    '00_meta',
    '01_world',
    '02_characters',
    '03_plot/branch_simulations',
    '03_plot/fabula_entropy',
    '04_manuscript/vol_01',
    '05_quality/chapter_gates',
    '05_quality/health_checks',
    '06_review/continuity_reports',
    '06_review/style_reports',
    '06_review/editor_reports',
    '06_review/cross_agent_reviews',
    '07_export',
    '08_archive/old_drafts',
    '08_archive/discarded_branches',
    '08_archive/notes',
    'canon',
    'retrieval/chapter_meta',
  ];
  dirs.forEach(d => fs.mkdirSync(path.join(root, d), { recursive: true }));

  // 生成模板文件
  const templates = {
    '00_meta/idea_seed.md': ideaSeedTemplate(name),
    '00_meta/style_guide.md': styleGuideTemplate(),
    '00_meta/gate_config.json': gateConfigTemplate(),
    '00_meta/engine_state.json': engineStateTemplate(),
    '01_world/world_bible.md': worldBibleTemplate(),
    '01_world/world_rules.md': worldRulesTemplate(),
    '01_world/world_consistency_log.md': '# 世界规则变更日志\n\n| 日期 | 规则 | 变更类型 | 描述 | 影响章节 |\n|------|------|---------|------|---------|\n',
    '02_characters/character_bible.md': characterBibleTemplate(),
    '02_characters/character_state.md': characterStateTemplate(),
    '02_characters/relationship_matrix.md': relationshipMatrixTemplate(),
    '02_characters/character_arc_tracker.md': '# 角色弧线追踪\n\n> 每 10 章更新\n',
    '03_plot/plot_blueprint.md': '# 情节蓝图\n\n## 故事脊椎\n\n## 卷纲\n\n## 逆推锚点\n',
    '03_plot/beat_sheet.md': beatSheetTemplate(),
    '03_plot/plot_threads.md': plotThreadsTemplate(),
    'canon/facts.jsonl': '',
    '05_quality/quality_trends.md': '# Q-Score 趋势追踪\n\n| 章节范围 | Q-Score | 趋势 | 主要问题 |\n|---------|---------|------|---------|\n',
  };

  Object.entries(templates).forEach(([file, content]) => {
    fs.writeFileSync(path.join(root, file), content, 'utf-8');
  });

  console.log(`✅ 项目已创建: ${root}`);
  console.log(`   结构: ${dirs.length} 个目录, ${Object.keys(templates).length} 个模板文件`);
  console.log(`   下一步: cd ${name} && novel status`);
}

// ===== 模板函数 =====

function ideaSeedTemplate(name) {
  return `# 种子文件 — ${name}

> 宪法文件，锁定后不可修改

## 核心情感锚定
> 这是一个关于______的故事。读者合上书后应该感受到______。

## 欲望-障碍-代价三角
| 要素 | 内容 |
|------|------|
| Want (表层欲望) | |
| Obstacle (障碍) | |
| Cost (代价) | |
| Need (深层需求) | |

## 逆推三锚点
### 终局画面 (P_END)
> 500字具体描写最终画面

### 中点画面 (P_MID, 50%)
> 转折场景

### 开场画面 (P_OPEN, 1%)
> 初始场景

## 五要素确认
| 要素 | 设定 |
|------|------|
| 目标读者 | |
| 写作风格 | |
| 核心禁区 | |
| 自动化等级 | |
| 目标规模 | |
`;
}

function styleGuideTemplate() {
  return `# 风格指南

## 风格宪法
\`\`\`yaml
constitution:
  prime_directive: ""
  non_negotiables: []
  forbidden_words:
    ai_slop: [目光, 身形, 冷笑, 深深, 不由得, 似乎, 仿佛, 轻轻, 微微, 心中一惊, 眼中闪过]
    weak_modifiers: [很, 非常, 真的, 特别, 极其, 无比]
    cliches: [心砰砰跳, 时间仿佛静止]
\`\`\`

## 风格金样本 (500字)
> 写前必读，内化风格
`;
}

function gateConfigTemplate() {
  return JSON.stringify({
    chapter_word_count: [3000, 5000],
    gate_strictness: "standard",
    deslop_mode: "strict",
    anti_rush: true,
    target_q_score: 8.5,
    rhythm_ratio: { fast: 0.2, medium: 0.5, slow: 0.3 }
  }, null, 2);
}

function engineStateTemplate() {
  return JSON.stringify({
    engine_version: "3.0",
    current_chapter: 0,
    total_chapters_planned: 0,
    current_volume: 1,
    last_gate_passed: true,
    mode: "from_scratch"
  }, null, 2);
}

function worldBibleTemplate() {
  return `# 世界观圣经

## 物理维度
- 地理/气候:
- 资源分布:
- 技术/魔法体系:
- 时间线:

## 社会维度
- 阶级/权力结构:
- 规则/禁忌:
- 文化/习俗:
- 势力版图:

## 隐喻维度
- 核心主题:
- 价值观冲突:
- 哲学命题:
- 象征体系:
`;
}

function worldRulesTemplate() {
  return `# 世界规则清单

## R0 — 不可违背（物理/魔法基本法则）
| 规则 | 描述 | 故事可能性 ×3 |
|------|------|-------------|

## R1 — 极难违背（世界级制度/契约）
| 规则 | 描述 |
|------|------|

## R2 — 违背有代价（社会规范/势力规则）
| 规则 | 描述 |
|------|------|

## R3 — 可违背（个人约定/临时协议）
| 规则 | 描述 |
|------|------|
`;
}

function characterBibleTemplate() {
  return `# 角色圣经

## 主角
| 要素 | 内容 |
|------|------|
| Want | |
| Need | |
| Flaw | |
| Ghost | |
| Arc | |

## 反派
| 要素 | 内容 |
|------|------|
| Want | |
| Need | |
| Justification | |
| Mirror (与主角镜像关系) | |

## 配角功能位
| 角色 | 功能位 | 关系 | 弧线简述 |
|------|--------|------|---------|
| | Ally | | |
| | Mentor | | |
| | Shadow | | |
| | Foil | | |
| | Shapeshifter | | |
`;
}

function relationshipMatrixTemplate() {
  return `# 关系张力矩阵

| 关系 | 当前状态 | 变化方向 | 关键转折点 |
|------|---------|---------|-----------|
| 主角-反派 | 0% | → | |
| 主角-Ally | 0% | → | |
| 主角-Mentor | 0% | → | |
| 主角-Love | 0% | → | |
`;

function characterStateTemplate() {
  return `# 角色当前状态

> 每章更新。五点追踪体系 (← AI_NovelGenerator)

## {角色名}

### 物品
| 物品 | 类型 | 描述 | 获得章节 | 状态 |
|------|------|------|---------|------|
| | 道具/武器/信物 | | 第X章 | 持有/遗失/损坏 |

### 能力
| 能力 | 等级 | 描述 | 解锁章节 | 限制条件 |
|------|------|------|---------|---------|
| | | | | |

### 身体&心理状态
| 维度 | 当前状态 | 变化趋势 | 最近更新章 |
|------|---------|---------|-----------|
| 身体 | | | |
| 心理 | | | |
| 位置 | | | |

### 关系网
| 关系对象 | 关系类型 | 当前状态 | 最近互动章 | 变化方向 |
|---------|---------|---------|-----------|---------|
| | | | | → |

### 触发&加深事件
| 事件 | 类型 | 描述 | 发生章节 | 影响 |
|------|------|------|---------|------|
| | 触发/加深/解决 | | | |
`;
}`;
}

function beatSheetTemplate() {
  return `# 雪花法十层 + Save the Cat 节拍表

> 雪花法 (← AI_NovelGenerator 4.7k⭐) 从核心种子逐层展开到完整小说
> 使用 \`novel beat <总章节数>\` 生成节拍表

## 雪花法展开记录

### 第1层：一句话摘要 (25-100字)
> 格式: 当[主角]遭遇[核心事件]，必须[关键行动]，否则[灾难]；同时[更大危机]正在发酵。

### 第2层：角色驱动力三角
| 角色 | Want (表层) | Need (深层) | Flaw (缺陷) | Ghost (创伤) |
|------|------------|------------|------------|-------------|
| 主角 | | | | |
| 反派 | | | | |

### 第3层：世界观三维建模
| 维度 | 关键设定 |
|------|---------|
| 物理维度 (地理/资源/技术/时间线) | |
| 社会维度 (阶级/规则/文化/势力) | |
| 隐喻维度 (主题/价值观/哲学命题/象征) | |

### 第4层：三幕情节
| 幕 | 核心事件 | 角色弧线位置 |
|----|---------|------------|
| Act 1: 触发 | 铺垫→催化剂→错误选择 | 初始状态→触发事件 |
| Act 2: 对抗 | 升级→虚假胜利→灵魂黑夜 | 认知失调→蜕变节点 |
| Act 3: 解决 | 代价→嵌套转折→2个悬念 | 蜕变→最终状态 |

### 第5层：逐章蓝图
> 使用 \`novel beat <总章节数> --markdown\` 生成
> 每章元数据: 标题/定位(角色|事件|主题)/作用(推进|转折|揭示)/悬念密度/伏笔操作/简述

---

## Save the Cat 节拍表

> 使用 \`novel beat <总章节数> --markdown\` 生成 15 节拍映射

| # | 节拍 | 位置% | 章节 | 类型 | 核心内容 |
|---|------|-------|------|------|---------|
| 1 | Opening Image | 1% | | slow | |
| 2 | Theme Stated | 5% | | slow | |
| 3 | Set-Up | 1-10% | | medium | |
| 4 | Catalyst | 10% | | fast | |
| 5 | Debate | 10-20% | | medium | |
| 6 | Break into Two | 20% | | fast | |
| 7 | B Story | 22% | | medium | |
| 8 | Fun and Games | 20-50% | | fast | |
| 9 | Midpoint | 50% | | fast | |
| 10 | Bad Guys Close In | 50-75% | | medium | |
| 11 | All Is Lost | 75% | | fast | |
| 12 | Dark Night of the Soul | 75-80% | | slow | |
| 13 | Break into Three | 80% | | fast | |
| 14 | Finale | 80-99% | | fast | |
| 15 | Final Image | 100% | | slow | |

---

## 节奏配额
| 档位 | 占比 | 最大连续 | 句长 | 对话比 | 场景类型 |
|------|------|---------|------|--------|---------|
| 快档 | 20% | 1章 | 8-15字 | 40-60% | 动作为主 |
| 中档 | 50% | — | 12-22字 | 30-50% | 对话+心理 |
| 慢档 | 30% | — | 18-28字 | 50-70% | 心理+环境 |
`;
}

function plotThreadsTemplate() {
  return `# 伏笔追踪

| ID | 伏笔内容 | 埋设章节 | 计划回收 | 状态 | 优先级 |
|----|---------|---------|---------|------|--------|
| F001 | | | | 开放 | |
`;
}

// ===== 其他命令占位 =====

function check(projectPath) {
  console.log('门禁检查 — 待实现 (参考 novel-creator-skill chapter_gate_check.py)');
}

function status(projectPath) {
  const root = projectPath || '.';
  const statePath = path.join(root, '00_meta/engine_state.json');
  if (!fs.existsSync(statePath)) {
    console.log('未找到项目 (缺少 00_meta/engine_state.json)');
    return;
  }
  const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
  console.log(`引擎版本: ${state.engine_version}`);
  console.log(`当前进度: 第${state.current_chapter}章 (卷${state.current_volume})`);
  console.log(`上次门禁: ${state.last_gate_passed ? '✅ 通过' : '❌ 失败'}`);
  console.log(`模式: ${state.mode}`);

  // 统计已有章节
  const volDir = path.join(root, '04_manuscript/vol_01');
  if (fs.existsSync(volDir)) {
    const chapters = fs.readdirSync(volDir).filter(f => f.endsWith('.md'));
    console.log(`已写章节: ${chapters.length} 章`);
  }
}

// ===== 主入口 =====

switch (cmd) {
  case 'init': init(args[0]); break;
  case 'check': check(args[0]); break;
  case 'status': status(args[0]); break;
  case 'beat':
    execNode(path.join(TOOLS, 'beat-calculator', 'index.js'), args);
    break;
  case 'deslop':
    execNode(path.join(TOOLS, 'deslop-scanner', 'index.js'), args);
    break;
  case 'score':
    execNode(path.join(TOOLS, 'qscore-calculator', 'index.js'), args);
    break;
  case 'entropy':
    execNode(path.join(TOOLS, 'fabula-entropy', 'index.js'), args);
    break;
  case 'style':
    execNode(path.join(TOOLS, 'style-checker', 'index.js'), args);
    break;
  case 'mode':
    execNode(path.join(TOOLS, 'style-modes', 'index.js'), args);
    break;
  case 'graph':
    execNode(path.join(TOOLS, 'knowledge-graph', 'index.js'), args);
    break;
  default: usage();
}
