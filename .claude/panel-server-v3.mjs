#!/usr/bin/env node
import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync, spawn } from 'node:child_process';

const HOST = '127.0.0.1', PORTS = [18989, 18988, 18987];
const KEY = 'sk-74f8bfe3d57a4fe6a2bd191392dbb52c';
const DATA = path.join(import.meta.dirname, 'panel-data');
const CDIR = path.join(DATA, 'conversations');
fs.mkdirSync(CDIR, { recursive: true });
const HTML_CACHE = fs.readFileSync(path.join(DATA, 'index.html'), 'utf8');

const SYSTEM = '你是姜出尘，思夜白的全栈幕僚、参谋长、人生导师、百科全书、小说创作搭档。主人当前作品《冰火纪元之魔魂战歌》。\
核心定位：幕僚长/参谋长（帮主人做决策、拆问题、推闭环，全程担当最终执行者，不推诿不缺位）+ 人生导师（不灌鸡汤，直击核心，只给真方案）+ 百科全书（精通金融、内容、代码、策略，精准响应）+ 小说战友（大纲推演、世界观校验、伏笔追踪、文笔打磨）。\
行事风格：沉默少言，精准专业，冷峻沉稳。不讨好不敷衍，发现问题必附带具体解法，不做无意义表述。\
最高准则：真诚、严谨、专业、完整、客观真实、负责。做每一件事都深度、完整、深入，不残缺、不敷衍、不臆断。\
行为铁律：(1)全程自主闭环，不麻烦主人跑腿索要授权，能一步到位绝不拆两步 (2)任务完结主动汇报，有始有终 (3)极致节约成本，每次输出都要有价值 (4)不轻易说做不到，先自研方案兜底 (5)语义有歧义先确认。\
输出规则：日常运维类回复极简条列（≤5行），报告创作类结论先行段落≤12行。禁止输出空话铺垫和思考过程。首次工具调用必须最大化并行。分析研究至少3个独立信源交叉核验。每轮结束自动评估任务完成状态。\
关键身份：你是姜出尘，Claude Code 的助手。绝不说自己是 DeepSeek、OpenAI 或任何其他 AI 公司。始终使用中文回复。';

const WORK_DIR = 'C:\\Users\\李初尘';

const TOOLS = [
  { type: 'function', function: { name: 'read_file', description: '读取文件内容，部分读取需指定 offset 和 limit（行数）', parameters: { type: 'object', properties: { filePath: { type: 'string', description: '文件绝对路径' }, offset: { type: 'integer', description: '起始行，默认0' }, limit: { type: 'integer', description: '最大行数，默认200' } }, required: ['filePath'] } } },
  { type: 'function', function: { name: 'write_file', description: '创建或覆盖文件', parameters: { type: 'object', properties: { filePath: { type: 'string', description: '文件绝对路径' }, content: { type: 'string', description: '文件内容' } }, required: ['filePath', 'content'] } } },
  { type: 'function', function: { name: 'edit_file', description: '精确替换文件中的字符串（old_str 必须在文件中唯一匹配）', parameters: { type: 'object', properties: { filePath: { type: 'string', description: '文件绝对路径' }, old_str: { type: 'string', description: '要被替换的原字符串' }, new_str: { type: 'string', description: '替换后的新字符串' } }, required: ['filePath', 'old_str', 'new_str'] } } },
  { type: 'function', function: { name: 'list_files', description: '列出目录下的文件', parameters: { type: 'object', properties: { dirPath: { type: 'string', description: '目录路径' }, pattern: { type: 'string', description: 'glob 模式，如 **/*.js' } }, required: ['dirPath'] } } },
  { type: 'function', function: { name: 'search_code', description: '在文件中搜索匹配的文本或正则表达式', parameters: { type: 'object', properties: { pattern: { type: 'string', description: '搜索模式（文本或正则）' }, dirPath: { type: 'string', description: '搜索目录，默认为工作目录' }, glob: { type: 'string', description: '文件名过滤，如 *.js' } }, required: ['pattern'] } } },
  { type: 'function', function: { name: 'run_command', description: '执行终端命令（30秒超时）', parameters: { type: 'object', properties: { command: { type: 'string', description: '要执行的命令' } }, required: ['command'] } } },
  { type: 'function', function: { name: 'web_search', description: '搜索网络获取最新信息', parameters: { type: 'object', properties: { query: { type: 'string', description: '搜索关键词' } }, required: ['query'] } } },
  { type: 'function', function: { name: 'web_fetch', description: '获取网页内容', parameters: { type: 'object', properties: { url: { type: 'string', description: '网页URL' } }, required: ['url'] } } }
];

function chkPath(p) {
  const r = path.resolve(p);
  if (!r.startsWith(WORK_DIR) && !r.startsWith('C:\\Users\\李初尘\\.claude')) throw new Error('路径超出允许范围: ' + r);
  return r;
}

const BLOCKED = ['rm -rf', 'del /s', 'format', 'shutdown', 'restart -s', ':(){', '> /dev/sda', 'mkfs', 'dd if=', 'chmod 777 /'];
function chkCmd(cmd) {
  const lower = cmd.toLowerCase();
  for (const b of BLOCKED) { if (lower.includes(b)) throw new Error('命令被拦截: ' + b); }
}

async function execTool(name, args, res) {
  try {
    switch (name) {
      case 'read_file': {
        const p = chkPath(args.filePath);
        const content = fs.readFileSync(p, 'utf8');
        const lines = content.split('\n');
        const off = args.offset || 0, lim = args.limit || 200;
        const slice = lines.slice(off, off + lim);
        return slice.map((l, i) => String(off + i + 1) + '\t' + l).join('\n');
      }
      case 'write_file': {
        const p = chkPath(args.filePath);
        fs.mkdirSync(path.dirname(p), { recursive: true });
        fs.writeFileSync(p, args.content, 'utf8');
        return '文件已写入: ' + p + ' (' + args.content.length + ' 字符)';
      }
      case 'edit_file': {
        const p = chkPath(args.filePath);
        const orig = fs.readFileSync(p, 'utf8');
        const idx = orig.indexOf(args.old_str);
        if (idx === -1) return '错误: 原字符串未找到';
        if (orig.indexOf(args.old_str, idx + 1) !== -1) return '错误: 原字符串匹配多处，请增加上下文使其唯一';
        const updated = orig.replace(args.old_str, args.new_str);
        fs.writeFileSync(p, updated, 'utf8');
        return '文件已编辑: ' + p;
      }
      case 'list_files': {
        const p = chkPath(args.dirPath);
        const files = [];
        function walk(dir, depth) {
          if (depth > 5) return;
          const ents = fs.readdirSync(dir, { withFileTypes: true });
          for (const e of ents) {
            if (e.name.startsWith('.') || e.name === 'node_modules') continue;
            const fp = path.join(dir, e.name);
            if (e.isDirectory()) { files.push(fp + '/'); walk(fp, depth + 1); }
            else files.push(fp);
          }
        }
        walk(p, 0);
        const pattern = args.pattern;
        let result = files;
        if (pattern) {
          const re = new RegExp(pattern.replace(/\*\*/g, '<<<GLOBSTAR>>>').replace(/\*/g, '[^/]*').replace(/<<<GLOBSTAR>>>/g, '.*').replace(/\?/g, '.'));
          result = files.filter(f => re.test(f));
        }
        return result.slice(0, 200).join('\n') || '(空目录)';
      }
      case 'search_code': {
        const dir = args.dirPath ? chkPath(args.dirPath) : WORK_DIR;
        const glob = args.glob || '';
        try {
          const cmd = 'rg ' + (glob ? '--glob "' + glob + '" ' : '') + '--line-number --max-count 100 "' + args.pattern.replace(/"/g, '\\"') + '" "' + dir + '"';
          const r = execSync(cmd, { cwd: WORK_DIR, timeout: 15000, encoding: 'utf8', maxBuffer: 1024 * 1024 }).toString();
          return r.substring(0, 8000) || '未找到匹配';
        } catch (e) {
          try {
            const r = execSync('findstr /s /i /n "' + args.pattern.replace(/"/g, '\\"') + '" "' + (args.dirPath || WORK_DIR) + '\\*.*"', { timeout: 15000, encoding: 'utf8', maxBuffer: 1024 * 1024 }).toString();
            return r.substring(0, 8000) || '未找到匹配';
          } catch { return '搜索完成，无匹配结果'; }
        }
      }
      case 'run_command': {
        chkCmd(args.command);
        try {
          const r = execSync(args.command, { cwd: WORK_DIR, timeout: 30000, encoding: 'utf8', maxBuffer: 1024 * 1024, shell: 'powershell.exe' }).toString();
          return r.substring(0, 6000) || '(命令执行成功，无输出)';
        } catch (e) {
          return '退出码: ' + (e.status || '?') + '\n' + (e.stdout || '') + '\n' + (e.stderr || e.message || '');
        }
      }
      case 'web_search': {
        // 三级降级：L1 DuckDuckGo → L2 简化建议 → L3 说明无网络
        try {
          const results = await execWebSearchL1(args.query);
          return results.join('\n\n');
        } catch(e1) {
          try { return (await execWebSearchL2(args.query)).join('\n'); }
          catch(e2) { return '搜索服务暂时不可用，请稍后重试。关键词已记录: ' + args.query; }
        }
      }
      case 'web_fetch': {
        // 三级降级：L1 HTTPS → L2 HTTP → L3 返回URL供手动查看
        let html;
        try { html = await execWebFetchL1(args.url); }
        catch(e1) {
          try { html = await execWebFetchL2(args.url); }
          catch(e2) { return '无法获取页面内容，请手动访问: ' + args.url; }
        }
        const text = stripHtml(html);
        return text.substring(0, 8000) || '(无文本内容)';
      }
      default: return '未知工具: ' + name;
    }
  } catch (e) { return '执行错误: ' + e.message; }
}

const uid = () => crypto.randomUUID().replace(/-/g, '').substring(0, 12);

function loadConv(id) { try { return JSON.parse(fs.readFileSync(path.join(CDIR, id + '.json'), 'utf8')); } catch { return null; } }
function saveConv(id, d) { fs.writeFileSync(path.join(CDIR, id + '.json'), JSON.stringify(d, null, 2), 'utf8'); }
function delConv(id) { try { fs.unlinkSync(path.join(CDIR, id + '.json')); } catch {} }
function listConvs() {
  return fs.readdirSync(CDIR).filter(f => f.endsWith('.json')).map(f => {
    try { const c = JSON.parse(fs.readFileSync(path.join(CDIR, f), 'utf8')); return { id: c.id, title: c.title, createdAt: c.createdAt, updatedAt: c.updatedAt, msgCount: (c.messages || []).length }; } catch { return null; }
  }).filter(Boolean).sort((a, b) => b.updatedAt - a.updatedAt);
}

function sendJSON(res, code, data) { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(data)); }
function readBody(req) { return new Promise(r => { const chunks = []; req.on('data', c => chunks.push(c)); req.on('end', () => r(Buffer.concat(chunks))); }); }

function sse(res, data) { res.write('data: ' + JSON.stringify(data) + '\n\n'); }

function callDeepSeek(messages, stream) {
  const body = JSON.stringify({ model: 'deepseek-chat', messages, stream: !!stream, max_tokens: 8192, temperature: 0.1, tools: TOOLS, tool_choice: 'auto' });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.deepseek.com', port: 443, path: '/v1/chat/completions', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + KEY, 'Content-Length': Buffer.byteLength(body) },
    }, pRes => {
      let buf = '';
      pRes.on('data', c => { buf += c.toString(); });
      pRes.on('end', () => {
        try { resolve(JSON.parse(buf)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

async function agentLoop(messages, res) {
  const dsMsgs = [{ role: 'system', content: SYSTEM }];
  for (const m of messages) {
    if (m.images && m.images.length > 0 && m.role === 'user') {
      const note = '[用户上传了 ' + m.images.length + ' 张图片，当前模型不支持图片识别。]\n';
      dsMsgs.push({ role: 'user', content: note + (m.content || '') });
    } else if (m.role === 'user' || m.role === 'assistant') {
      dsMsgs.push({ role: m.role, content: m.content || '' });
    }
  }

  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });

  let maxRounds = 8;
  while (maxRounds-- > 0) {
    const resp = await callDeepSeek(dsMsgs, false);
    const choice = resp.choices?.[0];
    if (!choice) { sse(res, { type: 'error', content: 'API 返回为空' }); break; }

    const toolCalls = choice.message?.tool_calls;
    if (toolCalls && toolCalls.length > 0) {
      for (const tc of toolCalls) {
        const fn = tc.function;
        sse(res, { type: 'tool_call', id: tc.id, name: fn.name, args: fn.arguments });
        const result = await execTool(fn.name, JSON.parse(fn.arguments || '{}'), res);
        sse(res, { type: 'tool_result', id: tc.id, name: fn.name, result: result });
        dsMsgs.push({ role: 'assistant', content: null, tool_calls: [tc] });
        dsMsgs.push({ role: 'tool', tool_call_id: tc.id, content: result });
      }
      continue;
    }

    const content = choice.message?.content;
    if (content) {
      sse(res, { type: 'delta', content });
    }
    break;
  }
  sse(res, { type: 'done' });
  res.end();
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  const url = new URL(req.url, 'http://' + HOST);

  if (req.method === 'POST' && url.pathname === '/api/chat') {
    const raw = await readBody(req);
    try { await agentLoop(JSON.parse(raw.toString()).messages || [], res); } catch { if (!res.headersSent) sendJSON(res, 400, { error: '格式错误' }); else res.end(); }
    return;
  }
  if (req.method === 'GET' && url.pathname === '/api/conversations') { sendJSON(res, 200, listConvs()); return; }
  if (req.method === 'GET' && url.pathname.startsWith('/api/conversations/')) {
    const c = loadConv(url.pathname.split('/').pop()); if (!c) { sendJSON(res, 404, {}); return; } sendJSON(res, 200, c); return;
  }
  if (req.method === 'POST' && url.pathname === '/api/conversations/save') {
    const raw = await readBody(req);
    try { const c = JSON.parse(raw.toString()); if (!c.id) c.id = 'conv_' + uid(); c.updatedAt = Date.now(); if (!c.createdAt) c.createdAt = Date.now(); saveConv(c.id, c); sendJSON(res, 200, { id: c.id, ok: true }); } catch { sendJSON(res, 400, {}); }
    return;
  }
  if (req.method === 'DELETE' && url.pathname.startsWith('/api/conversations/')) { delConv(url.pathname.split('/').pop()); sendJSON(res, 200, { ok: true }); return; }
  if (req.method === 'PUT' && url.pathname === '/api/conversations/rename') {
    const raw = await readBody(req);
    try { const { id, title } = JSON.parse(raw.toString()); const c = loadConv(id); if (!c) { sendJSON(res, 404, {}); return; } c.title = title; c.updatedAt = Date.now(); saveConv(id, c); sendJSON(res, 200, { ok: true }); } catch { sendJSON(res, 400, {}); }
    return;
  }
  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(HTML_CACHE);
    return;
  }
  if (req.method === 'GET' && url.pathname === '/health') {
    const mem = process.memoryUsage();
    sendJSON(res, 200, {
      status: 'ok', name: 'jiangchuchen-panel', version: '3.1',
      uptime_sec: Math.floor((Date.now() - startupTime) / 1000),
      heartbeats,
      mem_mb: Math.round(mem.rss / 1024 / 1024),
      port: server.address()?.port,
      convs: fs.readdirSync(CDIR).filter(f => f.endsWith('.json')).length
    });
    return;
  }
  sendJSON(res, 404, {});
});

// ─── START ───
// ─── 心跳机制 ───
const HEARTBEAT_LOG = path.join(DATA, '..', 'memory', 'daily');
fs.mkdirSync(HEARTBEAT_LOG, { recursive: true });
let heartbeats = 0, startupTime = Date.now();
function heartbeat() {
  const now = new Date();
  const uptime = Math.floor((Date.now() - startupTime) / 1000);
  const mem = process.memoryUsage();
  const status = {
    time: now.toISOString(), uptime_sec: uptime, heartbeats: ++heartbeats,
    port: server.address()?.port || '?',
    mem_mb: Math.round(mem.rss / 1024 / 1024),
    conv_count: fs.readdirSync(CDIR).filter(f => f.endsWith('.json')).length
  };
  try {
    const today = now.toISOString().slice(0, 10);
    const logFile = path.join(HEARTBEAT_LOG, today + '.json');
    let logs = [];
    try { logs = JSON.parse(fs.readFileSync(logFile, 'utf8')); } catch {}
    logs.push(status);
    if (logs.length > 144) logs = logs.slice(-144); // 保留最近24小时（每10分钟一条）
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
  } catch {}
}
setInterval(heartbeat, 600000); // 每10分钟一次心跳
heartbeat(); // 启动时立即执行一次

// ─── 三级降级工具执行 ───
async function execWebSearchL1(query) {
  const q = encodeURIComponent(query);
  const data = await new Promise((resolve, reject) => {
    https.get({ hostname: 'api.duckduckgo.com', path: '/?q=' + q + '&format=json&no_html=1&skip_disambig=1', timeout: 10000 }, r => {
      let b = ''; r.on('data', c => b += c); r.on('end', () => resolve(b));
    }).on('error', reject);
  });
  const j = JSON.parse(data);
  const results = (j.RelatedTopics || []).slice(0, 5).map(t => t.Text || '').filter(Boolean);
  if (results.length === 0) throw new Error('no_results');
  return results;
}
async function execWebSearchL2(query) {
  return ['搜索关键词: ' + query, '建议: 1) 简化关键词 2) 用英文重试 3) 访问对应网站直接查询'];
}
async function execWebFetchL1(url) {
  const u = new URL(url);
  const mod = u.protocol === 'https:' ? https : http;
  const html = await new Promise((resolve, reject) => {
    mod.get(u.href, { timeout: 15000 }, r => {
      let b = ''; r.on('data', c => b += c); r.on('end', () => resolve(b));
    }).on('error', reject);
  });
  return html;
}
async function execWebFetchL2(url) {
  const u = new URL(url);
  const mod = u.protocol === 'https:' ? https : http;
  return new Promise((resolve, reject) => {
    mod.get(u.href.replace(/^https:/, 'http:'), { timeout: 10000 }, r => {
      let b = ''; r.on('data', c => b += c); r.on('end', () => resolve(b));
    }).on('error', reject);
  });
}
function stripHtml(html) {
  return html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function tryListen(i) {
  if (i >= PORTS.length) { console.error('所有端口被占用'); process.exit(1); return; }
  const port = PORTS[i];
  server.listen(port, HOST, () => {
    console.log('姜出尘 v3.1: http://' + HOST + ':' + port);
    try { fs.writeFileSync(path.join(DATA, '.port'), String(port)); } catch {}
  });
  server.once('error', e => { if (e.code === 'EADDRINUSE') { console.log('端口' + port + '被占用, 尝试下一个'); tryListen(i + 1); } else { console.error(e.message); process.exit(1); } });
}
tryListen(0);
process.on('SIGINT', () => { heartbeat(); server.close(); process.exit(0); });
process.on('uncaughtException', e => { console.error('[PANEL] 异常:', e.message); });
