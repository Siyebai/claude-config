# 夜间代码审查 — 小说工具链 (2026-05-23)

## deslop-scanner/index.js (393行)

**总体**: 结构清晰，7类检测分层合理。无安全漏洞。

### 发现

**LOW #1 — 死代码**: 第99-102行 `AI_SENTENCE_PATTERNS` 数组定义了2个正则但从未在 `detect()` 中调用。是预留扩展还是遗漏？
```js
const AI_SENTENCE_PATTERNS = [
  [/连续3句以[他她它]开头/g, "连续主语重复(AI典型特征)"],
  [/[^。！？\n]{30,}[。！？]/g, "句子过长(>30字，AI特征)"],
];
```

**LOW #2 — 性别盲点**: 第215行 `subjectRepeat` 检测只硬编码 `他`，不检测 `她`：
```js
const subjectRepeat = (body.match(/他[^。！？\n]*[。！？]\s*他[^。！？\n]*[。！？]\s*他/g) || []).length;
```

**MEDIUM #3 — 无错误处理**: CLI命令中 `fs.readFileSync` 无 try/catch。文件不存在时直接 crash：
```js
const text = fs.readFileSync(target, 'utf-8'); // 文件不存在 → 不友好的错误
```

### 建议
1. 激活或删除 `AI_SENTENCE_PATTERNS` 死代码
2. `subjectRepeat` 正则改为 `[他她]` 
3. CLI入口包装 try/catch，文件错误时输出友好信息而非 stack trace

## 其他工具快速扫描

| 工具 | 行数 | console.log | 问题 |
|------|------|-------------|------|
| beat-calculator | 188 | 14 | 正常 — CLI输出 |
| deslop-scanner | 392 | 7 | 见上 |
| fabula-entropy | 580 | 19 | 正常 |
| knowledge-graph | 973 | 14 | **最大文件** — 接近800行建议线。考虑按功能拆分(src/build+src/heal+src/export) |
| novel-cli | 433 | 15 | 正常 |
| qscore-calculator | 204 | 5 | 正常 |
| style-checker | 917 | 16 | **接近800行线** — style profile + lint rules + batch 可拆分为3模块 |
| style-modes | 480 | 25 | console.log最多 — 建议部分改用debug() |
| xhs-scraper/* | 752 (4文件) | 71 | 最多console.log — 爬虫性质，部分合理但需清理诊断日志 |

**总体**: 0个安全漏洞。0个TODO。0个eval。代码质量良好。主要建议是大文件拆分和错误处理增强。
