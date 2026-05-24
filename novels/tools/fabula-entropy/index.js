#!/usr/bin/env node
/**
 * Fabula Entropy — 一致性度量引擎 v1.0
 *
 * ETC (过渡一致性熵) + EWC (世界一致性熵) + 对数距离衰减
 * 整合: novel-plot-simulation-engine.md + WenShape + InkOS truth files
 *
 * Usage:
 *   node index.js extract <chapter.md>                          # 从章节提取事实 → JSONL
 *   node index.js etc <project-dir> <chapter1> <chapter2>       # 计算过渡一致性熵
 *   node index.js ewc <project-dir> <chapter>                   # 计算世界一致性熵
 *   node index.js facts <project-dir>                           # 列出所有规范事实
 *   node index.js decay <project-dir> <current-chapter>         # 计算距离衰减权重
 */

const fs = require('fs');
const path = require('path');

// ===== WenShape 对数距离衰减 =====
function distanceDecay(factChapter, currentChapter, alpha = 0.3) {
  const distance = Math.abs(currentChapter - factChapter);
  return 1.0 / (1.0 + alpha * Math.log(1 + distance));
}

// ===== 事实提取 (基于 novel-creator-skill + WenShape) =====
function extractFacts(chapterText, chapterNum) {
  const body = chapterText.replace(/#+\s.*/g, ''); // 去标题
  const facts = [];
  let factId = 0;

  // 提取模式: 角色状态陈述
  const charStatePatterns = [
    /(\S{2,4})站在(\S+)/g,
    /(\S{2,4})拿着(\S+)/g,
    /(\S{2,4})来到(\S+)/g,
    /(\S{2,4})对(\S{2,4})说/g,
    /(\S{2,4})的(\S+)被(\S+)/g,
  ];

  // 提取模式: 世界设定陈述
  const worldPatterns = [
    /(\S+)是(\S+)的(\S+)/g,
    /(\S+)可以(\S+)/g,
    /(\S+)不能(\S+)/g,
  ];

  charStatePatterns.forEach(pattern => {
    let m;
    while ((m = pattern.exec(body)) !== null) {
      factId++;
      facts.push({
        id: `F${String(factId).padStart(4, '0')}`,
        statement: m[0],
        type: 'character_state',
        chapter: chapterNum,
        confidence: 0.8,
      });
    }
  });

  worldPatterns.forEach(pattern => {
    let m;
    while ((m = pattern.exec(body)) !== null) {
      factId++;
      facts.push({
        id: `F${String(factId).padStart(4, '0')}`,
        statement: m[0],
        type: 'world_fact',
        chapter: chapterNum,
        confidence: 0.7,
      });
    }
  });

  // 限制数量: 每章最多50条
  return facts.slice(0, 50);
}

// ===== 事实评分 (WenShape scoring function) =====
function scoreFact(fact) {
  let score = 0;
  const s = fact.statement;

  // 长度评分 (每18字最多2.0分)
  score += Math.min(s.length / 18 * 2.0, 2.0);

  // 标点奖励
  const punctCount = (s.match(/[，；：（）]/g) || []).length;
  score += Math.min(punctCount * 0.2, 0.7);

  // 数字奖励
  if (/\d/.test(s)) score += 0.3;

  // 密度提示奖励
  const densityHints = ['规则', '禁忌', '秘密', '交易', '背叛', '必须', '绝不', '永远', '禁止'];
  densityHints.forEach(hint => {
    if (s.includes(hint)) score += 0.8;
  });

  // 简单关系惩罚
  const simpleRelations = ['是', '的母亲', '的父亲', '的兄弟', '的姐妹', '的儿子', '的女儿'];
  simpleRelations.forEach(rel => {
    if (s.includes(rel)) score -= 0.6;
  });

  return Math.max(0, Math.min(score, 5.0));
}

// ===== ETC: 过渡一致性熵 =====
// 对相邻章节评估因果合理性
function calcETC(prevFacts, nextFacts, prevChapter, nextChapter) {
  // 找出跨章节的关联事实
  const pairs = [];
  prevFacts.forEach(pf => {
    nextFacts.forEach(nf => {
      // 简单关键词重叠 = 可能有因果联系
      const overlap = keywordOverlap(pf.statement, nf.statement);
      if (overlap > 0.3) {
        pairs.push({ prev: pf, next: nf, overlap });
      }
    });
  });

  // ETC: 越高的重叠度 = 越好的连贯性
  // ETC = 1.0 - normalized_overlap (越低越好)
  if (pairs.length === 0) {
    return { etc_score: 4.0, pairs_found: 0, assessment: '完全不连贯 — 章节之间无因果联系', grade: 'FAIL' };
  }

  const avgOverlap = pairs.reduce((s, p) => s + p.overlap, 0) / pairs.length;
  const etcScore = +(5.0 * (1 - avgOverlap)).toFixed(1); // 映射到 1-5

  const grade = etcScore <= 2.0 ? 'PASS' : etcScore <= 3.0 ? 'WARN' : 'FAIL';

  return {
    etc_score: Math.max(1, Math.min(5, etcScore)),
    pairs_found: pairs.length,
    avg_causal_overlap: +avgOverlap.toFixed(2),
    assessment: etcScore <= 2.0 ? '非常连贯' : etcScore <= 3.0 ? '基本连贯，有少量跳跃' : '不连贯',
    grade,
    target: '≤ 2.0',
  };
}

// ===== EWC: 世界一致性熵 =====
function calcEWC(allFacts, currentChapter, alpha = 0.3) {
  if (allFacts.length < 2) {
    return { ewc_score: 1.0, fact_count: allFacts.length, assessment: '数据不足', grade: 'PASS' };
  }

  // 采样: 随机选取10个事实
  const sampled = [];
  const indices = new Set();
  while (sampled.length < Math.min(10, allFacts.length)) {
    const idx = Math.floor(Math.random() * allFacts.length);
    if (!indices.has(idx)) {
      indices.add(idx);
      sampled.push(allFacts[idx]);
    }
  }

  // 跨章一致性检查: 对每个事实，检查它与其他事实的一致性
  let inconsistencyScore = 0;
  const checks = [];

  for (let i = 0; i < sampled.length; i++) {
    for (let j = i + 1; j < sampled.length; j++) {
      const a = sampled[i];
      const b = sampled[j];

      // 不同章节的事实更可能检测到矛盾
      if (a.chapter !== b.chapter && a.type === b.type) {
        const overlap = keywordOverlap(a.statement, b.statement);
        // 同类型事实重叠度极低 → 可能不一致
        const decayWeight = distanceDecay(Math.abs(a.chapter - b.chapter), 0, alpha);

        if (overlap < 0.1 && a.type === 'world_fact') {
          inconsistencyScore += decayWeight;
          checks.push({
            fact_a: a,
            fact_b: b,
            type: 'potential_contradiction',
            severity: decayWeight,
          });
        }
      }
    }
  }

  const ewcScore = +(1.0 + inconsistencyScore).toFixed(1);

  return {
    ewc_score: Math.min(5, ewcScore),
    fact_count: allFacts.length,
    sampled_count: sampled.length,
    inconsistency_score: +inconsistencyScore.toFixed(2),
    checks_with_issues: checks.length,
    grade: ewcScore <= 1.5 ? 'PASS' : ewcScore <= 2.5 ? 'WARN' : 'FAIL',
    target: '≤ 1.5',
  };
}

// ===== 关键词重叠计算 =====
function keywordOverlap(textA, textB) {
  const tokenize = s => {
    const tokens = [];
    for (let i = 0; i < s.length - 1; i++) {
      const bigram = s.slice(i, i + 2);
      if (/^[一-鿿]{2}$/.test(bigram)) tokens.push(bigram);
    }
    return new Set(tokens);
  };

  const setA = tokenize(textA);
  const setB = tokenize(textB);
  if (setA.size === 0 || setB.size === 0) return 0;

  const intersection = new Set([...setA].filter(x => setB.has(x)));
  return intersection.size / Math.max(setA.size, setB.size);
}

// ===== JSONL 管理 =====
function loadFacts(projectDir) {
  const jsonlPath = path.join(projectDir, 'canon', 'facts.jsonl');
  if (!fs.existsSync(jsonlPath)) return [];
  const content = fs.readFileSync(jsonlPath, 'utf-8').trim();
  if (!content) return [];
  return content.split('\n').map(line => JSON.parse(line));
}

function saveFacts(projectDir, facts) {
  const jsonlPath = path.join(projectDir, 'canon', 'facts.jsonl');
  const dir = path.dirname(jsonlPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(jsonlPath, facts.map(f => JSON.stringify(f)).join('\n') + '\n', 'utf-8');
}

// ===== 三层知识过滤 (← AI_NovelGenerator 4.7k⭐) =====

// Tier 1: 冲突检测 — 删除重复度>40%的事实
function detectConflicts(facts) {
  const conflicts = [];
  const toRemove = new Set();

  for (let i = 0; i < facts.length; i++) {
    for (let j = i + 1; j < facts.length; j++) {
      const overlap = keywordOverlap(facts[i].statement, facts[j].statement);
      if (overlap > 0.4) {
        // 保留分数更高的
        const scoreA = scoreFact(facts[i]);
        const scoreB = scoreFact(facts[j]);
        if (scoreA >= scoreB) {
          toRemove.add(facts[j].id);
          conflicts.push({ kept: facts[i].id, removed: facts[j].id, overlap: +overlap.toFixed(2), reason: '重复度>40%' });
        } else {
          toRemove.add(facts[i].id);
          conflicts.push({ kept: facts[j].id, removed: facts[i].id, overlap: +overlap.toFixed(2), reason: '重复度>40%' });
        }
      }
    }
  }

  return { conflicts, dedupedFacts: facts.filter(f => !toRemove.has(f.id)), removedCount: toRemove.size };
}

// Tier 2: 价值评估 — 关键 vs 次要事实
function assessValue(facts) {
  const densityHints = ['规则', '禁忌', '秘密', '交易', '背叛', '必须', '绝不', '永远', '禁止', '死亡', '力量', '真相'];
  const minorHints = ['说道', '看着', '走着', '站着', '坐下', '点头', '微笑', '叹气'];

  return facts.map(f => {
    let value = 'medium';
    const s = f.statement;

    const criticalScore = densityHints.reduce((score, hint) => score + (s.includes(hint) ? 1 : 0), 0);
    const minorScore = minorHints.reduce((score, hint) => score + (s.includes(hint) ? 1 : 0), 0);

    if (criticalScore >= 2) value = 'critical';
    else if (minorScore >= 2) value = 'minor';

    return { ...f, value };
  });
}

// Tier 3: 结构重组 — 四类事实分桶
function categorizeFacts(facts) {
  const categories = {
    character: { label: '角色', facts: [] },
    plot: { label: '情节', facts: [] },
    world: { label: '世界观', facts: [] },
    theme: { label: '主题', facts: [] },
  };

  facts.forEach(f => {
    if (f.type === 'character_state') {
      categories.character.facts.push(f);
    } else if (f.type === 'world_fact') {
      // 进一步区分: 世界观 vs 情节
      const s = f.statement;
      const plotHints = ['发生', '来到', '说出', '发现', '决定', '杀死', '战斗', '逃跑'];
      if (plotHints.some(h => s.includes(h))) {
        categories.plot.facts.push({ ...f, type: 'plot_event' });
      } else {
        categories.world.facts.push(f);
      }
    }
  });

  return categories;
}

// ===== 内容去重 (← AI_NovelGenerator 时间距离去重规则) =====

function temporalDedup(allFacts, currentChapter) {
  const issues = [];
  const seenStatements = new Map(); // statement_signature → { chapter, fact }

  allFacts.forEach(f => {
    // 生成语句签名 (取前10字 + 类型)
    const sig = f.statement.substring(0, 10) + '|' + f.type;

    if (seenStatements.has(sig)) {
      const prev = seenStatements.get(sig);
      const distance = f.chapter - prev.fact.chapter;

      if (distance < 0) return; // 跳过未来的事实

      let action;
      if (distance <= 2) {
        action = 'SKIP';
      } else if (distance <= 5) {
        action = 'REWRITE_40P';
      } else {
        action = 'OK';
      }

      issues.push({
        statement_sig: sig,
        first_appearance: prev.fact.chapter,
        reappearance: f.chapter,
        distance,
        action,
        prev_statement: prev.fact.statement.substring(0, 60),
        curr_statement: f.statement.substring(0, 60),
      });
    } else {
      seenStatements.set(sig, { chapter: f.chapter, fact: f });
    }
  });

  // 统计
  const skipCount = issues.filter(i => i.action === 'SKIP').length;
  const rewriteCount = issues.filter(i => i.action === 'REWRITE_40P').length;
  const okCount = issues.filter(i => i.action === 'OK').length;

  return {
    engine: 'fabula-entropy dedup v1.0',
    total_facts: allFacts.length,
    dedup_issues: issues.length,
    summary: {
      skip: skipCount,
      rewrite_40p: rewriteCount,
      ok: okCount,
    },
    issues,
    grade: skipCount > 0 ? 'WARN' : 'PASS',
  };
}

// ===== 综合知识审计 =====

function auditKnowledge(projectDir) {
  const allFacts = loadFacts(projectDir);
  if (allFacts.length === 0) return { error: '无事实数据' };

  const chapters = [...new Set(allFacts.map(f => f.chapter))].sort();
  const currentChapter = chapters[chapters.length - 1] || 1;

  // Tier 1: 冲突检测
  const conflictResult = detectConflicts(allFacts);

  // Tier 2: 价值评估
  const valuedFacts = assessValue(conflictResult.dedupedFacts);

  // Tier 3: 结构重组
  const categorized = categorizeFacts(valuedFacts);

  // 时间去重
  const dedupResult = temporalDedup(allFacts, currentChapter);

  return {
    engine: 'fabula-entropy knowledge-audit v1.0',
    original_facts: allFacts.length,
    after_dedup: conflictResult.dedupedFacts.length,
    conflicts_removed: conflictResult.removedCount,
    value_distribution: {
      critical: valuedFacts.filter(f => f.value === 'critical').length,
      medium: valuedFacts.filter(f => f.value === 'medium').length,
      minor: valuedFacts.filter(f => f.value === 'minor').length,
    },
    categories: {
      character: categorized.character.facts.length,
      plot: categorized.plot.facts.length,
      world: categorized.world.facts.length,
      theme: categorized.theme.facts.length,
    },
    temporal_dedup: dedupResult,
    overall_grade: conflictResult.removedCount > allFacts.length * 0.2 ? 'WARN' : 'PASS',
  };
}

// ===== CLI =====

const cmd = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

function usage() {
  console.log(`
fabula-entropy — 一致性度量引擎 v1.1

Usage:
  node index.js extract <chapter-file> [chapter-num]
      从章节提取事实 → 输出 JSONL (stdout)

  node index.js etc <project-dir> <ch1-num> <ch2-num>
      计算相邻章节的过渡一致性熵 (ETC)

  node index.js ewc <project-dir>
      计算全局世界一致性熵 (EWC)

  node index.js facts <project-dir>
      列出所有规范事实 + 距离衰减权重

  node index.js batch <project-dir>
      批量处理所有章节 (extract → ETC → EWC → report)

  node index.js dedup <project-dir>
      时间距离内容去重检查 (<2章SKIP / 3-5章改写≥40% / >5章OK)

  node index.js audit <project-dir>
      综合知识审计 (三层过滤 + 价值评估 + 结构重组 + 去重)
  `);
}

if (!cmd) { usage(); process.exit(1); }

switch (cmd) {
  case 'extract': {
    if (!arg1) { console.error('需要章节文件路径'); process.exit(1); }
    const text = fs.readFileSync(arg1, 'utf-8');
    const chapterNum = parseInt(arg2) || 1;
    const facts = extractFacts(text, chapterNum);
    console.log(facts.map(f => JSON.stringify(f)).join('\n'));
    break;
  }

  case 'etc': {
    if (!arg1 || !arg2) { console.error('Usage: fabula-entropy etc <project-dir> <ch1> <ch2>'); process.exit(1); }
    const allFacts = loadFacts(arg1);
    const ch1 = parseInt(arg2);
    const ch2 = parseInt(process.argv[5]);

    if (allFacts.length === 0) {
      console.log('{"error":"未找到事实数据，先运行: node index.js batch <project-dir>"}');
      process.exit(1);
    }

    const prevFacts = allFacts.filter(f => f.chapter === ch1);
    const nextFacts = allFacts.filter(f => f.chapter === ch2);

    const result = calcETC(prevFacts, nextFacts, ch1, ch2);
    console.log(JSON.stringify(result, null, 2));
    break;
  }

  case 'ewc': {
    const allFacts = loadFacts(arg1);
    const result = calcEWC(allFacts, 0);
    console.log(JSON.stringify(result, null, 2));
    break;
  }

  case 'facts': {
    const allFacts = loadFacts(arg1);
    const currentChapter = parseInt(arg2) || 1;
    const weighted = allFacts.map(f => ({
      ...f,
      score: +scoreFact(f).toFixed(1),
      decay_weight: +distanceDecay(f.chapter, currentChapter).toFixed(3),
    }));
    // 按加权分数排序 (score * decay_weight)
    weighted.sort((a, b) => (b.score * b.decay_weight) - (a.score * a.decay_weight));
    console.log(JSON.stringify(weighted.slice(0, 30), null, 2));
    break;
  }

  case 'batch': {
    if (!arg1) { console.error('需要项目目录'); process.exit(1); }
    const volDir = path.join(arg1, '04_manuscript', 'vol_01');
    if (!fs.existsSync(volDir)) { console.error(`未找到手稿目录: ${volDir}`); process.exit(1); }

    const chapters = fs.readdirSync(volDir)
      .filter(f => f.endsWith('.md'))
      .sort();

    console.error(`批量处理 ${chapters.length} 章...`);

    // Step 1: 提取所有事实
    const allFacts = [];
    chapters.forEach((file, idx) => {
      const chapterNum = idx + 1;
      const text = fs.readFileSync(path.join(volDir, file), 'utf-8');
      const facts = extractFacts(text, chapterNum);
      allFacts.push(...facts);
    });

    saveFacts(arg1, allFacts);
    console.error(`✅ 提取了 ${allFacts.length} 条事实 → canon/facts.jsonl`);

    // Step 2: 计算 ETC (所有相邻章节对)
    const etcScores = [];
    for (let i = 1; i < chapters.length; i++) {
      const prevFacts = allFacts.filter(f => f.chapter === i);
      const nextFacts = allFacts.filter(f => f.chapter === i + 1);
      const etc = calcETC(prevFacts, nextFacts, i, i + 1);
      etcScores.push({ from_chapter: i, to_chapter: i + 1, ...etc });
    }

    // Step 3: 计算 EWC
    const ewc = calcEWC(allFacts, chapters.length);

    // Step 4: 综合报告
    const avgETC = etcScores.reduce((s, e) => s + e.etc_score, 0) / etcScores.length;
    const failedETC = etcScores.filter(e => e.grade === 'FAIL').length;

    const report = {
      engine: 'fabula-entropy v1.0',
      chapters_processed: chapters.length,
      total_facts: allFacts.length,
      etc: {
        average: +avgETC.toFixed(2),
        target: '≤ 2.0',
        failed_pairs: failedETC,
        total_pairs: etcScores.length,
        details: etcScores,
      },
      ewc,
      overall_grade: (avgETC <= 2.0 && ewc.ewc_score <= 1.5) ? 'PASS' : 'WARN',
    };

    console.log(JSON.stringify(report, null, 2));
    break;
  }

  case 'dedup': {
    if (!arg1) { console.error('需要项目目录'); process.exit(1); }
    const allFacts = loadFacts(arg1);
    if (allFacts.length === 0) {
      console.log(JSON.stringify({ error: '无事实数据，先运行 batch' }));
      process.exit(1);
    }
    const chapters = [...new Set(allFacts.map(f => f.chapter))].sort();
    const result = temporalDedup(allFacts, chapters[chapters.length - 1]);
    console.log(JSON.stringify(result, null, 2));
    break;
  }

  case 'audit': {
    if (!arg1) { console.error('需要项目目录'); process.exit(1); }
    const result = auditKnowledge(arg1);
    console.log(JSON.stringify(result, null, 2));
    break;
  }

  default:
    console.error(`未知命令: ${cmd}`);
    usage();
    process.exit(1);
}
