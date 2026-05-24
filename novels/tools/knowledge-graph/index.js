#!/usr/bin/env node
/**
 * Knowledge Graph — 角色关系知识图谱引擎 v1.0
 *
 * JSON 图存储 + 70+ 中文关系类型规范化 + 图愈合 + Union-Find 别名消解
 * 整合: AI-Reader-V2 关系系统 + SAGA 图愈合 + novel-creator-skill story_graph
 * 无需 Neo4j — 纯 JSON 文件存储
 *
 * Usage:
 *   node index.js build <project-dir>                     # 构建知识图谱
 *   node index.js relations <project-dir> <character>     # 查询角色关系链
 *   node index.js query <project-dir> <type>              # 按关系类型查询
 *   node index.js heal <project-dir>                      # 图愈合 (合并重复/毕业临时)
 *   node index.js export <project-dir> [format]           # 导出 (json/dot/cytoscape)
 *   node index.js conflicts <project-dir>                 # 关系冲突检测
 */

const fs = require('fs');
const path = require('path');

// ===== 70+ 关系类型规范化 (← AI-Reader-V2 relation_utils.py) =====

const RELATION_NORM = {
  // 血缘 — 亲子
  '父子': '父子', '父女': '父女', '母子': '母子', '母女': '母女',
  '养父子': '父子', '养父女': '父女', '养母子': '母子', '养母女': '母女',
  '继父子': '父子', '继母子': '母子',
  // 血缘 — 兄弟姐妹
  '兄弟': '兄弟', '兄妹': '兄妹', '姐弟': '姐弟', '姐妹': '姐妹',
  '姊妹': '姐妹', '姊弟': '姐弟',
  '义兄弟': '结拜兄弟', '义兄妹': '兄妹',
  '结拜兄弟': '结拜兄弟', '拜把子': '结拜兄弟', '金兰': '结拜兄弟',
  '义结金兰': '结拜兄弟', '把兄弟': '结拜兄弟',
  // 血缘 — 扩展家庭
  '叔侄': '叔侄', '伯侄': '叔侄', '舅甥': '甥舅', '甥舅': '甥舅',
  '姑侄': '姑侄', '姨甥': '甥舅',
  '祖孙': '祖孙', '婆媳': '婆媳', '翁媳': '翁媳',
  '妯娌': '妯娌', '姑嫂': '姑嫂', '连襟': '连襟',
  '嫂叔': '嫂叔', '嫂弟': '嫂叔', '叔嫂': '嫂叔', '弟嫂': '嫂叔',
  '嫡庶': '嫡庶',
  // 血缘 — 表亲/姻亲
  '表兄弟': '表亲', '表姐妹': '表亲', '表亲': '表亲',
  '表兄妹': '表亲', '表姐弟': '表亲',
  '堂兄弟': '堂亲', '堂姐妹': '堂亲', '堂亲': '堂亲',
  '堂兄妹': '堂亲', '堂姐弟': '堂亲',
  '亲家': '亲家', '亲戚': '亲戚', '族人': '族人', '宗族': '族人',
  '亲族': '族人', '远亲': '亲戚',
  // 亲密关系
  '夫妻': '夫妻', '夫妇': '夫妻', '恋人': '恋人', '情侣': '恋人',
  '情人': '恋人', '爱人': '恋人', '未婚夫妻': '恋人',
  '妾': '夫妻', '侧室': '夫妻', '通房': '夫妻',
  '情敌': '情敌',
  // 单向/未遂
  '求亲': '求亲', '招亲': '求亲', '求婚': '求亲', '逼婚': '逼婚',
  '爱慕': '爱慕', '单相思': '爱慕', '倾慕': '爱慕', '暗恋': '爱慕', '未遂': '求亲',
  // 层级 — 主仆
  '主仆': '主仆', '主人与仆人': '主仆', '宾主': '主仆', '主顾': '主仆',
  // 层级 — 师徒
  '师徒': '师徒', '师生': '师徒', '师父与弟子': '师徒',
  // 层级 — 政治
  '君臣': '君臣', '上下级': '上下级', '领导与下属': '上下级',
  // 社交
  '朋友': '朋友', '友人': '朋友', '好友': '朋友', '挚友': '朋友',
  '旧友': '朋友', '故交': '朋友', '世交': '世交', '故人': '朋友',
  '同门': '同门',
  '师兄弟': '师兄弟', '同门师兄弟': '师兄弟',
  '师兄妹': '师兄弟', '师姐弟': '师兄弟', '师姐妹': '师兄弟',
  '同学': '同学', '同事': '同事', '邻居': '邻居', '邻里': '邻居',
  '搭档': '搭档', '伙伴': '搭档', '同侪': '同僚', '同僚': '同僚', '盟友': '盟友',
  '知己': '朋友', '密友': '朋友', '至交': '朋友',
  // 敌对
  '敌人': '敌对', '仇人': '敌对', '死敌': '敌对', '对手': '敌对',
  '仇敌': '敌对', '宿敌': '敌对', '仇家': '敌对',
  // 特殊叙事
  '梦中相遇': '奇遇', '救命之恩': '恩人', '恩人': '恩人', '灌溉': '其他',
};

const RELATION_CATEGORY = {
  // family — 红
  '父子': 'family', '父女': 'family', '母子': 'family', '母女': 'family',
  '兄弟': 'family', '兄妹': 'family', '姐弟': 'family', '姐妹': 'family',
  '叔侄': 'family', '祖孙': 'family', '婆媳': 'family',
  '表亲': 'family', '堂亲': 'family',
  '甥舅': 'family', '姑侄': 'family', '翁媳': 'family',
  '妯娌': 'family', '姑嫂': 'family', '连襟': 'family',
  '嫂叔': 'family', '嫡庶': 'family', '亲家': 'family', '亲戚': 'family', '族人': 'family',
  '夫妻': 'family',
  // intimate — 粉
  '结拜兄弟': 'intimate', '恋人': 'intimate',
  // hostile — 黑
  '情敌': 'hostile', '逼婚': 'hostile', '敌对': 'hostile',
  // hierarchical — 金
  '师徒': 'hierarchical', '主仆': 'hierarchical', '君臣': 'hierarchical',
  '上下级': 'hierarchical',
  // social — 绿
  '求亲': 'social', '爱慕': 'social',
  '朋友': 'social', '同学': 'social', '同事': 'social', '邻居': 'social',
  '搭档': 'social', '同僚': 'social', '盟友': 'social', '世交': 'social',
  '恩人': 'social', '奇遇': 'social', '同门': 'social', '师兄弟': 'social',
};

const CATEGORY_COLORS = {
  family: '#E53E3E',       // 红
  intimate: '#D53F8C',     // 粉
  hierarchical: '#D69E2E', // 金
  social: '#38A169',       // 绿
  hostile: '#1A202C',      // 黑
  other: '#A0AEC0',        // 灰
};

function normalizeRelation(raw) {
  if (RELATION_NORM[raw]) return RELATION_NORM[raw];
  for (const [key, norm] of Object.entries(RELATION_NORM)) {
    if (key.includes(raw) || raw.includes(key)) return norm;
  }
  return raw;
}

function classifyRelation(normalized) {
  if (RELATION_CATEGORY[normalized]) return RELATION_CATEGORY[normalized];
  // 关键词回退
  if (/[父母兄弟姐妹叔侄祖孙婆媳嫂舅姑族亲]/.test(normalized)) return 'family';
  if (/[夫妻恋情人]/.test(normalized)) return 'intimate';
  if (/[师徒主君臣仆]/.test(normalized)) return 'hierarchical';
  if (/[敌仇]/.test(normalized)) return 'hostile';
  if (/[友同邻盟]/.test(normalized)) return 'social';
  return 'other';
}

// ===== Union-Find 别名消解 (← AI-Reader-V2 alias_resolver.py) =====

class UnionFind {
  constructor() {
    this.parent = {};
    this.rank = {};
  }

  find(x) {
    if (!this.parent[x]) {
      this.parent[x] = x;
      this.rank[x] = 0;
    }
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // 路径压缩
    }
    return this.parent[x];
  }

  union(x, y) {
    const px = this.find(x);
    const py = this.find(y);
    if (px === py) return;
    if (this.rank[px] < this.rank[py]) {
      this.parent[px] = py;
    } else if (this.rank[px] > this.rank[py]) {
      this.parent[py] = px;
    } else {
      this.parent[py] = px;
      this.rank[px]++;
    }
  }

  getGroups() {
    const groups = {};
    Object.keys(this.parent).forEach(name => {
      const root = this.find(name);
      if (!groups[root]) groups[root] = [];
      groups[root].push(name);
    });
    return groups;
  }
}

// 安全过滤: 通用词不进 UF 节点 (← AI-Reader-V2 alias_safety_level)
const UNSAFE_ALIAS_PATTERNS = [
  /^(父亲|母亲|爹|娘|爸|妈|哥哥|姐姐|弟弟|妹妹|叔叔|阿姨|爷爷|奶奶|师父|师傅|师兄|师弟|师姐|师妹|老板|老大|大人|先生|小姐|公子|姑娘|夫人|老爷|少爷)$/,
  /^(妖精|妖怪|那怪|这怪|老者|妇人|少年|少女|男子|女子|老头|老太太|大汉|道人|和尚|道士|书生)$/,
  /^(他|她|它|你|我|某人|有人|谁)$/,
];

function isSafeAlias(name) {
  return !UNSAFE_ALIAS_PATTERNS.some(p => p.test(name)) && name.length >= 2;
}

// ===== 知识图谱核心 =====

function buildGraph(projectDir) {
  const graph = {
    engine: 'knowledge-graph v1.0',
    nodes: {},      // name → { id, type, aliases, traits, firstChapter, lastChapter, mentionCount, isProvisional, confidence }
    edges: [],      // [{ source, target, rawType, normalizedType, category, firstChapter, evidenceCount, confidence }]
    meta: {
      project: path.basename(projectDir),
      builtAt: new Date().toISOString(),
      totalNodes: 0,
      totalEdges: 0,
      provisionalCount: 0,
    },
  };

  // 1. 加载角色圣经
  const charBiblePath = path.join(projectDir, '02_characters', 'character_bible.md');
  const charStatePath = path.join(projectDir, '02_characters', 'character_state.md');
  const relationPath = path.join(projectDir, '02_characters', 'relationship_matrix.md');

  const uf = new UnionFind();

  // 2. 解析角色圣经
  if (fs.existsSync(charBiblePath)) {
    const bible = fs.readFileSync(charBiblePath, 'utf-8');
    parseCharacterBible(bible, graph, uf);
  }

  // 3. 解析角色状态
  if (fs.existsSync(charStatePath)) {
    const state = fs.readFileSync(charStatePath, 'utf-8');
    parseCharacterState(state, graph, uf);
  }

  // 4. 解析关系矩阵
  if (fs.existsSync(relationPath)) {
    const matrix = fs.readFileSync(relationPath, 'utf-8');
    parseRelationMatrix(matrix, graph);
  }

  // 5. 从章节文本提取关系
  const volDir = path.join(projectDir, '04_manuscript', 'vol_01');
  if (fs.existsSync(volDir)) {
    const chapters = fs.readdirSync(volDir).filter(f => f.endsWith('.md')).sort();
    chapters.forEach((file, idx) => {
      const text = fs.readFileSync(path.join(volDir, file), 'utf-8');
      extractRelationsFromChapter(text, idx + 1, graph);
    });
  }

  // 6. 从 facts.jsonl 提取额外节点
  const factsPath = path.join(projectDir, 'canon', 'facts.jsonl');
  if (fs.existsSync(factsPath)) {
    const factsContent = fs.readFileSync(factsPath, 'utf-8').trim();
    if (factsContent) {
      factsContent.split('\n').forEach(line => {
        try {
          const fact = JSON.parse(line);
          if (fact.type === 'character_state' && fact.confidence > 0.6) {
            enrichNodeFromFact(fact, graph);
          }
        } catch (e) { /* skip malformed lines */ }
      });
    }
  }

  // 7. 别名消解 — 合并同角色
  const aliasGroups = uf.getGroups();
  applyAliasResolution(graph, aliasGroups);

  // 8. 计算统计
  graph.meta.totalNodes = Object.keys(graph.nodes).length;
  graph.meta.totalEdges = graph.edges.length;
  graph.meta.provisionalCount = Object.values(graph.nodes).filter(n => n.isProvisional).length;

  return graph;
}

function parseCharacterBible(text, graph, uf) {
  // 解析 Markdown 表格中的角色
  const namePattern = /^\|\s*\*{0,2}([^\s|*]{1,8})\*{0,2}\s*\|/gm;
  let m;
  while ((m = namePattern.exec(text)) !== null) {
    const name = m[1].trim();
    if (name && name.length >= 2 && !name.match(/^(要素|角色|内容|------)/)) {
      addOrUpdateNode(graph, name, { confidence: 0.9, isProvisional: false, source: 'character_bible' });
    }
  }

  // 提取别名信息
  const aliasPattern = /别名[：:]\s*([^\n]+)/g;
  let ma;
  while ((ma = aliasPattern.exec(text)) !== null) {
    const aliases = ma[1].split(/[,，、]/).map(a => a.trim()).filter(a => a.length > 0);
    const contextBefore = text.substring(Math.max(0, ma.index - 200), ma.index);
    const nameMatch = contextBefore.match(/\*\*([^*]{1,8})\*\*/);
    const ownerName = nameMatch ? nameMatch[1].trim() : null;

    if (ownerName && isSafeAlias(ownerName)) {
      aliases.forEach(alias => {
        if (isSafeAlias(alias)) {
          uf.union(ownerName, alias);
          // 记录别名
          if (graph.nodes[ownerName]) {
            if (!graph.nodes[ownerName].aliases) graph.nodes[ownerName].aliases = [];
            if (!graph.nodes[ownerName].aliases.includes(alias)) {
              graph.nodes[ownerName].aliases.push(alias);
            }
          }
        }
      });
    }
  }
}

function parseCharacterState(text, graph, uf) {
  const namePattern = /^[#]{1,3}\s*([^\s#]{2,8})/gm;
  let m;
  while ((m = namePattern.exec(text)) !== null) {
    const name = m[1].trim();
    if (name && name.length >= 2 && !name.match(/^(角色|状态|更新|当前|变更)/)) {
      addOrUpdateNode(graph, name, { confidence: 0.7, source: 'character_state' });
    }
  }
}

function parseRelationMatrix(text, graph) {
  const lines = text.split('\n');
  for (const line of lines) {
    // 格式: | 主角-反派 | 敌对 | → | 第5章 |
    const match = line.match(/^\|\s*([^-]+?)-([^-]+?)\s*\|\s*([^|]+)\s*\|/);
    if (match) {
      const source = match[1].trim();
      const target = match[2].trim();
      const rawType = match[3].trim();

      if (source && target && rawType && !rawType.includes('状态') && !rawType.includes('----')) {
        addOrUpdateEdge(graph, source, target, rawType, 0, 0.85);
      }
    }
  }
}

function extractRelationsFromChapter(text, chapterNum, graph) {
  // 模式: A对B做了某事 / A是B的X / A和B
  const patterns = [
    // "A是B的X" (关系定义)
    /(\S{1,4})是(\S{1,4})的(父子|母子|父女|母女|兄弟|兄妹|姐妹|姐弟|夫妻|师徒|主仆|仇人|敌人|朋友|恋人|同学|同门|搭档)/g,
    // "A对B说" (对话关系)
    /(\S{1,4})对(\S{1,4})说/g,
    // "A的X B" (亲属关系)
    /(\S{1,4})的(父亲|母亲|哥哥|姐姐|弟弟|妹妹|儿子|女儿|师父|徒弟)(\S{1,4})/g,
  ];

  patterns.forEach(pattern => {
    let m;
    while ((m = pattern.exec(text)) !== null) {
      if (m.length === 4) {
        // 关系定义模式
        const a = m[1], b = m[2], rel = m[3];
        if (a && b && rel && isSafeAlias(a) && isSafeAlias(b) && a !== b) {
          addOrUpdateEdge(graph, a, b, rel, chapterNum, 0.8);
        }
      } else if (m.length === 3) {
        // 对话模式
        const a = m[1], b = m[2];
        if (a && b && isSafeAlias(a) && isSafeAlias(b) && a !== b) {
          addOrUpdateEdge(graph, a, b, '对话', chapterNum, 0.5);
        }
      }
    }
  });
}

function enrichNodeFromFact(fact, graph) {
  if (!fact.statement) return;
  // 从事实中尝试提取角色名
  const nameMatch = fact.statement.match(/^(\S{1,4})/);
  if (nameMatch && isSafeAlias(nameMatch[1])) {
    addOrUpdateNode(graph, nameMatch[1], { confidence: fact.confidence || 0.6, source: 'fact_extraction', chapter: fact.chapter });
    if (graph.nodes[nameMatch[1]] && graph.nodes[nameMatch[1]].firstChapter === undefined && fact.chapter) {
      graph.nodes[nameMatch[1]].firstChapter = fact.chapter;
    }
  }
}

function addOrUpdateNode(graph, name, opts = {}) {
  if (!name || name.length < 1) return;
  if (!graph.nodes[name]) {
    graph.nodes[name] = {
      id: name,
      type: opts.type || 'Person',
      aliases: [],
      traits: opts.traits || [],
      firstChapter: opts.chapter || undefined,
      lastChapter: opts.chapter || undefined,
      mentionCount: 1,
      isProvisional: opts.isProvisional !== undefined ? opts.isProvisional : (opts.confidence < 0.75),
      confidence: opts.confidence || 0.6,
      source: opts.source || 'auto',
    };
  } else {
    const node = graph.nodes[name];
    if (opts.confidence && opts.confidence > node.confidence) {
      node.confidence = opts.confidence;
    }
    if (opts.confidence >= 0.75) node.isProvisional = false;
    if (opts.chapter) {
      if (!node.firstChapter || opts.chapter < node.firstChapter) node.firstChapter = opts.chapter;
      if (!node.lastChapter || opts.chapter > node.lastChapter) node.lastChapter = opts.chapter;
    }
    node.mentionCount = (node.mentionCount || 1) + 1;
  }
}

function addOrUpdateEdge(graph, source, target, rawType, chapterNum, confidence) {
  const normalized = normalizeRelation(rawType);
  const category = classifyRelation(normalized);

  // 查重: 同源同目标同规范类型 = 同一条边
  const existing = graph.edges.find(e =>
    ((e.source === source && e.target === target) || (e.source === target && e.target === source)) &&
    e.normalizedType === normalized
  );

  if (existing) {
    existing.evidenceCount = (existing.evidenceCount || 1) + 1;
    existing.confidence = Math.max(existing.confidence, confidence);
    const sourceNode = graph.nodes[source];
    const targetNode = graph.nodes[target];
    if (sourceNode && targetNode) {
      // 提升双方置信度
      sourceNode.mentionCount = (sourceNode.mentionCount || 1) + 1;
      targetNode.mentionCount = (targetNode.mentionCount || 1) + 1;
    }
  } else {
    graph.edges.push({
      source,
      target,
      rawType,
      normalizedType: normalized,
      category,
      firstChapter: chapterNum,
      evidenceCount: 1,
      confidence,
    });

    // 确保两端节点存在
    addOrUpdateNode(graph, source, { confidence: 0.5, isProvisional: true, chapter: chapterNum });
    addOrUpdateNode(graph, target, { confidence: 0.5, isProvisional: true, chapter: chapterNum });
  }
}

function applyAliasResolution(graph, aliasGroups) {
  Object.entries(aliasGroups).forEach(([root, members]) => {
    if (members.length <= 1) return;

    // 选规范名: 最短的 (AI-Reader-V2 canonical selection)
    const canonical = members.reduce((a, b) => a.length <= b.length ? a : b);

    // 合并所有别名到规范名
    if (!graph.nodes[canonical]) {
      graph.nodes[canonical] = {
        id: canonical,
        type: 'Person',
        aliases: members.filter(m => m !== canonical),
        traits: [],
        mentionCount: 0,
        isProvisional: false,
        confidence: 0.8,
        source: 'alias_resolution',
      };
    }

    members.forEach(member => {
      if (member !== canonical && graph.nodes[member]) {
        // 合并统计
        graph.nodes[canonical].mentionCount += graph.nodes[member].mentionCount || 0;
        if (graph.nodes[member].firstChapter &&
            (!graph.nodes[canonical].firstChapter || graph.nodes[member].firstChapter < graph.nodes[canonical].firstChapter)) {
          graph.nodes[canonical].firstChapter = graph.nodes[member].firstChapter;
        }
        if (graph.nodes[member].lastChapter &&
            (!graph.nodes[canonical].lastChapter || graph.nodes[member].lastChapter > graph.nodes[canonical].lastChapter)) {
          graph.nodes[canonical].lastChapter = graph.nodes[member].lastChapter;
        }
        // 添加别名
        if (!graph.nodes[canonical].aliases) graph.nodes[canonical].aliases = [];
        if (!graph.nodes[canonical].aliases.includes(member)) {
          graph.nodes[canonical].aliases.push(member);
        }
        // 删除旧节点
        delete graph.nodes[member];
      }
    });

    // 重定向边
    graph.edges.forEach(edge => {
      if (members.includes(edge.source) && edge.source !== canonical) edge.source = canonical;
      if (members.includes(edge.target) && edge.target !== canonical) edge.target = canonical;
    });

    // 去重边 (合并后可能重复)
    deduplicateEdges(graph);
  });
}

function deduplicateEdges(graph) {
  const seen = new Set();
  const unique = [];
  graph.edges.forEach(edge => {
    const key = [edge.source, edge.target, edge.normalizedType].sort().join('||');
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(edge);
    } else {
      // 合并 evidenceCount
      const existing = unique.find(e => {
        const ek = [e.source, e.target, e.normalizedType].sort().join('||');
        return ek === key;
      });
      if (existing) existing.evidenceCount += edge.evidenceCount;
    }
  });
  graph.edges = unique;
}

// ===== 图愈合 (← SAGA graph_healing_service.py) =====

const CONFIDENCE_THRESHOLD = 0.75;
const MERGE_SIMILARITY_THRESHOLD = 0.75;
const AUTO_MERGE_THRESHOLD = 0.85;
const AGE_GRADUATION_CHAPTERS = 4;
const ORPHAN_CLEANUP_CHAPTERS = 3;

function healGraph(graph, totalChapters = 0) {
  const actions = [];

  // 1. 临时节点毕业
  Object.entries(graph.nodes).forEach(([name, node]) => {
    if (!node.isProvisional) return;

    let confidence = node.confidence || 0.5;

    // 频率加分
    confidence += Math.min((node.mentionCount || 0) * 0.05, 0.3);
    // 跨章稳定性加分 (SAGA AGE_GRADUATION)
    const chapterSpan = (node.lastChapter || node.firstChapter || 1) - (node.firstChapter || 1);
    if (chapterSpan >= AGE_GRADUATION_CHAPTERS) confidence += 0.2;
    // 别名加分
    if (node.aliases && node.aliases.length > 0) confidence += 0.1;

    node.confidence = Math.min(confidence, 1.0);

    if (node.confidence >= CONFIDENCE_THRESHOLD) {
      node.isProvisional = false;
      actions.push({ action: 'graduated', node: name, confidence: +node.confidence.toFixed(2) });
    }
  });

  // 2. 重复节点检测 (名称相似度)
  const nodeNames = Object.keys(graph.nodes);
  const merges = [];
  for (let i = 0; i < nodeNames.length; i++) {
    for (let j = i + 1; j < nodeNames.length; j++) {
      const a = nodeNames[i], b = nodeNames[j];
      const similarity = stringSimilarity(a, b);
      if (similarity >= MERGE_SIMILARITY_THRESHOLD) {
        merges.push({ a, b, similarity: +similarity.toFixed(2), auto: similarity >= AUTO_MERGE_THRESHOLD });
      }
    }
  }

  // 执行合并
  merges.forEach(merge => {
    if (merge.auto) {
      mergeNodes(graph, merge.a, merge.b);
      actions.push({ action: 'merged', from: merge.b, to: merge.a, similarity: merge.similarity, auto: true });
    } else {
      actions.push({ action: 'merge_candidate', from: merge.b, to: merge.a, similarity: merge.similarity, auto: false });
    }
  });

  // 3. 孤立节点清理
  const connectedNodes = new Set();
  graph.edges.forEach(edge => {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  });

  const orphans = [];
  Object.entries(graph.nodes).forEach(([name, node]) => {
    if (!connectedNodes.has(name) && node.isProvisional && totalChapters > 0) {
      const age = totalChapters - (node.firstChapter || totalChapters);
      if (age >= ORPHAN_CLEANUP_CHAPTERS) {
        orphans.push(name);
      }
    }
  });

  orphans.forEach(name => {
    delete graph.nodes[name];
    actions.push({ action: 'removed_orphan', node: name });
  });

  // 4. 关系冲突检测 (A-B 同时有 family 和 hostile 边 → 标记)
  const conflicts = detectRelationConflicts(graph);
  conflicts.forEach(c => {
    actions.push({ action: 'conflict_detected', ...c });
  });

  graph.meta.totalNodes = Object.keys(graph.nodes).length;
  graph.meta.totalEdges = graph.edges.length;
  graph.meta.provisionalCount = Object.values(graph.nodes).filter(n => n.isProvisional).length;

  return { actions, conflicts, graph };
}

function stringSimilarity(a, b) {
  if (a === b) return 1.0;
  // 简单 Jaccard 双字符组相似度
  const bigrams = s => {
    const set = new Set();
    for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
    return set;
  };
  const sa = bigrams(a);
  const sb = bigrams(b);
  const intersection = new Set([...sa].filter(x => sb.has(x)));
  const union = new Set([...sa, ...sb]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function mergeNodes(graph, keep, remove) {
  if (!graph.nodes[remove]) return;
  const kept = graph.nodes[keep];
  const removed = graph.nodes[remove];

  kept.mentionCount += removed.mentionCount || 0;
  kept.aliases = [...new Set([...(kept.aliases || []), ...(removed.aliases || []), remove])];
  kept.confidence = Math.max(kept.confidence, removed.confidence);
  if (removed.firstChapter && (!kept.firstChapter || removed.firstChapter < kept.firstChapter)) {
    kept.firstChapter = removed.firstChapter;
  }
  if (removed.lastChapter && (!kept.lastChapter || removed.lastChapter > kept.lastChapter)) {
    kept.lastChapter = removed.lastChapter;
  }

  // 重定向边
  graph.edges.forEach(edge => {
    if (edge.source === remove) edge.source = keep;
    if (edge.target === remove) edge.target = keep;
  });

  delete graph.nodes[remove];
  deduplicateEdges(graph);
}

function detectRelationConflicts(graph) {
  const conflicts = [];
  const edgeMap = {};

  graph.edges.forEach(edge => {
    const key = [edge.source, edge.target].sort().join('||');
    if (!edgeMap[key]) edgeMap[key] = [];
    edgeMap[key].push(edge);
  });

  Object.entries(edgeMap).forEach(([key, edges]) => {
    const categories = new Set(edges.map(e => e.category));

    // family + hostile = critical conflict
    if (categories.has('family') && categories.has('hostile')) {
      conflicts.push({
        entities: key.split('||'),
        type: 'family_vs_hostile',
        severity: 'CRITICAL',
        relationTypes: edges.map(e => `${e.normalizedType}(${e.category})`),
      });
    }

    // intimate + hostile
    if (categories.has('intimate') && categories.has('hostile')) {
      conflicts.push({
        entities: key.split('||'),
        type: 'intimate_vs_hostile',
        severity: 'HIGH',
        relationTypes: edges.map(e => `${e.normalizedType}(${e.category})`),
      });
    }
  });

  return conflicts;
}

// ===== 查询 =====

function queryRelations(graph, character, projectDir) {
  const resolvedName = resolveCharacterName(graph, character);
  if (!graph.nodes[resolvedName]) {
    return { error: `未找到角色: ${character}`, suggestions: findSimilarNodes(graph, character) };
  }

  const node = graph.nodes[resolvedName];
  const relations = [];

  graph.edges.forEach(edge => {
    if (edge.source === resolvedName || edge.target === resolvedName) {
      const other = edge.source === resolvedName ? edge.target : edge.source;
      const otherNode = graph.nodes[other];
      relations.push({
        with: other,
        direction: edge.source === resolvedName ? '→' : '←',
        type: edge.normalizedType,
        category: edge.category,
        color: CATEGORY_COLORS[edge.category] || CATEGORY_COLORS.other,
        firstChapter: edge.firstChapter,
        evidenceCount: edge.evidenceCount,
        confidence: +(edge.confidence || 0.5).toFixed(2),
        otherNode: otherNode ? {
          isProvisional: otherNode.isProvisional,
          mentionCount: otherNode.mentionCount,
          aliases: otherNode.aliases,
        } : null,
      });
    }
  });

  // 按 category 分组
  const byCategory = {};
  relations.forEach(r => {
    if (!byCategory[r.category]) byCategory[r.category] = [];
    byCategory[r.category].push(r);
  });

  return {
    character: resolvedName,
    aliases: node.aliases || [],
    isProvisional: node.isProvisional,
    mentionCount: node.mentionCount,
    totalRelations: relations.length,
    byCategory,
    allRelations: relations,
  };
}

function resolveCharacterName(graph, name) {
  if (graph.nodes[name]) return name;
  // 搜索别名
  for (const [nodeName, node] of Object.entries(graph.nodes)) {
    if (node.aliases && node.aliases.includes(name)) return nodeName;
  }
  return name;
}

function findSimilarNodes(graph, name) {
  return Object.keys(graph.nodes)
    .filter(n => stringSimilarity(n, name) > 0.5)
    .slice(0, 5);
}

// ===== 导出 =====

function exportGraph(graph, format) {
  switch (format) {
    case 'dot':
      return exportDOT(graph);
    case 'cytoscape':
      return exportCytoscape(graph);
    case 'json':
    default:
      return JSON.stringify(graph, null, 2);
  }
}

function exportDOT(graph) {
  let dot = 'digraph NovelGraph {\n';
  dot += '  rankdir=LR;\n  node [shape=box, style=rounded];\n\n';

  Object.entries(graph.nodes).forEach(([name, node]) => {
    const color = node.isProvisional ? 'gray' : 'black';
    const style = node.isProvisional ? 'dashed' : 'solid';
    dot += `  "${name}" [color=${color}, style=${style}, label="${name}\\n(${node.mentionCount})"];\n`;
  });

  dot += '\n';
  graph.edges.forEach(edge => {
    const color = CATEGORY_COLORS[edge.category] || CATEGORY_COLORS.other;
    dot += `  "${edge.source}" -> "${edge.target}" [color="${color}", label="${edge.normalizedType}", penwidth=${Math.min(edge.evidenceCount, 5)}];\n`;
  });

  dot += '}\n';
  return dot;
}

function exportCytoscape(graph) {
  const elements = [];

  Object.entries(graph.nodes).forEach(([name, node]) => {
    elements.push({
      data: {
        id: name,
        label: name,
        type: node.type,
        isProvisional: node.isProvisional,
        mentionCount: node.mentionCount,
        confidence: node.confidence,
        aliases: (node.aliases || []).join(', '),
      },
    });
  });

  graph.edges.forEach((edge, idx) => {
    elements.push({
      data: {
        id: `e${idx}`,
        source: edge.source,
        target: edge.target,
        label: edge.normalizedType,
        category: edge.category,
        color: CATEGORY_COLORS[edge.category] || CATEGORY_COLORS.other,
        evidenceCount: edge.evidenceCount,
        firstChapter: edge.firstChapter,
      },
    });
  });

  return JSON.stringify({ elements }, null, 2);
}

// ===== CLI =====

const cmd = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

function usage() {
  console.log(`
knowledge-graph — 角色关系知识图谱引擎 v1.0

Usage:
  node index.js build <project-dir>
      构建完整知识图谱 → 输出 JSON 到 stdout

  node index.js relations <project-dir> <character>
      查询角色关系链 + 分类 + 冲突检测

  node index.js query <project-dir> <category>
      按关系类别查询 (family|intimate|hierarchical|social|hostile|all)

  node index.js heal <project-dir>
      图愈合: 临时节点毕业 + 重复合并 + 孤立清理 + 冲突检测

  node index.js conflicts <project-dir>
      检测关系冲突 (family vs hostile, intimate vs hostile)

  node index.js export <project-dir> [format]
      导出图谱 (json|dot|cytoscape)
  `);
}

if (!cmd) { usage(); process.exit(1); }

function loadGraph(projectDir) {
  const graphPath = path.join(projectDir, '03_plot', 'knowledge_graph.json');
  if (fs.existsSync(graphPath)) {
    return JSON.parse(fs.readFileSync(graphPath, 'utf-8'));
  }
  return null;
}

function saveGraph(projectDir, graph) {
  const graphPath = path.join(projectDir, '03_plot', 'knowledge_graph.json');
  const dir = path.dirname(graphPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(graphPath, JSON.stringify(graph, null, 2), 'utf-8');
  return graphPath;
}

switch (cmd) {
  case 'build': {
    if (!arg1) { console.error('需要项目目录'); process.exit(1); }
    const graph = buildGraph(arg1);
    const savedPath = saveGraph(arg1, graph);
    console.log(JSON.stringify({
      status: 'built',
      savedTo: savedPath,
      meta: graph.meta,
    }, null, 2));
    break;
  }

  case 'relations': {
    if (!arg1 || !arg2) { console.error('Usage: knowledge-graph relations <project-dir> <character>'); process.exit(1); }
    let graph = loadGraph(arg1);
    if (!graph) { graph = buildGraph(arg1); saveGraph(arg1, graph); }
    const result = queryRelations(graph, arg2, arg1);
    console.log(JSON.stringify(result, null, 2));
    break;
  }

  case 'query': {
    if (!arg1) { console.error('需要项目目录'); process.exit(1); }
    let graph = loadGraph(arg1);
    if (!graph) { graph = buildGraph(arg1); saveGraph(arg1, graph); }

    const category = arg2 || 'all';
    let edges = graph.edges;
    if (category !== 'all') {
      edges = edges.filter(e => e.category === category);
    }

    const result = {
      category,
      edgeCount: edges.length,
      edges: edges.map(e => ({
        source: e.source,
        target: e.target,
        type: e.normalizedType,
        category: e.category,
        firstChapter: e.firstChapter,
        evidenceCount: e.evidenceCount,
      })),
    };
    console.log(JSON.stringify(result, null, 2));
    break;
  }

  case 'heal': {
    if (!arg1) { console.error('需要项目目录'); process.exit(1); }
    let graph = loadGraph(arg1);
    if (!graph) { graph = buildGraph(arg1); saveGraph(arg1, graph); }

    // 算总章节数
    const volDir = path.join(arg1, '04_manuscript', 'vol_01');
    let totalChapters = 0;
    if (fs.existsSync(volDir)) {
      totalChapters = fs.readdirSync(volDir).filter(f => f.endsWith('.md')).length;
    }

    const healingResult = healGraph(graph, totalChapters);
    saveGraph(arg1, graph);

    console.log(JSON.stringify({
      engine: 'knowledge-graph v1.0',
      healing: {
        totalActions: healingResult.actions.length,
        graduations: healingResult.actions.filter(a => a.action === 'graduated').length,
        merges: healingResult.actions.filter(a => a.action === 'merged').length,
        mergeCandidates: healingResult.actions.filter(a => a.action === 'merge_candidate').length,
        orphanRemovals: healingResult.actions.filter(a => a.action === 'removed_orphan').length,
        conflicts: healingResult.actions.filter(a => a.action === 'conflict_detected').length,
      },
      actions: healingResult.actions,
      graphMeta: graph.meta,
    }, null, 2));
    break;
  }

  case 'conflicts': {
    if (!arg1) { console.error('需要项目目录'); process.exit(1); }
    let graph = loadGraph(arg1);
    if (!graph) { graph = buildGraph(arg1); saveGraph(arg1, graph); }

    const conflicts = detectRelationConflicts(graph);
    console.log(JSON.stringify({
      engine: 'knowledge-graph v1.0',
      totalConflicts: conflicts.length,
      conflicts,
    }, null, 2));
    break;
  }

  case 'export': {
    if (!arg1) { console.error('需要项目目录'); process.exit(1); }
    let graph = loadGraph(arg1);
    if (!graph) { graph = buildGraph(arg1); saveGraph(arg1, graph); }

    const format = arg2 || 'json';
    console.log(exportGraph(graph, format));
    break;
  }

  default:
    console.error(`未知命令: ${cmd}`);
    usage();
    process.exit(1);
}
