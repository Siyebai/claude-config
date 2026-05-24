#!/usr/bin/env node
/**
 * Style Checker — 风格偏差检测引擎 v1.0
 *
 * 基于 style-profile-template.md 的四维风格参数 + 语言指纹
 * 整合 AI-Novel-Writing-Assistant 风格契约编译器概念
 * 整合 Long-Novel-GPT 文本分块分析策略
 *
 * Usage:
 *   node index.js profile <chapter-file>           # 从章节提取风格档案
 *   node index.js check <chapter-file> <profile>   # 检查章节是否符合风格档案
 *   node index.js diff <file-a> <file-b>           # 比较两段文本风格差异
 *   node index.js batch <project-dir>              # 批量检查全书风格一致性
 */

const fs = require('fs');
const path = require('path');

// ===== 文本分析引擎 =====

function tokenize(text) {
  return text.replace(/#+\s.*/g, ''); // 去 Markdown 标题
}

function splitSentences(text) {
  const clean = tokenize(text);
  // 中文分句: 按 。！？!? 断句，保留引号内对话
  const sentences = clean.split(/(?<=[。！？!?\n])\s*/g)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  return sentences;
}

function splitParagraphs(text) {
  const clean = tokenize(text);
  return clean.split(/\n{2,}/).map(p => p.trim()).filter(p => p.length > 0);
}

// ===== 四维风格参数提取 =====

function analyzeSentenceLength(sentences) {
  const lengths = sentences.map(s => s.replace(/\s/g, '').length);
  if (lengths.length === 0) return { avg: 0, min: 0, max: 0, distribution: {} };

  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const sorted = [...lengths].sort((a, b) => a - b);

  // 短/中/长句分布
  const distribution = {
    short: lengths.filter(l => l <= 12).length / lengths.length,    // ≤12字
    medium: lengths.filter(l => l > 12 && l <= 25).length / lengths.length, // 13-25字
    long: lengths.filter(l => l > 25 && l <= 40).length / lengths.length,   // 26-40字
    very_long: lengths.filter(l => l > 40).length / lengths.length,         // >40字
  };

  return {
    avg: +avg.toFixed(1),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    median: sorted[Math.floor(sorted.length / 2)],
    p25: sorted[Math.floor(sorted.length * 0.25)],
    p75: sorted[Math.floor(sorted.length * 0.75)],
    std: +Math.sqrt(lengths.reduce((s, l) => s + (l - avg) ** 2, 0) / lengths.length).toFixed(1),
    distribution,
    count: lengths.length,
  };
}

function analyzeDialogue(text) {
  const clean = tokenize(text);
  const totalChars = clean.replace(/\s/g, '').length;

  // 中文引号对话检测
  const dialoguePatterns = [
    /"[^"]{2,}"/g,        // 双引号
    /"[^"]{2,}"/g,        // 中文左引号+右引号
    /「[^」]{2,}」/g,      // 日式引号
    /『[^』]{2,}』/g,      // 日式双引号
  ];

  let dialogueChars = 0;
  dialoguePatterns.forEach(pattern => {
    let m;
    while ((m = pattern.exec(clean)) !== null) {
      dialogueChars += m[0].replace(/\s/g, '').length;
    }
  });

  // 直接对话行检测 (冒号+引号模式)
  const directSpeechPattern = /[^：:\s]{2,4}[：:]\s*[""「『]/g;
  let directSpeechCount = 0;
  let m2;
  while ((m2 = directSpeechPattern.exec(clean)) !== null) {
    directSpeechCount++;
  }

  const ratio = totalChars > 0 ? +(dialogueChars / totalChars).toFixed(3) : 0;

  return {
    dialogue_ratio: ratio,
    direct_speech_lines: directSpeechCount,
    level: ratio < 0.15 ? 'narration_heavy' : ratio < 0.30 ? 'balanced' : ratio < 0.45 ? 'dialogue_rich' : 'script_like',
  };
}

function analyzeModifiers(text) {
  const clean = tokenize(text);
  const totalChars = clean.replace(/\s/g, '').length;

  // 弱化副词 (对应 style_profile forbidden weak_modifiers)
  const weakAdverbs = ['很', '非常', '真的', '特别', '极其', '无比', '颇为', '稍微', '颇', '好', '太'];
  // "地"字结构副词
  const deAdverbPattern = /\S{1,3}地/g;

  let weakCount = 0;
  weakAdverbs.forEach(w => {
    const re = new RegExp(w, 'g');
    const matches = clean.match(re);
    if (matches) weakCount += matches.length;
  });

  const deMatches = clean.match(deAdverbPattern) || [];

  const charsPerThousand = totalChars > 0 ? 1000 : 1000;
  const weakPerThousand = +(weakCount / totalChars * charsPerThousand).toFixed(1);
  const dePerThousand = +(deMatches.length / totalChars * charsPerThousand).toFixed(1);

  return {
    weak_adverbs_per_k: weakPerThousand,
    de_adverbs_per_k: dePerThousand,
    total_modifier_density: +((weakPerThousand + dePerThousand) / 2).toFixed(1),
    level: weakPerThousand <= 2 ? 'clean' : weakPerThousand <= 5 ? 'moderate' : 'heavy',
  };
}

function analyzeParagraphRhythm(paragraphs) {
  const lengths = paragraphs.map(p => p.replace(/\s/g, '').length);
  if (lengths.length === 0) return { avg_length: 0, pattern: 'unknown' };

  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const transitions = [];
  for (let i = 1; i < lengths.length; i++) {
    const ratio = lengths[i] / (lengths[i - 1] || 1);
    transitions.push(ratio);
  }

  const upTransitions = transitions.filter(t => t > 1.5).length;
  const downTransitions = transitions.filter(t => t < 0.67).length;
  const stableTransitions = transitions.filter(t => t >= 0.67 && t <= 1.5).length;

  return {
    avg_length: +avg.toFixed(0),
    min_length: Math.min(...lengths),
    max_length: Math.max(...lengths),
    transitions: {
      expanding: upTransitions,
      contracting: downTransitions,
      stable: stableTransitions,
    },
    pattern: upTransitions > downTransitions + 2 ? 'expanding' :
             downTransitions > upTransitions + 2 ? 'contracting' :
             stableTransitions > upTransitions + downTransitions ? 'stable' : 'varied',
  };
}

function analyzeSensoryContent(text) {
  const clean = tokenize(text);

  const sensoryKeywords = {
    visual: ['看', '见', '望', '视', '亮', '暗', '光', '色', '红', '蓝', '绿', '白', '黑', '黄', '紫', '灰', '影', '形', '状', '景'],
    auditory: ['听', '声', '音', '响', '说', '道', '问', '答', '喊', '叫', '呼', '鸣', '静', '寂', '耳'],
    tactile: ['触', '摸', '碰', '冷', '热', '暖', '凉', '温', '硬', '软', '糙', '滑', '痛', '麻', '痒', '紧', '松', '压'],
    olfactory: ['闻', '嗅', '香', '臭', '味', '气', '腥', '芳', '馥', '腐', '烟'],
    gustatory: ['尝', '吃', '喝', '甜', '苦', '酸', '辣', '咸', '淡', '涩', '甘', '鲜', '醇'],
  };

  const counts = {};
  let totalHits = 0;
  Object.entries(sensoryKeywords).forEach(([sense, keywords]) => {
    let count = 0;
    keywords.forEach(kw => {
      const re = new RegExp(kw, 'g');
      const matches = clean.match(re);
      if (matches) count += matches.length;
    });
    counts[sense] = count;
    totalHits += count;
  });

  const ratios = {};
  Object.entries(counts).forEach(([sense, count]) => {
    ratios[sense] = totalHits > 0 ? +(count / totalHits).toFixed(3) : 0;
  });

  // 找主导感官
  const primary = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

  return {
    counts,
    ratios,
    primary_sense: primary ? primary[0] : 'unknown',
    diversity: Object.values(counts).filter(c => c > 0).length,
  };
}

function analyzeDescriptiveBalance(text) {
  const clean = tokenize(text);
  const sentences = splitSentences(clean);

  // 判断句 ("是") 密度
  const judgmentPattern = /是/g;
  const judgmentCount = (clean.match(judgmentPattern) || []).length;

  // 比喻检测 (如/像/仿佛/宛如/恰似/好比)
  const metaphorPattern = /如|像|仿佛|宛如|恰似|好比|犹如|宛若|似的|一般/g;
  const metaphorCount = (clean.match(metaphorPattern) || []).length;

  // 成语
  const idiomPattern = /[一-鿿]{4}/g;
  const potentialIdioms = clean.match(idiomPattern) || [];

  return {
    judgment_is_density: +(judgmentCount / sentences.length).toFixed(2),
    metaphor_density_per_k: +(metaphorCount / clean.replace(/\s/g, '').length * 1000).toFixed(1),
    four_char_blocks: potentialIdioms.length,
  };
}

// ===== 风格档案提取 =====

function extractProfile(text) {
  const sentences = splitSentences(text);
  const paragraphs = splitParagraphs(text);

  return {
    engine: 'style-checker v1.0',
    metrics: {
      sentence: analyzeSentenceLength(sentences),
      dialogue: analyzeDialogue(text),
      modifiers: analyzeModifiers(text),
      paragraph_rhythm: analyzeParagraphRhythm(paragraphs),
      sensory: analyzeSensoryContent(text),
      description: analyzeDescriptiveBalance(text),
    },
    raw_stats: {
      total_chars: text.replace(/\s/g, '').length,
      sentence_count: sentences.length,
      paragraph_count: paragraphs.length,
      avg_chars_per_para: paragraphs.length > 0 ? +(text.replace(/\s/g, '').length / paragraphs.length).toFixed(0) : 0,
    },
  };
}

// ===== 风格偏差检测 =====

function checkDeviation(chapterText, profile) {
  const chapProfile = extractProfile(chapterText);
  const deviations = [];
  const warnings = [];

  const m = chapProfile.metrics;
  const pm = profile.metrics;

  // 句长偏差
  const sentDelta = Math.abs(m.sentence.avg - pm.sentence.avg);
  if (sentDelta > 8) {
    deviations.push({ dimension: 'sentence_length', severity: 'HIGH', delta: +sentDelta.toFixed(1),
      expected: pm.sentence.avg, actual: m.sentence.avg,
      message: `平均句长偏差 ${sentDelta.toFixed(1)} 字 (期望 ${pm.sentence.avg}, 实际 ${m.sentence.avg})` });
  } else if (sentDelta > 5) {
    warnings.push({ dimension: 'sentence_length', severity: 'MEDIUM', delta: +sentDelta.toFixed(1),
      expected: pm.sentence.avg, actual: m.sentence.avg,
      message: `平均句长略有偏差 ${sentDelta.toFixed(1)} 字` });
  }

  // 对话比偏差
  const dialDelta = Math.abs(m.dialogue.dialogue_ratio - pm.dialogue.dialogue_ratio);
  if (dialDelta > 0.15) {
    deviations.push({ dimension: 'dialogue_ratio', severity: 'HIGH', delta: +dialDelta.toFixed(3),
      expected: pm.dialogue.dialogue_ratio, actual: m.dialogue.dialogue_ratio,
      message: `对话占比偏差 ${dialDelta.toFixed(3)} (期望 ${(pm.dialogue.dialogue_ratio * 100).toFixed(0)}%, 实际 ${(m.dialogue.dialogue_ratio * 100).toFixed(0)}%)` });
  } else if (dialDelta > 0.08) {
    warnings.push({ dimension: 'dialogue_ratio', severity: 'MEDIUM', delta: +dialDelta.toFixed(3),
      expected: pm.dialogue.dialogue_ratio, actual: m.dialogue.dialogue_ratio });
  }

  // 修饰词偏差
  const modDelta = Math.abs(m.modifiers.total_modifier_density - pm.modifiers.total_modifier_density);
  if (modDelta > 4) {
    deviations.push({ dimension: 'modifier_density', severity: 'HIGH', delta: +modDelta.toFixed(1),
      expected: pm.modifiers.total_modifier_density, actual: m.modifiers.total_modifier_density,
      message: `修饰词密度偏差 ${modDelta.toFixed(1)}/千字` });
  } else if (modDelta > 2) {
    warnings.push({ dimension: 'modifier_density', severity: 'MEDIUM', delta: +modDelta.toFixed(1) });
  }

  // 段落节奏偏差
  const rhythmDelta = Math.abs(m.paragraph_rhythm.avg_length - pm.paragraph_rhythm.avg_length);
  if (rhythmDelta > 80) {
    deviations.push({ dimension: 'paragraph_rhythm', severity: 'MEDIUM', delta: rhythmDelta,
      expected: pm.paragraph_rhythm.avg_length, actual: m.paragraph_rhythm.avg_length,
      message: `平均段落长度偏差 ${rhythmDelta} 字` });
  }

  // 感官偏离
  if (m.sensory.primary_sense !== pm.sensory.primary_sense && m.sensory.primary_sense !== 'unknown') {
    warnings.push({ dimension: 'sensory_primary', severity: 'LOW',
      expected: pm.sensory.primary_sense, actual: m.sensory.primary_sense,
      message: `主导感官从 "${pm.sensory.primary_sense}" 变为 "${m.sensory.primary_sense}"` });
  }

  // 比喻密度偏差
  const metaphorDelta = Math.abs(m.description.metaphor_density_per_k - pm.description.metaphor_density_per_k);
  if (metaphorDelta > 3) {
    warnings.push({ dimension: 'metaphor_density', severity: 'MEDIUM', delta: +metaphorDelta.toFixed(1) });
  }

  const grade = deviations.length > 0 ? 'FAIL' : warnings.length > 2 ? 'WARN' : 'PASS';

  return {
    engine: 'style-checker v1.0',
    grade,
    deviations_count: deviations.length,
    warnings_count: warnings.length,
    deviations,
    warnings,
    chapter_profile: chapProfile,
  };
}

// ===== 风格差异比较 =====

function diffStyles(textA, textB, labelA, labelB) {
  const profileA = extractProfile(textA);
  const profileB = extractProfile(textB);

  const diffs = [];

  const compareMetric = (path, name, unit, threshold) => {
    const getValue = (obj, p) => p.split('.').reduce((o, k) => o[k], obj);
    const a = getValue(profileA, path);
    const b = getValue(profileB, path);
    const delta = Math.abs(a - b);
    if (delta > threshold) {
      diffs.push({ metric: name, value_a: a, value_b: b, delta: +delta.toFixed(2), unit, significant: true });
    }
  };

  compareMetric('metrics.sentence.avg', '平均句长', '字', 5);
  compareMetric('metrics.dialogue.dialogue_ratio', '对话占比', '', 0.10);
  compareMetric('metrics.modifiers.total_modifier_density', '修饰词密度', '/千字', 2);
  compareMetric('metrics.paragraph_rhythm.avg_length', '平均段落长', '字', 50);
  compareMetric('metrics.description.metaphor_density_per_k', '比喻密度', '/千字', 2);

  const consistencyScore = diffs.filter(d => d.significant).length === 0 ?
    'high_consistency' : diffs.filter(d => d.significant).length <= 1 ?
    'moderate_consistency' : 'low_consistency';

  return {
    file_a: { label: labelA, profile: profileA },
    file_b: { label: labelB, profile: profileB },
    significant_diffs: diffs.filter(d => d.significant),
    all_diffs: diffs,
    consistency: consistencyScore,
  };
}

// ===== 中文文笔 Lint 规则引擎 (← Vale 12规则类型 + write-good 9检测) =====

// 规则类型: existence | substitution | occurrence | repetition | conditional | consistency

const CHINESE_LINT_RULES = {
  // === existence: 词汇黑名单正则匹配 ===
  existence: [
    {
      id: 'ai-slop-high',
      description: 'AI高频词 (重度)',
      severity: 'HIGH',
      patterns: [/心中一惊/g, /眼中闪过/g, /不由得/g, /似乎/g, /仿佛/g, /微微一笑/g, /沉声道/g, /淡淡道/g, /冷声/g, /目光/g, /身形/g, /冷笑/g],
      message: 'AI 高频词，建议替换为具体描写',
    },
    {
      id: 'ai-slop-medium',
      description: 'AI高频词 (中度)',
      severity: 'MEDIUM',
      patterns: [/深深/g, /轻轻/g, /微微/g, /缓缓/g, /渐渐/g, /忽然/g, /突然/g],
      message: '弱化修饰，考虑删除或替换为具体动作',
      perKAllowance: 2, // 每千字最多允许2次
    },
    {
      id: 'filter-words',
      description: 'Filter words (过滤词)',
      severity: 'MEDIUM',
      patterns: [/看到/g, /听到/g, /感觉到/g, /注意到/g, /意识到/g],
      message: 'Filter word: 直接写被看到的事物，不要写"看到"这个动作本身',
    },
    {
      id: 'cliche-hooks',
      description: 'AI套话结尾钩子',
      severity: 'HIGH',
      patterns: [/他不知道的是/g, /然而等待着.*的是/g, /殊不知/g, /没有人知道/g, /谁也不知道/g],
      message: 'AI 套话钩子，替换为具体信息或悬念细节',
    },
  ],

  // === substitution: 键值对替换建议 ===
  substitution: [
    { pattern: /进行/g, replacement: '(通常可删除)', message: '"进行" 通常是冗余动词，可删除' },
    { pattern: /作出/g, replacement: '(通常可删除)', message: '"作出" 通常是冗余动词，可删除' },
    { pattern: /利用/g, replacement: '用', message: '"利用" → "用" 更简洁' },
    { pattern: /通过/g, replacement: '用/以', message: '"通过" 可考虑替换为 "用" 或 "以"' },
    { pattern: /拥有/g, replacement: '有', message: '"拥有" → "有" 更直接' },
    { pattern: /存在/g, replacement: '有', message: '"存在" → "有" 更口语化' },
    { pattern: /能够/g, replacement: '能', message: '"能够" → "能" 更简洁' },
    { pattern: /可以/g, replacement: '可/能', message: '"可以" 考虑简化' },
    { pattern: /需要/g, replacement: '要/得', message: '"需要" 在口语语境中可用 "得"' },
  ],

  // === occurrence: 阈值计数 ===
  occurrence: [
    {
      id: 'sentence-length',
      description: '句子长度检测',
      check: (sentences) => {
        const tooLong = sentences.filter(s => s.replace(/\s/g, '').length > 40);
        if (tooLong.length > 0) {
          return {
            severity: tooLong.length > sentences.length * 0.1 ? 'HIGH' : 'MEDIUM',
            count: tooLong.length,
            threshold: `${sentences.length}句中${tooLong.length}句超40字`,
            message: `${tooLong.length} 句超过 40 字，长句应穿插于短句之间`,
            samples: tooLong.slice(0, 3).map(s => s.substring(0, 60) + '...'),
          };
        }
        return null;
      },
    },
    {
      id: 'paragraph-length',
      description: '段落长度检测',
      check: (text) => {
        const paras = text.split(/\n{2,}/).filter(p => p.trim().length > 0);
        const tooLong = paras.filter(p => p.replace(/\s/g, '').length > 300);
        if (tooLong.length > 0) {
          return {
            severity: 'MEDIUM',
            count: tooLong.length,
            threshold: `${paras.length}段中${tooLong.length}段超300字`,
            message: `${tooLong.length} 段超过 300 字，考虑拆分`,
          };
        }
        return null;
      },
    },
    {
      id: 'triple-parallel',
      description: '三联排比检测',
      check: (text) => {
        const triples = (text.match(/，[^，。！？]{2,10}，[^，。！？]{2,10}，[^，。！？]{2,10}[。！？]/g) || []);
        if (triples.length > 2) {
          return {
            severity: 'MEDIUM',
            count: triples.length,
            threshold: '≤2次/章',
            message: `三联排比 ${triples.length} 次，建议 ≤2 次/章`,
          };
        }
        return null;
      },
    },
  ],

  // === repetition: 相邻重复检测 ===
  repetition: [
    { id: 'dup-chars', pattern: /(.)\1{3,}/g, description: '连续重复字符', message: '发现连续重复字符，可能是笔误' },
    { id: 'dup-de', pattern: /的的/g, description: '"的的" 重复', message: '"的的" 相邻重复' },
    { id: 'dup-le', pattern: /了了/g, description: '"了了" 重复', message: '"了了" 相邻重复' },
    { id: 'dup-ta', pattern: /他他|她她/g, description: '"他他/她她" 重复', message: '主语相邻重复' },
    { id: 'dup-yijing', pattern: /已经.*已经/g, description: '"已经" 在相近位置重复', message: '"已经" 短时间内重复' },
    { id: 'dup-yijing2', pattern: /已经[^。！？\n]{1,20}已经/g, description: '"已经" 短距重复', message: '"已经" 在20字内重复出现' },
  ],

  // === conditional: X存在→Y必须存在 ===
  conditional: [
    {
      id: 'abbreviation-full-name',
      description: '首次使用缩略语须有全称',
      check: (text) => {
        const abbrPattern = /[A-Z]{2,6}/g;
        const abbrs = [...new Set(text.match(abbrPattern) || [])];
        const findings = [];
        abbrs.forEach(abbr => {
          // 简单启发式: 如果缩略语出现但前后没有中文解释
          const context = text.substring(
            Math.max(0, text.indexOf(abbr) - 20),
            Math.min(text.length, text.indexOf(abbr) + abbr.length + 30)
          );
          if (!/[（(]/.test(context)) {
            findings.push({ abbr, context: context.trim() });
          }
        });
        if (findings.length > 0) {
          return {
            severity: 'LOW',
            findings,
            message: `${findings.length} 个英文缩略语可能缺少中文全称`,
          };
        }
        return null;
      },
    },
  ],

  // === consistency: 全文一致性 ===
  consistency: [
    {
      id: 'fangfu-haoxiang',
      description: '"仿佛" vs "好像" 一致性',
      check: (text) => {
        const fangfu = (text.match(/仿佛/g) || []).length;
        const haoxiang = (text.match(/好像/g) || []).length;
        if (fangfu > 0 && haoxiang > 0) {
          return {
            severity: 'LOW',
            fangfu,
            haoxiang,
            message: `"仿佛"(${fangfu}次) 和 "好像"(${haoxiang}次) 混用，建议统一`,
          };
        }
        return null;
      },
    },
    {
      id: 'ta-men-hun',
      description: '"他们/她们/它们" 混用检查',
      check: (text) => {
        const tamen = (text.match(/他们/g) || []).length;
        const tvmen = (text.match(/她们/g) || []).length;
        if (tamen > 0 && tvmen > 0) {
          return {
            severity: 'LOW',
            tamen,
            tvmen,
            message: '"他们" 和 "她们" 混用，确认是否故意区分性别',
          };
        }
        return null;
      },
    },
  ],

  // === readability: E-Prime 中文等价 — "是"字判断句检测 ===
  readability: [
    {
      id: 'shi-judgment',
      description: '"是" 字判断句密度',
      check: (text, sentences) => {
        const shiMatches = text.match(/是/g) || [];
        const density = sentences.length > 0 ? +(shiMatches.length / sentences.length).toFixed(1) : 0;
        if (density > 0.8) {
          return {
            severity: density > 1.2 ? 'HIGH' : 'MEDIUM',
            density,
            count: shiMatches.length,
            threshold: '≤0.8/句',
            message: `"是"字判断句密度 ${density}/句 (${shiMatches.length}次/${sentences.length}句)，建议 ≤0.8/句`,
            fix: '将"是...的"结构改为主动描写。如 "他是愤怒的" → "他下颌收紧"',
          };
        }
        return null;
      },
    },
    {
      id: 'you-judgment',
      description: '"有" 字存在句密度',
      check: (text, sentences) => {
        const youMatches = text.match(/有/g) || [];
        const density = sentences.length > 0 ? +(youMatches.length / sentences.length).toFixed(1) : 0;
        if (density > 0.6) {
          return {
            severity: density > 1.0 ? 'HIGH' : 'MEDIUM',
            density,
            count: youMatches.length,
            threshold: '≤0.6/句',
            message: `"有"字存在句密度 ${density}/句，过多"有"会让描写静态化`,
          };
        }
        return null;
      },
    },
  ],
};

// ===== Lint 规则执行引擎 =====

function runLintRules(text) {
  const sentences = splitSentences(text);
  const allFindings = [];
  const stats = {
    totalChars: text.replace(/\s/g, '').length,
    totalSentences: sentences.length,
    charsPerK: Math.max(1, text.replace(/\s/g, '').length / 1000),
  };

  // 1. existence 规则
  CHINESE_LINT_RULES.existence.forEach(rule => {
    rule.patterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      if (matches.length > 0) {
        // 检查是否有 perKAllowance
        if (rule.perKAllowance && matches.length <= rule.perKAllowance * stats.charsPerK) {
          return; // 在允许范围内
        }
        allFindings.push({
          ruleType: 'existence',
          ruleId: rule.id,
          severity: rule.severity,
          count: matches.length,
          matches: [...new Set(matches)].slice(0, 5), // 去重后最多5个样例
          message: rule.message,
        });
      }
    });
  });

  // 2. substitution 规则
  CHINESE_LINT_RULES.substitution.forEach(rule => {
    const matches = text.match(new RegExp(rule.pattern.source, 'g')) || [];
    if (matches.length > 0) {
      allFindings.push({
        ruleType: 'substitution',
        severity: 'LOW',
        count: matches.length,
        pattern: rule.pattern.source,
        replacement: rule.replacement,
        message: rule.message,
      });
    }
  });

  // 3. occurrence 规则
  CHINESE_LINT_RULES.occurrence.forEach(rule => {
    let checkResult;
    if (rule.id === 'sentence-length') {
      checkResult = rule.check(sentences);
    } else {
      checkResult = rule.check(text);
    }
    if (checkResult) {
      allFindings.push({ ruleType: 'occurrence', ruleId: rule.id, ...checkResult });
    }
  });

  // 4. repetition 规则
  CHINESE_LINT_RULES.repetition.forEach(rule => {
    const matches = text.match(rule.pattern) || [];
    if (matches.length > 0) {
      allFindings.push({
        ruleType: 'repetition',
        ruleId: rule.id,
        severity: 'MEDIUM',
        count: matches.length,
        samples: matches.slice(0, 3),
        message: rule.message,
      });
    }
  });

  // 5. conditional 规则
  CHINESE_LINT_RULES.conditional.forEach(rule => {
    const result = rule.check(text);
    if (result) {
      allFindings.push({ ruleType: 'conditional', ruleId: rule.id, ...result });
    }
  });

  // 6. consistency 规则
  CHINESE_LINT_RULES.consistency.forEach(rule => {
    const result = rule.check(text);
    if (result) {
      allFindings.push({ ruleType: 'consistency', ruleId: rule.id, ...result });
    }
  });

  // 7. readability 规则
  CHINESE_LINT_RULES.readability.forEach(rule => {
    const result = rule.check(text, sentences);
    if (result) {
      allFindings.push({ ruleType: 'readability', ruleId: rule.id, ...result });
    }
  });

  // 分级统计
  const criticalCount = allFindings.filter(f => f.severity === 'CRITICAL').length;
  const highCount = allFindings.filter(f => f.severity === 'HIGH').length;
  const mediumCount = allFindings.filter(f => f.severity === 'MEDIUM').length;
  const lowCount = allFindings.filter(f => f.severity === 'LOW').length;

  const grade = criticalCount > 0 ? 'FAIL' : highCount > 3 ? 'WARN' : highCount > 0 ? 'NEEDS_FIX' : 'PASS';

  return {
    engine: 'style-checker lint v1.0',
    grade,
    stats,
    summary: {
      total_findings: allFindings.length,
      critical: criticalCount,
      high: highCount,
      medium: mediumCount,
      low: lowCount,
    },
    findings: allFindings,
    fix_suggestions: allFindings
      .filter(f => f.severity === 'HIGH' || f.severity === 'CRITICAL')
      .map(f => f.message),
  };
}

// ===== 批量 Lint (多章节) =====

function lintBatch(projectDir) {
  const volDir = path.join(projectDir, '04_manuscript', 'vol_01');
  if (!fs.existsSync(volDir)) return { error: `未找到手稿目录: ${volDir}` };

  const chapters = fs.readdirSync(volDir)
    .filter(f => f.endsWith('.md'))
    .sort();

  const chapterResults = [];
  const allFindings = [];

  chapters.forEach(chapter => {
    const text = fs.readFileSync(path.join(volDir, chapter), 'utf-8');
    const result = runLintRules(text);
    chapterResults.push({
      chapter,
      grade: result.grade,
      findings: result.summary,
    });
    result.findings.forEach(f => {
      allFindings.push({ chapter, ...f });
    });
  });

  // 跨章 consistency 检查
  const crossChapterIssues = [];
  const allTexts = chapters.map(ch => fs.readFileSync(path.join(volDir, chapter), 'utf-8'));
  // 检测全局 "仿佛/好像" 混用
  const globalFangfu = allTexts.reduce((s, t) => s + (t.match(/仿佛/g) || []).length, 0);
  const globalHaoxiang = allTexts.reduce((s, t) => s + (t.match(/好像/g) || []).length, 0);
  if (globalFangfu > 0 && globalHaoxiang > 0) {
    crossChapterIssues.push({
      ruleType: 'consistency',
      ruleId: 'fangfu-haoxiang-global',
      severity: 'LOW',
      message: `全书 "仿佛"(${globalFangfu}次) 和 "好像"(${globalHaoxiang}次) 混用`,
    });
  }

  const passCount = chapterResults.filter(r => r.grade === 'PASS').length;
  const warnCount = chapterResults.filter(r => r.grade === 'WARN').length;
  const needsFix = chapterResults.filter(r => r.grade === 'NEEDS_FIX').length;

  return {
    engine: 'style-checker lint v1.0',
    chapters_checked: chapters.length,
    cross_chapter_issues: crossChapterIssues,
    chapter_results: chapterResults,
    overall_grade: needsFix > 0 ? 'NEEDS_FIX' : warnCount > chapters.length * 0.3 ? 'WARN' : 'PASS',
    summary: {
      total_findings: allFindings.length,
      chapters_pass: passCount,
      chapters_warn: warnCount,
      chapters_needs_fix: needsFix,
    },
  };
}

// ===== CLI =====

const cmd = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

function usage() {
  console.log(`
style-checker — 风格偏差检测 + 中文文笔 Lint 引擎 v1.1

Usage:
  node index.js profile <chapter-file>
      从章节提取完整风格档案 (JSON)

  node index.js check <chapter-file> <profile-json>
      检查章节是否符合风格档案，报告偏差

  node index.js diff <file-a> <file-b> [label-a] [label-b]
      比较两段文本的风格差异

  node index.js batch <project-dir> [profile-json]
      批量检查全书各章风格一致性

  node index.js lint <chapter-file>
      中文文笔 Lint 检查 (7类规则: existence/substitution/occurrence/repetition/conditional/consistency/readability)

  node index.js lint-batch <project-dir>
      批量 Lint 全书所有章节 + 跨章一致性
  `);
}

if (!cmd) { usage(); process.exit(1); }

switch (cmd) {
  case 'profile': {
    if (!arg1) { console.error('需要章节文件路径'); process.exit(1); }
    const text = fs.readFileSync(arg1, 'utf-8');
    console.log(JSON.stringify(extractProfile(text), null, 2));
    break;
  }

  case 'check': {
    if (!arg1 || !arg2) { console.error('Usage: style-checker check <chapter-file> <profile-json>'); process.exit(1); }
    const chapText = fs.readFileSync(arg1, 'utf-8');
    const profile = JSON.parse(fs.readFileSync(arg2, 'utf-8'));
    // 如果传入的是完整 profile 提取结果，取其 metrics
    const profileMetrics = profile.metrics ? profile : { metrics: profile };
    const result = checkDeviation(chapText, profileMetrics);
    console.log(JSON.stringify(result, null, 2));
    break;
  }

  case 'diff': {
    if (!arg1 || !arg2) { console.error('Usage: style-checker diff <file-a> <file-b>'); process.exit(1); }
    const textA = fs.readFileSync(arg1, 'utf-8');
    const textB = fs.readFileSync(arg2, 'utf-8');
    const labelA = process.argv[5] || path.basename(arg1);
    const labelB = process.argv[6] || path.basename(arg2);
    console.log(JSON.stringify(diffStyles(textA, textB, labelA, labelB), null, 2));
    break;
  }

  case 'batch': {
    if (!arg1) { console.error('需要项目目录'); process.exit(1); }
    const volDir = path.join(arg1, '04_manuscript', 'vol_01');
    if (!fs.existsSync(volDir)) { console.error(`未找到手稿目录: ${volDir}`); process.exit(1); }

    const chapters = fs.readdirSync(volDir)
      .filter(f => f.endsWith('.md'))
      .sort();

    // 如果有 profile 文件，做 check；否则用第一章做 baseline 做 diff
    const profileArg = arg2;
    let baselineProfile = null;

    if (profileArg && fs.existsSync(profileArg)) {
      const p = JSON.parse(fs.readFileSync(profileArg, 'utf-8'));
      baselineProfile = p.metrics ? p : { metrics: p };
    } else if (chapters.length > 0) {
      const firstText = fs.readFileSync(path.join(volDir, chapters[0]), 'utf-8');
      baselineProfile = extractProfile(firstText);
    }

    if (!baselineProfile) {
      console.error('无法确定基准风格档案');
      process.exit(1);
    }

    const results = [];
    chapters.forEach(chapter => {
      const text = fs.readFileSync(path.join(volDir, chapter), 'utf-8');
      const result = checkDeviation(text, baselineProfile);
      results.push({
        chapter: chapter,
        grade: result.grade,
        deviations: result.deviations_count,
        warnings: result.warnings_count,
        details: result,
      });
    });

    const passCount = results.filter(r => r.grade === 'PASS').length;
    const warnCount = results.filter(r => r.grade === 'WARN').length;
    const failCount = results.filter(r => r.grade === 'FAIL').length;

    console.log(JSON.stringify({
      engine: 'style-checker v1.0',
      chapters_checked: chapters.length,
      summary: {
        pass: passCount,
        warn: warnCount,
        fail: failCount,
        consistency_rate: +(passCount / chapters.length * 100).toFixed(0) + '%',
      },
      results,
    }, null, 2));
    break;
  }

  case 'lint': {
    if (!arg1) { console.error('需要章节文件路径'); process.exit(1); }
    const text = fs.readFileSync(arg1, 'utf-8');
    const result = runLintRules(text);
    console.log(JSON.stringify(result, null, 2));
    break;
  }

  case 'lint-batch': {
    if (!arg1) { console.error('需要项目目录'); process.exit(1); }
    const result = lintBatch(arg1);
    console.log(JSON.stringify(result, null, 2));
    break;
  }

  default:
    console.error(`未知命令: ${cmd}`);
    usage();
    process.exit(1);
}
