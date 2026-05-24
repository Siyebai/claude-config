#!/usr/bin/env node
/**
 * Beat Calculator — Save the Cat 节拍计算器 v1.0
 *
 * 输入总章节数 → 输出完整15节拍表 + 三档节奏配额 + Anti-Rush Brake
 *
 * Usage:
 *   node index.js <totalChapters>              # JSON 节拍表
 *   node index.js <totalChapters> --markdown   # Markdown 格式
 *   node index.js <totalChapters> --quota      # 仅输出节奏配额
 */

const totalChapters = parseInt(process.argv[2]);
const format = process.argv.includes('--markdown') ? 'markdown' : 'json';
const quotaOnly = process.argv.includes('--quota');

if (!totalChapters || totalChapters < 10) {
  console.error('Usage: node index.js <totalChapters> [--markdown] [--quota]');
  console.error('  totalChapters must be >= 10');
  process.exit(1);
}

// ===== 15 节拍定义 =====
const BEATS = [
  { id: 1,  name: '开场画面',   en: 'Opening Image',   pos: 0.01, desc: '建立日常+展示缺陷' },
  { id: 2,  name: '主题陈述',   en: 'Theme Stated',     pos: 0.05, desc: '暗示主题的对话/事件' },
  { id: 3,  name: '铺垫',       en: 'Set-Up',           pos: 0.10, desc: '扩展开场，展示主角六个面' },
  { id: 4,  name: '催化剂',     en: 'Catalyst',         pos: 0.10, desc: '打破日常的事件' },
  { id: 5,  name: '犹豫',       en: 'Debate',           pos: 0.15, desc: '主角抗拒改变' },
  { id: 6,  name: '第二幕开启', en: 'Break into Two',   pos: 0.20, desc: '跨过门槛，进入新世界' },
  { id: 7,  name: 'B故事',      en: 'B Story',          pos: 0.22, desc: '副线/爱情线启动' },
  { id: 8,  name: '娱乐游戏',   en: 'Fun and Games',    pos: 0.35, desc: '承诺的"好看"部分' },
  { id: 9,  name: '中点',       en: 'Midpoint',         pos: 0.55, desc: '假胜利或假失败， stakes 升级' },
  { id: 10, name: '反派逼近',   en: 'Bad Guys Close In', pos: 0.65, desc: '压力升级，空间收窄' },
  { id: 11, name: '一无所有',   en: 'All Is Lost',      pos: 0.75, desc: '最黑暗时刻' },
  { id: 12, name: '灵魂黑夜',   en: 'Dark Night of Soul', pos: 0.80, desc: '反思+觉醒' },
  { id: 13, name: '第三幕开启', en: 'Break into Three', pos: 0.85, desc: '新方案/最后一搏' },
  { id: 14, name: '结局',       en: 'Finale',           pos: 0.92, desc: '最终对决' },
  { id: 15, name: '终场画面',   en: 'Final Image',      pos: 0.99, desc: '与开场对照，回响' },
];

// ===== 章节类型 =====
const CHAPTER_TYPES = {
  fast: { name: '快档(主线推进)', density: '高', description: '中低', dialogue: '40-60%', info: '大量新信息' },
  medium: { name: '中档(发展铺垫)', density: '中', description: '中', dialogue: '30-50%', info: '中等信息' },
  slow: { name: '慢档(消化期)', density: '中高', description: '中高', dialogue: '50-70%', info: '少量信息' },
};

// ===== 计算 =====

function calcBeats(total) {
  return BEATS.map(b => ({
    ...b,
    chapter: Math.max(1, Math.round(b.pos * total)),
    chapter_range: getChapterRange(b, total),
  }));
}

function getChapterRange(beat, total) {
  const ranges = {
    1:  [1, 3],
    2:  [Math.round(0.03 * total), Math.round(0.07 * total)],
    3:  [Math.round(0.06 * total), Math.round(0.10 * total)],
    4:  [Math.round(0.09 * total), Math.round(0.12 * total)],
    5:  [Math.round(0.10 * total), Math.round(0.20 * total)],
    6:  [Math.round(0.18 * total), Math.round(0.22 * total)],
    7:  [Math.round(0.20 * total), Math.round(0.25 * total)],
    8:  [Math.round(0.20 * total), Math.round(0.55 * total)],
    9:  [Math.round(0.50 * total), Math.round(0.58 * total)],
    10: [Math.round(0.55 * total), Math.round(0.75 * total)],
    11: [Math.round(0.70 * total), Math.round(0.80 * total)],
    12: [Math.round(0.75 * total), Math.round(0.85 * total)],
    13: [Math.round(0.80 * total), Math.round(0.88 * total)],
    14: [Math.round(0.85 * total), total - 2],
    15: [total - 1, total],
  };
  return ranges[beat.id] || [beat.chapter, beat.chapter];
}

function calcRhythmQuota(total) {
  // 目标比例: 快:中:慢 = 2:5:3
  const fastCount = Math.round(total * 0.2);
  const mediumCount = Math.round(total * 0.5);
  const slowCount = total - fastCount - mediumCount;

  // 分配特定章节类型
  const assignments = [];
  const fastChapters = new Set();
  const slowChapters = new Set();

  // 催化章: 100% 快档
  const catalyst = Math.round(0.10 * total);
  fastChapters.add(catalyst);

  // 中点: 100% 快档
  const midpoint = Math.round(0.55 * total);
  fastChapters.add(midpoint);

  // 一无所有: 100% 快档
  const allIsLost = Math.round(0.75 * total);
  fastChapters.add(allIsLost);

  // 结局: 100% 快档
  const finaleStart = Math.round(0.85 * total);
  for (let c = finaleStart; c <= total; c++) {
    fastChapters.add(c);
  }

  // 灵魂黑夜: 100% 慢档
  const darkNight = Math.round(0.80 * total);
  slowChapters.add(darkNight);
  slowChapters.add(darkNight + 1);

  // 终场画面: 100% 慢档
  slowChapters.add(total);

  // 填充剩余快档/慢档
  let remainingFast = fastCount - fastChapters.size;
  let remainingSlow = slowCount - slowChapters.size;

  // 均匀分布剩余的快档和慢档
  const stepFast = Math.floor(total / Math.max(remainingFast, 1));
  const stepSlow = Math.floor(total / Math.max(remainingSlow, 1));

  for (let c = 1; c <= total; c++) {
    if (fastChapters.has(c) || slowChapters.has(c)) continue;
    if (remainingFast > 0 && c % stepFast === 0) {
      fastChapters.add(c);
      remainingFast--;
    } else if (remainingSlow > 0 && c % stepSlow === 0) {
      slowChapters.add(c);
      remainingSlow--;
    }
  }

  // 为每章分配类型
  for (let c = 1; c <= total; c++) {
    let type;
    if (fastChapters.has(c)) type = 'fast';
    else if (slowChapters.has(c)) type = 'slow';
    else type = 'medium';

    assignments.push({ chapter: c, type, ...CHAPTER_TYPES[type] });
  }

  return {
    total,
    quota: { fast: fastCount, medium: mediumCount, slow: slowCount },
    target_ratio: '2:5:3',
    actual: {
      fast: assignments.filter(a => a.type === 'fast').length,
      medium: assignments.filter(a => a.type === 'medium').length,
      slow: assignments.filter(a => a.type === 'slow').length,
    },
    anti_rush: {
      max_consecutive_fast: 1,
      rule: '消耗A→下章慢档/中档 | 消耗B→下章中档 | 消耗C→下章慢档',
    },
    assignments,
  };
}

// ===== 输出 =====

const beats = calcBeats(totalChapters);
const rhythm = calcRhythmQuota(totalChapters);

if (quotaOnly) {
  console.log(JSON.stringify(rhythm, null, 2));
  process.exit(0);
}

if (format === 'markdown') {
  console.log(`# Save the Cat 节拍表 — ${totalChapters} 章\n`);
  console.log('| # | 节拍 | 英文 | 位置% | 对应章节 | 章节范围 |');
  console.log('|---|------|------|-------|---------|---------|');
  beats.forEach(b => {
    console.log(`| ${b.id} | ${b.name} | ${b.en} | ${Math.round(b.pos * 100)}% | 第${b.chapter}章 | ${b.chapter_range[0]}-${b.chapter_range[1]}章 |`);
  });
  console.log(`\n## 节奏配额`);
  console.log(`- 快档: ${rhythm.actual.fast}章 / 中档: ${rhythm.actual.medium}章 / 慢档: ${rhythm.actual.slow}章`);
  console.log(`- 目标比例: ${rhythm.target_ratio} | 实际: ${rhythm.actual.fast}:${rhythm.actual.medium}:${rhythm.actual.slow}`);
  console.log(`\n## Anti-Rush 规则`);
  console.log(`- ${rhythm.anti_rush.rule}`);
  console.log(`- 每章至多消耗 1 项配额 (A主线/B关系/C秘密)`);
} else {
  console.log(JSON.stringify({ total_chapters: totalChapters, beats, rhythm }, null, 2));
}
