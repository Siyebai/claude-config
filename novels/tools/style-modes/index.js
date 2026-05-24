#!/usr/bin/env node
/**
 * Style Mode Engine v1.0 — 大师风格注入引擎
 *
 * 核心功能:
 *   list                         列出所有可用风格模式
 *   load <mode-id>               加载完整风格档案 → JSON (含可执行指令+禁用规则)
 *   apply <mode-id> <file>       对章节文件应用风格模式 → 检测偏差
 *   compare <mode-id> <file>     对比目标风格 vs 实际文本风格参数
 *   blend <mode-id> <mode-id>    融合两种风格模式 → 生成混合风格
 *   generate <mode-id>           生成 Scribe 可执行写作指令清单 (human-readable)
 *   inject <mode-id> <file>      注入风格约束到章节门禁 → 输出 gate 配置
 */

const fs = require('fs');
const path = require('path');

const MASTERS_DIR = path.join(__dirname, 'masters');

// ===== 风格档案加载 =====

function loadMasters() {
  const files = fs.readdirSync(MASTERS_DIR).filter(f => f.endsWith('.json'));
  const masters = {};
  files.forEach(f => {
    const data = JSON.parse(fs.readFileSync(path.join(MASTERS_DIR, f), 'utf-8'));
    masters[data.id] = data;
  });
  return masters;
}

function loadMaster(id) {
  const filePath = path.join(MASTERS_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// ===== 风格模式应用 =====

function applyStyleMode(master, chapterText) {
  const findings = [];
  const totalChars = chapterText.replace(/\s/g, '').length;

  // 1. 执行禁止模式检测
  if (master.forbidden_patterns) {
    master.forbidden_patterns.forEach(fp => {
      if (fp.pattern.startsWith('句式:')) return; // 句式类规则由 style-checker 处理
      try {
        const re = new RegExp(fp.pattern, 'g');
        const matches = chapterText.match(re) || [];
        if (matches.length > 0) {
          findings.push({
            type: 'forbidden_pattern',
            severity: 'HIGH',
            pattern: fp.pattern,
            count: matches.length,
            samples: [...new Set(matches)].slice(0, 5),
            reason: fp.reason,
          });
        }
      } catch (e) {
        // 跳过无效正则
      }
    });
  }

  // 2. 检查可执行指令
  if (master.executable_instructions) {
    master.executable_instructions.forEach(inst => {
      if (inst.check && inst.check.startsWith('grep ')) {
        const keywords = inst.check.replace('grep ', '').split('|');
        const found = [];
        keywords.forEach(kw => {
          try {
            const matches = chapterText.match(new RegExp(kw, 'g'));
            if (matches) found.push(...matches);
          } catch (e) {}
        });
        if (found.length > 0) {
          findings.push({
            type: 'instruction_violation',
            severity: inst.severity,
            ruleId: inst.id,
            rule: inst.rule,
            count: found.length,
            samples: [...new Set(found)].slice(0, 5),
            instruction: inst.instruction,
          });
        }
      }
    });
  }

  // 3. 统计关键指标
  const sentences = chapterText.split(/(?<=[。！？!?\n])\s*/g).filter(s => s.trim().length > 0);
  const sentenceLengths = sentences.map(s => s.replace(/\s/g, '').length);
  const avgSentLen = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;

  const dialogueMatches = chapterText.match(/[""「『][^"''」』]{2,}[""」』]/g) || [];
  const dialogueChars = dialogueMatches.reduce((s, d) => s + d.replace(/\s/g, '').length, 0);
  const dialogueRatio = totalChars > 0 ? dialogueChars / totalChars : 0;

  const metrics = {
    total_chars: totalChars,
    sentence_count: sentences.length,
    avg_sentence_length: +avgSentLen.toFixed(1),
    dialogue_ratio: +dialogueRatio.toFixed(3),
    findings_count: findings.length,
  };

  // 判断是否匹配目标风格的句子长度范围
  const sentRange = master.parameters.sentence.avg_length;
  const sentMatch = avgSentLen >= sentRange[0] && avgSentLen <= sentRange[1];
  const dialRange = master.parameters.dialogue.ratio;
  const dialMatch = dialogueRatio >= dialRange[0] && dialogueRatio <= dialRange[1];

  const grade = findings.filter(f => f.severity === 'CRITICAL').length > 0 ? 'FAIL'
    : findings.filter(f => f.severity === 'HIGH').length > 3 ? 'WARN'
    : 'PASS';

  return {
    engine: 'style-mode-engine v1.0',
    mode: master.id,
    mode_name: master.name,
    grade,
    parameter_match: {
      sentence_length: { expected: sentRange, actual: metrics.avg_sentence_length, match: sentMatch },
      dialogue_ratio: { expected: dialRange, actual: metrics.dialogue_ratio, match: dialMatch },
    },
    metrics,
    findings,
    summary: `${findings.length} violations found. Sentence length: ${sentMatch ? '✓' : '✗'} (${avgSentLen.toFixed(1)} vs ${sentRange[0]}-${sentRange[1]}). Dialogue ratio: ${dialMatch ? '✓' : '✗'} (${(dialogueRatio*100).toFixed(0)}% vs ${(dialRange[0]*100).toFixed(0)}-${(dialRange[1]*100).toFixed(0)}%).`,
  };
}

// ===== 风格对比 =====

function compareStyles(master, chapterText) {
  // 提取章节的实际风格参数
  const totalChars = chapterText.replace(/\s/g, '').length;
  const sentences = chapterText.split(/(?<=[。！？!?\n])\s*/g).filter(s => s.trim().length > 0);
  const sentenceLengths = sentences.map(s => s.replace(/\s/g, '').length);
  const avgSentLen = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
  const sentStd = Math.sqrt(sentenceLengths.reduce((s, l) => s + (l - avgSentLen) ** 2, 0) / sentenceLengths.length);

  const sentDist = {
    short: sentenceLengths.filter(l => l <= 12).length / sentenceLengths.length,
    medium: sentenceLengths.filter(l => l > 12 && l <= 25).length / sentenceLengths.length,
    long: sentenceLengths.filter(l => l > 25 && l <= 40).length / sentenceLengths.length,
    very_long: sentenceLengths.filter(l => l > 40).length / sentenceLengths.length,
  };

  const dialogueMatches = chapterText.match(/[""「『][^"''」』]{2,}[""」』]/g) || [];
  const dialogueChars = dialogueMatches.reduce((s, d) => s + d.replace(/\s/g, '').length, 0);
  const dialogueRatio = totalChars > 0 ? dialogueChars / totalChars : 0;

  // 比喻密度 (简单估算)
  const metaphorMatches = chapterText.match(/如|像|仿佛|宛如|恰似|好比|犹如|宛若|似的|一般/g) || [];
  const metaphorDensity = totalChars > 0 ? metaphorMatches.length / totalChars * 1000 : 0;

  // 情绪词密度
  const emotionWords = ['愤怒', '悲伤', '恐惧', '痛苦', '幸福', '绝望', '希望', '热爱', '憎恨', '难过', '开心', '悲痛', '喜悦', '忧愁'];
  let emotionCount = 0;
  emotionWords.forEach(w => {
    const m = chapterText.match(new RegExp(w, 'g'));
    if (m) emotionCount += m.length;
  });
  const emotionDensity = totalChars > 0 ? emotionCount / totalChars * 1000 : 0;

  const actual = {
    avg_sentence_length: +avgSentLen.toFixed(1),
    sentence_std: +sentStd.toFixed(1),
    sentence_distribution: sentDist,
    dialogue_ratio: +dialogueRatio.toFixed(3),
    metaphor_density_per_k: +metaphorDensity.toFixed(1),
    emotion_density_per_k: +emotionDensity.toFixed(1),
  };

  // 构建对比表
  const target = master.parameters;
  const diffs = [];

  // 句长对比
  const sentTarget = target.sentence.avg_length;
  diffs.push({
    metric: '平均句长',
    target: `${sentTarget[0]}-${sentTarget[1]}`,
    actual: actual.avg_sentence_length,
    status: actual.avg_sentence_length >= sentTarget[0] && actual.avg_sentence_length <= sentTarget[1] ? 'match' : 'deviation',
  });

  // 对话比对比
  diffs.push({
    metric: '对话占比',
    target: `${(target.dialogue.ratio[0]*100).toFixed(0)}-${(target.dialogue.ratio[1]*100).toFixed(0)}%`,
    actual: `${(actual.dialogue_ratio*100).toFixed(0)}%`,
    status: actual.dialogue_ratio >= target.dialogue.ratio[0] && actual.dialogue_ratio <= target.dialogue.ratio[1] ? 'match' : 'deviation',
  });

  // 比喻密度对比
  if (target.metaphor.density_per_k) {
    diffs.push({
      metric: '比喻密度 (每千字)',
      target: `${target.metaphor.density_per_k[0]}-${target.metaphor.density_per_k[1]}`,
      actual: actual.metaphor_density_per_k,
      status: actual.metaphor_density_per_k >= target.metaphor.density_per_k[0] && actual.metaphor_density_per_k <= target.metaphor.density_per_k[1] ? 'match' : 'deviation',
    });
  }

  // 句长分布对比
  if (target.sentence.distribution) {
    Object.keys(target.sentence.distribution).forEach(key => {
      const labelMap = { short_12: '短句≤12字', medium_13_25: '中句13-25字', long_26_40: '长句26-40字', very_long_40plus: '特长>40字' };
      diffs.push({
        metric: labelMap[key] || key,
        target: `${(target.sentence.distribution[key]*100).toFixed(0)}%`,
        actual: `${(actual.sentence_distribution[key]*100).toFixed(0)}%`,
        status: Math.abs(target.sentence.distribution[key] - actual.sentence_distribution[key]) < 0.10 ? 'match' : 'deviation',
      });
    });
  }

  const matchCount = diffs.filter(d => d.status === 'match').length;
  const deviationCount = diffs.filter(d => d.status === 'deviation').length;

  return {
    engine: 'style-mode-engine v1.0',
    mode: master.id,
    mode_name: master.name,
    actual_profile: actual,
    comparison: diffs,
    style_alignment: +(matchCount / diffs.length * 100).toFixed(0),
    match_count: matchCount,
    deviation_count: deviationCount,
    assessment: matchCount / diffs.length > 0.7 ? 'strong_alignment'
      : matchCount / diffs.length > 0.4 ? 'moderate_alignment'
      : 'weak_alignment',
  };
}

// ===== 风格融合 =====

function blendModes(masterA, masterB, ratioA = 0.5, ratioB = 0.5) {
  const blendParam = (a, b) => {
    if (Array.isArray(a) && Array.isArray(b)) {
      return [a[0] * ratioA + b[0] * ratioB, a[1] * ratioA + b[1] * ratioB].map(v => +v.toFixed(1));
    }
    return a; // 字符串等不做数学融合
  };

  const blended = {
    id: `blend-${masterA.id}-${masterB.id}`,
    name: `${masterA.name} × ${masterB.name} (${Math.round(ratioA*100)}:${Math.round(ratioB*100)})`,
    style_label: `${masterA.style_label} + ${masterB.style_label}`,
    one_liner: `融合了${masterA.name}的${masterA.style_label}与${masterB.name}的${masterB.style_label}`,
    blend_config: { base: masterA.id, modifier: masterB.id, ratio: [ratioA, ratioB] },
    parameters: {
      sentence: {
        avg_length: blendParam(masterA.parameters.sentence.avg_length, masterB.parameters.sentence.avg_length),
      },
      dialogue: {
        ratio: blendParam(masterA.parameters.dialogue.ratio, masterB.parameters.dialogue.ratio),
      },
    },
    executable_instructions: [
      ...masterA.executable_instructions.map(i => ({ ...i, source: masterA.id })),
      ...masterB.executable_instructions.filter(
        ib => !masterA.executable_instructions.find(ia => ia.rule === ib.rule)
      ).map(i => ({ ...i, source: masterB.id })),
    ],
    forbidden_patterns: [
      ...new Set([...masterA.forbidden_patterns, ...masterB.forbidden_patterns].map(JSON.stringify)),
    ].map(JSON.parse),
  };

  return blended;
}

// ===== Scribe 可执行写作指令清单生成 =====

function generateInstructions(master) {
  const lines = [];

  lines.push(`# ${master.name} 风格写作指令`);
  lines.push('');
  lines.push(`> ${master.one_liner}`);
  lines.push('');
  lines.push('## 风格标签');
  lines.push(`${master.style_label}`);
  lines.push('');
  lines.push('## 核心参数');
  lines.push(`- 平均句长: ${master.parameters.sentence.avg_length[0]}-${master.parameters.sentence.avg_length[1]}字`);
  lines.push(`- 对话占比: ${(master.parameters.dialogue.ratio[0]*100).toFixed(0)}-${(master.parameters.dialogue.ratio[1]*100).toFixed(0)}%`);
  lines.push(`- 心理描写: ${(master.parameters.psychology.ratio*100).toFixed(0)}%`);
  lines.push(`- 比喻密度: ${master.parameters.metaphor.density_per_k[0]}-${master.parameters.metaphor.density_per_k[1]}/千字`);
  lines.push(`- 主导感官: ${master.parameters.sensory.primary}${master.parameters.sensory.secondary ? ' + ' + master.parameters.sensory.secondary : ''}`);
  lines.push(`- 叙事距离: ${master.parameters.narrative_distance.level}`);
  lines.push(`- 段落长度: ${master.parameters.paragraph.avg_length_chars[0]}-${master.parameters.paragraph.avg_length_chars[1]}字`);
  lines.push('');

  lines.push('## 5 条写作指令 (Scribe 必须遵守)');
  lines.push('');
  master.executable_instructions.forEach((inst, i) => {
    lines.push(`### ${i+1}. ${inst.rule}`);
    lines.push(`**严重级别**: ${inst.severity}`);
    lines.push(`**指令**: ${inst.instruction}`);
    lines.push(`**自动化检测**: \`${inst.check}\``);
    lines.push('');
  });

  lines.push('## 禁止模式 (写了就扣分)');
  lines.push('');
  master.forbidden_patterns.forEach(fp => {
    lines.push(`- **${fp.pattern}**: ${fp.reason}`);
  });

  lines.push('');
  lines.push('## 场景偏好');
  lines.push('');
  Object.entries(master.scene_preferences).forEach(([type, pref]) => {
    lines.push(`### ${type} (权重 ${pref.weight*100}%)`);
    lines.push(pref.instruction);
    lines.push('');
  });

  lines.push('## 叙述者声音');
  lines.push(`- **声音**: ${master.voice_signature.narrator_voice}`);
  lines.push(`- **距离**: ${master.voice_signature.distance_from_character}`);
  lines.push(`- **语气**: ${master.voice_signature.tone}`);
  lines.push(`- **词汇**: ${master.voice_signature.word_register}`);
  lines.push('');

  lines.push('## 推荐学习场景');
  lines.push('');
  master.best_scenes_for_study.forEach(s => {
    lines.push(`- 【${s.work}】${s.scene} — ${s.why}`);
  });

  return lines.join('\n');
}

// ===== CLI =====

const cmd = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

function usage() {
  console.log(`
style-modes — 大师风格注入引擎 v1.0

Commands:
  list                          列出所有可用大师风格模式
  load <mode-id>                加载完整风格档案 (JSON)
  apply <mode-id> <file>        对章节文本应用风格模式检测
  compare <mode-id> <file>      对比目标风格 vs 实际文本参数
  blend <mode-a> <mode-b> [r]   融合两种风格 (r=A的占比, 默认0.5)
  generate <mode-id>            生成 Scribe 可执行写作指令清单 (Markdown)
  inject <mode-id> <file>       注入风格约束到章节 (输出约束配置 JSON)

Available modes:
  yu-hua        余华 — 零度叙事·冷酷写实
  zhang-ailing  张爱玲 — 华丽苍凉·感官通感
  wang-xiaobo   王小波 — 黑色幽默·逻辑荒诞
  jin-yong      金庸 — 古典叙事·侠义留白
  liu-cixin     刘慈欣 — 宇宙尺度·冷静崇高
  mo-yan        莫言 — 幻觉写实·感官轰炸
  shen-congwen  沈从文 — 田园抒情·淡远自然
  lao-she       老舍 — 京味口语·悲喜交织
  wang-zengqi   汪曾祺 — 散文化小说·平淡致远
  `);
}

if (!cmd) { usage(); process.exit(1); }

switch (cmd) {
  case 'list': {
    const masters = loadMasters();
    console.log(JSON.stringify(Object.values(masters).map(m => ({
      id: m.id,
      name: m.name,
      era: m.era,
      label: m.style_label,
      one_liner: m.one_liner,
      works: m.representative_works.slice(0, 3),
      instruction_count: m.executable_instructions.length,
      forbidden_count: m.forbidden_patterns.length,
    })), null, 2));
    break;
  }

  case 'load': {
    if (!arg1) { console.error('Usage: style-modes load <mode-id>'); process.exit(1); }
    const master = loadMaster(arg1);
    if (!master) { console.error(`未找到风格模式: ${arg1}`); process.exit(1); }
    console.log(JSON.stringify(master, null, 2));
    break;
  }

  case 'apply': {
    if (!arg1 || !arg2) { console.error('Usage: style-modes apply <mode-id> <chapter-file>'); process.exit(1); }
    const master = loadMaster(arg1);
    if (!master) { console.error(`未找到风格模式: ${arg1}`); process.exit(1); }
    if (!fs.existsSync(arg2)) { console.error(`文件不存在: ${arg2}`); process.exit(1); }
    const text = fs.readFileSync(arg2, 'utf-8');
    const result = applyStyleMode(master, text);
    console.log(JSON.stringify(result, null, 2));
    break;
  }

  case 'compare': {
    if (!arg1 || !arg2) { console.error('Usage: style-modes compare <mode-id> <chapter-file>'); process.exit(1); }
    const master = loadMaster(arg1);
    if (!master) { console.error(`未找到风格模式: ${arg1}`); process.exit(1); }
    if (!fs.existsSync(arg2)) { console.error(`文件不存在: ${arg2}`); process.exit(1); }
    const text = fs.readFileSync(arg2, 'utf-8');
    const result = compareStyles(master, text);
    console.log(JSON.stringify(result, null, 2));
    break;
  }

  case 'blend': {
    if (!arg1 || !arg2) { console.error('Usage: style-modes blend <mode-a> <mode-b> [ratio-a]'); process.exit(1); }
    const masterA = loadMaster(arg1);
    const masterB = loadMaster(arg2);
    if (!masterA) { console.error(`未找到: ${arg1}`); process.exit(1); }
    if (!masterB) { console.error(`未找到: ${arg2}`); process.exit(1); }
    const ratioA = parseFloat(process.argv[5]) || 0.5;
    const result = blendModes(masterA, masterB, ratioA, 1 - ratioA);
    console.log(JSON.stringify(result, null, 2));
    break;
  }

  case 'generate': {
    if (!arg1) { console.error('Usage: style-modes generate <mode-id>'); process.exit(1); }
    const master = loadMaster(arg1);
    if (!master) { console.error(`未找到风格模式: ${arg1}`); process.exit(1); }
    console.log(generateInstructions(master));
    break;
  }

  case 'inject': {
    if (!arg1 || !arg2) { console.error('Usage: style-modes inject <mode-id> <chapter-file>'); process.exit(1); }
    const master = loadMaster(arg1);
    if (!master) { console.error(`未找到风格模式: ${arg1}`); process.exit(1); }
    if (!fs.existsSync(arg2)) { console.error(`文件不存在: ${arg2}`); process.exit(1); }
    const text = fs.readFileSync(arg2, 'utf-8');

    // 生成门禁约束
    const constraints = {
      mode: master.id,
      mode_name: master.name,
      applied_at: new Date().toISOString(),
      gate_rules: master.executable_instructions.map(inst => ({
        id: inst.id,
        rule: inst.rule,
        severity: inst.severity,
        check: inst.check,
      })),
      forbidden: master.forbidden_patterns.map(fp => fp.pattern),
      parameter_targets: {
        sentence_length_range: master.parameters.sentence.avg_length,
        dialogue_ratio_range: master.parameters.dialogue.ratio,
        metaphor_density_range: master.parameters.metaphor.density_per_k,
      },
      scene_weights: Object.fromEntries(
        Object.entries(master.scene_preferences).map(([k, v]) => [k, v.weight])
      ),
      voice_requirements: master.voice_signature,
    };

    console.log(JSON.stringify(constraints, null, 2));
    break;
  }

  default:
    console.error(`未知命令: ${cmd}`);
    usage();
    process.exit(1);
}
