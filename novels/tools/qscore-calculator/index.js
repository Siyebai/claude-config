#!/usr/bin/env node
/**
 * Q-Score Calculator — 八维质量评分计算器 v1.0
 *
 * 基于 novel-quality-scoring-system.md 的8维20子维度评分体系
 * 整合 InkOS 26维审计映射
 *
 * Usage:
 *   node index.js chapter <scores.json>            # 单章评分 (③⑥⑦)
 *   node index.js milestone <scores.json>           # 10章全身体检 (全8维)
 *   node index.js final <scores.json>               # 全书评分
 *   node index.js trend <history.json>              # 趋势分析
 */

const cmd = process.argv[2];
const target = process.argv[3];
const fs = require('fs');

// ===== 八维权重配置 =====
const DIMENSION_WEIGHTS = {
  plot_structure:        { name: '① 情节与结构',   weight: 0.20, sub: ['coherence','pacing','surprise','ending'] },
  characters:            { name: '② 角色塑造',     weight: 0.18, sub: ['depth','arc','relationship','distinctiveness'] },
  writing_language:      { name: '③ 文笔与语言',   weight: 0.12, sub: ['fluency','voice','description_balance'] },
  world_building:        { name: '④ 世界观与设定', weight: 0.10, sub: ['consistency','utilization','immersion'] },
  themes:                { name: '⑤ 主题与思想',   weight: 0.08, sub: ['maturity','value_conflict'] },
  emotional_impact:      { name: '⑥ 情感冲击',     weight: 0.12, sub: ['range','payoff','empathy'] },
  enjoyment_engagement:  { name: '⑦ 阅读体验',     weight: 0.12, sub: ['hook_density','payoff_density','info_pacing'] },
  expectation_fulfillment:{ name: '⑧ 预期管理',    weight: 0.08, sub: ['genre_promise','foreshadowing_payoff'] },
};

// InkOS 26维 → 八维映射
const INKOS_MAPPING = {
  plot_structure:   [1,2,7,11,12,22,23,26],  // OOC检查,时间线,节奏,利益链,年代考据,公式化转折,列表式,节奏单调
  characters:       [9,13,14,16,24,25],       // 信息越界,配角降智,工具人,台词失真,支线停滞,弧线平坦
  writing_language: [8,10,15,17,18,19,20,21], // 文风,词汇疲劳,爽点虚化,流水账,知识库污染,POV,段落等长,套话密度
  world_building:   [3,4,5],                   // 设定冲突,战力崩坏,数值检查
  expectation_fulfillment: [6],                // 伏笔检查
};

// ===== 评分计算 =====

function calcDimensionScore(scores, dimKey) {
  const dim = DIMENSION_WEIGHTS[dimKey];
  if (!scores[dimKey]) return { score: 0, sub_scores: {}, warning: 'missing' };

  const subScores = {};
  let totalWeight = 0;
  let weightedSum = 0;

  dim.sub.forEach(sub => {
    const val = scores[dimKey][sub];
    if (typeof val === 'number') {
      subScores[sub] = val;
      weightedSum += val;
      totalWeight += 1;
    }
  });

  if (totalWeight === 0) return { score: 0, sub_scores: {}, warning: 'no_sub_scores' };
  return {
    score: +(weightedSum / totalWeight).toFixed(1),
    sub_scores: subScores,
  };
}

function calcQScore(scores) {
  const dimensions = {};
  let totalWeighted = 0;
  let totalWeight = 0;

  Object.keys(DIMENSION_WEIGHTS).forEach(key => {
    const dim = calcDimensionScore(scores, key);
    dimensions[key] = dim;
    if (dim.warning !== 'missing') {
      totalWeighted += dim.score * DIMENSION_WEIGHTS[key].weight;
      totalWeight += DIMENSION_WEIGHTS[key].weight;
    }
  });

  const qScore = totalWeight > 0 ? +(totalWeighted / totalWeight).toFixed(1) : 0;
  const grade = qScore >= 9.0 ? '出版级' : qScore >= 8.5 ? '优秀' : qScore >= 7.5 ? '可发布' : qScore >= 6.0 ? '需修改' : '需重写';

  return { q_score: qScore, grade, dimensions, effective_weight: +totalWeight.toFixed(2) };
}

function chapterGateScore(scores) {
  // 单章仅评 ③⑥⑦
  const chapterDims = {};
  ['writing_language', 'emotional_impact', 'enjoyment_engagement'].forEach(key => {
    chapterDims[key] = calcDimensionScore(scores, key);
  });

  const avgScore = Object.values(chapterDims).reduce((s, d) => s + d.score, 0) / 3;
  const allPassed = Object.values(chapterDims).every(d => d.score >= 7.0);
  const warnings = Object.entries(chapterDims)
    .filter(([, d]) => d.score >= 5.0 && d.score < 7.0)
    .map(([k, d]) => `${DIMENSION_WEIGHTS[k].name}: ${d.score} (接近阈值)`);
  const failures = Object.entries(chapterDims)
    .filter(([, d]) => d.score < 5.0)
    .map(([k, d]) => `${DIMENSION_WEIGHTS[k].name}: ${d.score} (未通过)`);

  return {
    chapter_q_score: +avgScore.toFixed(1),
    passed: allPassed,
    gate: allPassed ? 'passed' : (failures.length > 0 ? 'failed' : 'warning'),
    warnings,
    failures,
    dimensions: chapterDims,
  };
}

function calcTrend(history) {
  // history: [{range: "1-10", q_score: 7.8, dimensions: {...}}, ...]
  const numEntries = history.length;
  if (numEntries < 2) return { trend: 'insufficient_data', details: '需要至少 2 个数据点' };

  const latest = history[numEntries - 1];
  const previous = history[numEntries - 2];
  const delta = +(latest.q_score - previous.q_score).toFixed(1);

  let trend;
  if (delta > 0.3) trend = '↑ 显著上升';
  else if (delta > 0) trend = '↗ 轻微上升';
  else if (delta === 0) trend = '→ 稳定';
  else if (delta > -0.3) trend = '↘ 轻微下降';
  else trend = '↓ 显著下降';

  // 风险检测
  const risks = [];
  const dimKeys = Object.keys(DIMENSION_WEIGHTS);

  // 连续下滑检测
  if (numEntries >= 3) {
    dimKeys.forEach(key => {
      const last3 = history.slice(-3).map(h => (h.dimensions[key] || {}).score || 0);
      if (last3[2] < last3[1] && last3[1] < last3[0]) {
        risks.push(`⚠️ ${DIMENSION_WEIGHTS[key].name} 连续3周期下滑`);
      }
    });
  }

  // 不均衡检测
  const latestDims = latest.dimensions || {};
  const dimScores = dimKeys.map(k => (latestDims[k] || {}).score || 0).filter(s => s > 0);
  if (dimScores.length >= 4) {
    const maxD = Math.max(...dimScores);
    const minD = Math.min(...dimScores);
    if (maxD - minD > 3) {
      risks.push(`⚠️ 维度不均衡: 最高${maxD} - 最低${minD} = ${+(maxD - minD).toFixed(1)} (阈值3)`);
    }
  }

  return {
    entries: numEntries,
    latest_q_score: latest.q_score,
    delta,
    trend,
    risks,
    recommendation: trend.includes('下降') ? '建议暂停并根因分析' : trend.includes('上升') ? '继续保持当前方向' : '关注风险项',
  };
}

// ===== CLI =====

if (!cmd || !target) {
  console.log(`
qscore — 八维质量评分计算器 v1.0

Usage:
  node index.js chapter <scores.json>     # 单章评分 (维度 ③⑥⑦)
  node index.js milestone <scores.json>   # 每10章全身体检 (全8维)
  node index.js final <scores.json>       # 全书 Q-Score
  node index.js trend <history.json>      # 趋势分析

Input JSON format (chapter):
  { "writing_language": {"fluency": 8.5, "voice": 7.0, "description_balance": 8.0},
    "emotional_impact": {"range": 7.0, "payoff": 8.0, "empathy": 7.5},
    "enjoyment_engagement": {"hook_density": 9.0, "payoff_density": 7.0, "info_pacing": 8.0} }

Input JSON format (milestone/final): add all 8 dimensions with sub-scores.
  `);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(target, 'utf-8'));

switch (cmd) {
  case 'chapter':
    console.log(JSON.stringify(chapterGateScore(data), null, 2));
    break;
  case 'milestone':
  case 'final': {
    const result = calcQScore(data);
    result.type = cmd;
    console.log(JSON.stringify(result, null, 2));
    break;
  }
  case 'trend':
    console.log(JSON.stringify(calcTrend(data), null, 2));
    break;
  default:
    console.error(`未知命令: ${cmd}`);
    process.exit(1);
}
