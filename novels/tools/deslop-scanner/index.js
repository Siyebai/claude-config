#!/usr/bin/env node
/**
 * Deslop Scanner — 去AI味扫描器 v1.0
 *
 * 7 类检测 + 86 AI 短语 + 13 弱化副词 + 16 意义膨胀词 + 11 结论套话
 * 整合自: novel-creator-skill text_humanizer.py + InkOS 26维审计
 *
 * Usage:
 *   node index.js scan <file>              # JSON 检测报告
 *   node index.js report <file>            # Markdown 可读报告
 *   node index.js batch <dir>              # 批量扫描目录
 */

const fs = require('fs');
const path = require('path');

// ===== Category 1: AI 高频词汇 (86 phrases) =====
const AI_VOCAB = [
  // 比喻/感知套话
  ["不禁", "情感反应套话"], ["仿佛", "过度比喻词"], ["宛如", "过度比喻词"],
  ["宛若", "过度比喻词"], ["恍若", "过度比喻词"], ["仿若", "过度比喻词"],
  ["好似", "过度比喻词"],
  // 视觉描写套话
  ["映入眼帘", "陈词滥调视觉过渡"], ["涌入眼帘", "陈词滥调视觉过渡"], ["跃入眼帘", "陈词滥调视觉过渡"],
  // 时间膨胀
  ["此时此刻", "时间强调膨胀"], ["就在此时", "时间强调膨胀"], ["恰在此时", "时间强调膨胀"],
  ["在这一刻", "时间强调膨胀"],
  // 内心独白套话
  ["心中暗道", "内心独白滥用"], ["心中暗想", "内心独白滥用"], ["暗自思忖", "内心独白滥用"],
  ["心中一动", "内心独白滥用"], ["心中一凛", "内心独白滥用"], ["心念一动", "内心独白滥用"],
  // 对话标签套话
  ["沉声道", "对话标签套话"], ["淡淡地说", "对话标签套话"], ["轻声道", "对话标签套话"],
  ["缓缓说道", "对话标签套话"], ["淡然道", "对话标签套话"], ["漠然道", "对话标签套话"],
  // 反应/动作套话
  ["脸色一变", "反应套话"], ["神情一凛", "反应套话"], ["眉头微皱", "反应套话"],
  ["身形一顿", "动作套话"], ["脚步一顿", "动作套话"], ["身子微微一颤", "动作套话"],
  // 外貌描写套话
  ["目光如炬", "眼睛描写套话"], ["目光深邃", "眼睛描写套话"], ["深邃的眸子", "眼睛描写套话"],
  ["嘴角微扬", "微笑描写套话(AI特征极强)"], ["勾起一抹弧度", "微笑描写套话(AI特征极强)"],
  ["嘴角勾起", "微笑描写套话"],
  // 过渡套话
  ["只见", "场景过渡套话"], ["但见", "场景过渡套话"],
  // 情感套话
  ["感慨良多", "情感套话"], ["百感交集", "情感套话"], ["不禁感叹", "情感套话"],
  // 主体性剥夺
  ["不由自主", "主体性剥夺词"], ["不由得", "主体性剥夺词"], ["情不自禁", "主体性剥夺词"],
  // 扩展 - InkOS contribution
  ["眼中闪过", "AI高频眼动描写"], ["闪过一抹", "AI高频眼动描写"],
  ["眸光", "AI高频眼动描写"], ["眼底", "AI高频眼动描写"],
  ["唇角", "AI高频唇部描写"], ["眉心", "AI高频面部描写"],
  ["浑身一震", "AI高频身体反应"], ["全身一震", "AI高频身体反应"],
  ["深吸一口气", "AI高频呼吸描写"], ["倒吸一口凉气", "AI高频呼吸描写"],
];

// ===== Category 2: 弱化副词 (15 words, threshold: 3/千字) =====
const WEAK_ADVERBS = [
  "微微", "淡淡", "缓缓", "轻轻", "悄悄", "悄然",
  "深深", "静静", "慢慢", "默默", "暗暗", "隐隐",
  "渐渐", "徐徐", "徐徐地",
];
const WEAK_ADVERB_THRESHOLD = 3;

// ===== Category 3: 意义膨胀 (16 phrases) =====
const SIGNIFICANCE_PHRASES = [
  ["意义深远", "意义膨胀"], ["影响深远", "意义膨胀"], ["意义非凡", "意义膨胀"],
  ["令人叹为观止", "意义膨胀"], ["叹为观止", "意义膨胀"], ["前所未有", "意义膨胀"],
  ["史无前例", "意义膨胀"], ["意味深长", "意义膨胀"], ["深入人心", "意义膨胀"],
  ["可谓", "用繁替简"], ["堪称", "用繁替简"],
  ["不得不说", "评论性插入"], ["值得一提的是", "评论性插入"],
  ["不容忽视", "评论性插入"], ["毋庸置疑", "评论性插入"], ["不容置疑", "评论性插入"],
];

// ===== Category 4: 通用结论套话 (11 phrases) =====
const CONCLUSION_CLICHES = [
  "展望未来", "未来可期", "前途无量", "前景广阔", "大有可为", "方兴未艾",
  "相信未来", "充满希望", "充满期待", "前程似锦", "大展宏图",
];

// ===== Category 5: 段落首句总结模式 (13 starters) =====
const PARA_SUMMARY_STARTERS = [
  "总的来说", "总而言之", "综上所述", "由此可见", "不难看出", "显而易见",
  "值得注意的是", "不容忽视的是", "更重要的是", "尤其值得一提",
  "事实上", "实际上", "说到底", "换句话说", "简而言之",
];

// ===== Category 6: 翻译腔/正式语体入侵 (10 phrases) =====
const FORMAL_INTRUSION = [
  ["于是乎", "翻译腔正式语体"], ["然而事实上", "正式论述语体入侵"],
  ["然而实际上", "正式论述语体入侵"], ["理所当然", "正式论述语体入侵"],
  ["一方面", "论文结构词入侵"], ["另一方面", "论文结构词入侵"],
  ["与此同时", "正式新闻语体"], ["从而", "正式逻辑连接词"],
  ["因而", "正式逻辑连接词"], ["诚然", "正式让步连词"],
];

// ===== Category 7: 排比三连 =====
// 检测连续三个相似结构的短句

// ===== Additional: AI句式模式 (InkOS 26-dimension) =====
const AI_SENTENCE_PATTERNS = [
  [/连续3句以[他她它]开头/g, "连续主语重复(AI典型特征)"],
  [/[^。！？\n]{30,}[。！？]/g, "句子过长(>30字，AI特征)"], // 注意: 中文长句不一定不好
];

// ===== Helper functions =====

function stripMarkdown(text) {
  return text.split('\n')
    .filter(l => !l.trim().startsWith('#') && !l.trim().match(/^[-*]\s/) && !l.trim().match(/^\d+\./))
    .join('\n');
}

function extractContext(text, pos, window = 40) {
  const start = Math.max(0, pos - window);
  const end = Math.min(text.length, pos + window);
  let snippet = text.slice(start, end).replace(/\n/g, ' ');
  if (start > 0) snippet = '…' + snippet;
  if (end < text.length) snippet = snippet + '…';
  return snippet;
}

function findAllPositions(text, phrase) {
  const positions = [];
  let idx = 0;
  while ((idx = text.indexOf(phrase, idx)) !== -1) {
    positions.push(idx);
    idx += phrase.length;
  }
  return positions;
}

function detect(text) {
  const body = stripMarkdown(text);
  const pure = body.replace(/\s+/g, '');
  const charCount = Math.max(pure.length, 1);
  const perThousand = charCount / 1000;

  // Category 1: AI高频词汇
  const vocabHits = [];
  let totalVocabCount = 0;
  for (const [phrase, reason] of AI_VOCAB) {
    const positions = findAllPositions(body, phrase);
    if (positions.length > 0) {
      totalVocabCount += positions.length;
      vocabHits.push({
        phrase, count: positions.length, reason,
        examples: positions.slice(0, 3).map(p => extractContext(body, p)),
      });
    }
  }
  const vocabDensity = totalVocabCount / perThousand;

  // Category 2: 弱化副词
  const adverbHits = [];
  let totalAdverbCount = 0;
  for (const adv of WEAK_ADVERBS) {
    const count = findAllPositions(body, adv).length;
    if (count > 0) {
      totalAdverbCount += count;
      adverbHits.push({ adverb: adv, count });
    }
  }
  const adverbDensity = totalAdverbCount / perThousand;
  const adverbFlagged = adverbDensity > WEAK_ADVERB_THRESHOLD;

  // Category 3: 意义膨胀
  const significanceHits = [];
  for (const [phrase, reason] of SIGNIFICANCE_PHRASES) {
    const positions = findAllPositions(body, phrase);
    if (positions.length > 0) {
      significanceHits.push({
        phrase, count: positions.length, reason,
        examples: positions.slice(0, 2).map(p => extractContext(body, p)),
      });
    }
  }

  // Category 4: 通用结论套话
  const conclusionHits = CONCLUSION_CLICHES.filter(p => body.includes(p));

  // Category 5: 段落首句总结模式
  const paragraphs = body.split(/\n\s*\n/).filter(p => p.trim());
  let summaryCount = 0;
  const summaryExamples = [];
  for (const para of paragraphs) {
    const firstSentence = para.split(/[，。！？]/)[0];
    for (const starter of PARA_SUMMARY_STARTERS) {
      if (firstSentence.startsWith(starter)) {
        summaryCount++;
        summaryExamples.push(firstSentence.slice(0, 60));
        break;
      }
    }
  }
  const essayRatio = paragraphs.length > 0 ? summaryCount / paragraphs.length : 0;

  // Category 6: 翻译腔/正式语体
  const formalHits = [];
  for (const [phrase, reason] of FORMAL_INTRUSION) {
    const positions = findAllPositions(body, phrase);
    if (positions.length > 0) {
      formalHits.push({
        phrase, count: positions.length, reason,
        examples: positions.slice(0, 2).map(p => extractContext(body, p)),
      });
    }
  }

  // Category 7: 排比三连检测
  // 匹配 "X、Y、Z" 模式中相似结构的片段
  const trioRegex = /[一-鿿]{2,8}[、，][^\n、，。！？]{2,8}[、，][^\n、，。！？]{2,8}[。，！]/g;
  const trioMatches = body.match(trioRegex) || [];
  const trioCount = trioMatches.length;

  // Additional: 连续主语重复检测
  const subjectRepeat = (body.match(/他[^。！？\n]*[。！？]\s*他[^。！？\n]*[。！？]\s*他/g) || []).length;

  // ===== Build issues =====
  const issues = [];
  if (vocabHits.length > 0) {
    const top = vocabHits.sort((a, b) => b.count - a.count).slice(0, 5);
    issues.push(`AI高频词：${top.map(h => `${h.phrase}(×${h.count})`).join(', ')}`);
  }
  if (adverbFlagged) {
    issues.push(`弱化副词密度过高：每千字 ${adverbDensity.toFixed(1)} 个 (阈值 ${WEAK_ADVERB_THRESHOLD})`);
  }
  if (significanceHits.length > 0) {
    issues.push(`意义膨胀词：${significanceHits.slice(0, 4).map(h => h.phrase).join(', ')}`);
  }
  if (conclusionHits.length > 0) {
    issues.push(`通用结论套话：${conclusionHits.join(', ')}`);
  }
  if (essayRatio > 0.25) {
    issues.push(`论文式段落结构：${summaryCount}/${paragraphs.length} 段以总结句开头`);
  }
  if (formalHits.length > 0) {
    issues.push(`正式语体入侵：${formalHits.slice(0, 3).map(h => h.phrase).join(', ')}`);
  }
  if (trioCount > 3) {
    issues.push(`排比三连过多：${trioCount} 处`);
  }
  if (subjectRepeat > 3) {
    issues.push(`连续主语重复：${subjectRepeat} 处 (连续3句以"他"开头)`);
  }

  // Severity
  const issueCount = issues.length;
  const severity = issueCount <= 1 ? 'low' : (issueCount <= 3 ? 'medium' : 'high');

  return {
    char_count: charCount,
    paragraph_count: paragraphs.length,
    severity,
    issue_count: issueCount,
    issues,
    details: {
      category_1_vocab: { hits: vocabHits, total_count: totalVocabCount, density_per_1k: +vocabDensity.toFixed(1) },
      category_2_adverbs: { hits: adverbHits, total_count: totalAdverbCount, density_per_1k: +adverbDensity.toFixed(1), flagged: adverbFlagged },
      category_3_significance: { hits: significanceHits },
      category_4_conclusion: { hits: conclusionHits },
      category_5_essay_structure: { summary_count: summaryCount, total_paragraphs: paragraphs.length, ratio: +essayRatio.toFixed(2) },
      category_6_formal: { hits: formalHits },
      category_7_trio: { count: trioCount, examples: trioMatches.slice(0, 3) },
      subject_repeat_count: subjectRepeat,
    },
    thresholds: {
      vocab: '≤5 / 3000字',
      adverb: `≤${WEAK_ADVERB_THRESHOLD} / 千字`,
      trio: '≤2 / 章',
      essay_ratio: '≤25%',
      subject_repeat: '连续3句以同一主语开头 → 不合格',
    }
  };
}

function formatReport(result, filePath) {
  const lines = [];
  lines.push(`# Deslop 扫描报告`);
  lines.push(`\n**文件**: ${filePath}`);
  lines.push(`**字数**: ${result.char_count} | **段落**: ${result.paragraph_count}`);
  lines.push(`**严重度**: ${result.severity === 'high' ? '🔴 HIGH' : result.severity === 'medium' ? '🟡 MEDIUM' : '🟢 LOW'}`);
  lines.push(`**问题数**: ${result.issue_count}\n`);

  if (result.issues.length === 0) {
    lines.push('✅ 未检测到明显 AI 痕迹。\n');
    return lines.join('\n');
  }

  lines.push('## 问题清单\n');
  result.issues.forEach((issue, i) => lines.push(`${i + 1}. ${issue}`));

  lines.push('\n## 详细检测\n');

  const d = result.details;

  if (d.category_1_vocab.hits.length > 0) {
    lines.push('### 1. AI 高频词汇');
    lines.push(`| 词汇 | 次数 | 原因 | 示例 |`);
    lines.push(`|------|------|------|------|`);
    d.category_1_vocab.hits.slice(0, 10).forEach(h => {
      lines.push(`| ${h.phrase} | ×${h.count} | ${h.reason} | ${(h.examples[0] || '').slice(0, 40)} |`);
    });
    lines.push(`| **合计** | **${d.category_1_vocab.total_count}** | **密度: ${d.category_1_vocab.density_per_1k}/千字** | |\n`);
  }

  if (d.category_2_adverbs.flagged) {
    lines.push('### 2. 弱化副词滥用 ⚠️');
    lines.push(`密度: ${d.category_2_adverbs.density_per_1k}/千字 (阈值: ${WEAK_ADVERB_THRESHOLD})`);
    const topAdverbs = d.category_2_adverbs.hits.sort((a, b) => b.count - a.count).slice(0, 5);
    lines.push(`高频词: ${topAdverbs.map(a => `${a.adverb}(×${a.count})`).join(', ')}\n`);
  }

  if (d.category_3_significance.hits.length > 0) {
    lines.push('### 3. 意义膨胀');
    d.category_3_significance.hits.forEach(h => {
      lines.push(`- **${h.phrase}** (×${h.count}): ${h.reason}`);
    });
    lines.push('');
  }

  if (d.category_4_conclusion.hits.length > 0) {
    lines.push(`### 4. 通用结论套话: ${d.category_4_conclusion.hits.join(', ')}\n`);
  }

  if (d.category_5_essay_structure.ratio > 0.25) {
    lines.push(`### 5. 论文式段落 ⚠️`);
    lines.push(`${d.category_5_essay_structure.summary_count}/${d.category_5_essay_structure.total_paragraphs} 段以总结句开头 (${(d.category_5_essay_structure.ratio * 100).toFixed(0)}%)\n`);
  }

  if (d.category_6_formal.hits.length > 0) {
    lines.push('### 6. 正式语体入侵');
    d.category_6_formal.hits.forEach(h => {
      lines.push(`- **${h.phrase}** (×${h.count}): ${h.reason}`);
    });
    lines.push('');
  }

  if (d.category_7_trio.count > 0) {
    lines.push(`### 7. 排比三连: ${d.category_7_trio.count} 处\n`);
  }

  lines.push('---');
  lines.push('*扫描器: deslop-scanner v1.0 | 基于 novel-creator-skill text_humanizer.py + InkOS 26-dimension audit*');
  return lines.join('\n');
}

// ===== CLI =====

const cmd = process.argv[2];
const target = process.argv[3];

function usage() {
  console.log(`
deslop — 去AI味扫描器 v1.0

Usage:
  node index.js scan <file>       JSON 检测报告
  node index.js report <file>     Markdown 可读报告
  node index.js batch <dir>       批量扫描目录下所有 .md 文件
  node index.js check <file>      快速检查 (仅输出 PASS/FAIL)
`);
}

if (!cmd || !target) { usage(); process.exit(1); }

if (cmd === 'scan') {
  const text = fs.readFileSync(target, 'utf-8');
  console.log(JSON.stringify(detect(text), null, 2));
} else if (cmd === 'report') {
  const text = fs.readFileSync(target, 'utf-8');
  console.log(formatReport(detect(text), target));
} else if (cmd === 'batch') {
  const files = fs.readdirSync(target).filter(f => f.endsWith('.md'));
  const results = files.map(f => {
    const text = fs.readFileSync(path.join(target, f), 'utf-8');
    const r = detect(text);
    return { file: f, severity: r.severity, issue_count: r.issue_count, issues: r.issues };
  });
  console.log(JSON.stringify(results, null, 2));
} else if (cmd === 'check') {
  const text = fs.readFileSync(target, 'utf-8');
  const r = detect(text);
  if (r.severity === 'high') {
    console.log(`❌ FAIL — ${r.issue_count} issues (severity: high)`);
    process.exit(1);
  } else if (r.severity === 'medium') {
    console.log(`⚠️ WARN — ${r.issue_count} issues (severity: medium)`);
  } else {
    console.log(`✅ PASS — ${r.issue_count} issues`);
  }
} else {
  usage();
}
