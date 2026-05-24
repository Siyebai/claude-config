/**
 * 小红书内容提取 v2 — 手动导航 + 自动提取
 *
 * 用法: node scrape2.js
 * 1. 浏览器打开 → 你手动操作到博主主页，确认能看到笔记列表
 * 2. 切回终端，按 Enter → 自动提取
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

const OUTPUT_FILE = path.join(os.homedir(), 'temp', 'xhs_data.json');
const PROFILE_DIR = path.join(os.homedir(), '.xhs-browser-profile');

function waitForEnter() {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('', () => { rl.close(); resolve(); });
  });
}

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = context.pages()[0] || await context.newPage();

  // 打开小红书首页
  await page.goto('https://www.xiaohongshu.com/explore', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2000);

  console.log('┌─────────────────────────────────────────────┐');
  console.log('│  浏览器已打开。请手动操作:                    │');
  console.log('│  1. 确认已登录 (没登录请扫码)                 │');
  console.log('│  2. 导航到 https://www.xiaohongshu.com/user/  │');
  console.log('│     profile/11389383573                       │');
  console.log('│  3. 确认能看到笔记列表后，切回终端按 Enter     │');
  console.log('└─────────────────────────────────────────────┘');

  await waitForEnter();
  console.log('🔍 开始提取...\n');

  // ===== 拦截后续 API 请求 =====
  const capturedNotes = [];
  const capturedAPIs = [];

  page.on('response', async (response) => {
    const url = response.url();
    try {
      if (url.includes('/api/sns/web/v1/user_posted') ||
          url.includes('/api/sns/web/v1/note/user/posted') ||
          url.includes('user/posted')) {
        const body = await response.json();
        capturedAPIs.push({ url, time: new Date().toISOString() });
        const notes = body?.data?.notes || body?.data || [];
        if (Array.isArray(notes)) {
          notes.forEach(n => {
            capturedNotes.push({
              noteId: n.note_id || n.noteId,
              title: n.display_title || n.title || '',
              desc: n.desc || '',
              likes: parseInt(n.likes) || parseInt(n.liked_count) || 0,
              collects: parseInt(n.collects) || parseInt(n.collected_count) || 0,
              comments: parseInt(n.comments) || parseInt(n.comment_count) || 0,
              type: n.type || 'normal',
              tags: (n.tag_list || n.tags || []).map(t => typeof t === 'string' ? t : (t.name || t.tag_name || '')),
              time: n.time || n.create_time || '',
              imageCount: (n.image_list || n.images || []).length,
            });
          });
        }
        console.log(`📦 API 捕获: ${notes.length} 条笔记 (累计 ${capturedNotes.length})`);
      }
    } catch (e) {}
  });

  // ===== 自动滚动加载全部笔记 =====
  console.log('📜 自动滚动加载...');

  let prevCount = 0;
  let noChange = 0;

  for (let i = 0; i < 100; i++) {
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(2500);

    // 检查是否到底了
    const atBottom = await page.evaluate(() => {
      return window.innerHeight + window.scrollY >= document.body.scrollHeight - 100;
    });

    if (capturedNotes.length > 0 && capturedNotes.length === prevCount && atBottom) {
      noChange++;
      if (noChange >= 3) break;
    } else {
      noChange = 0;
    }
    prevCount = capturedNotes.length;
    process.stdout.write(`\r   📄 ${capturedNotes.length} 条笔记...`);
  }
  console.log('');

  // ===== 如果 API 未捕获到，回退到 DOM 提取 =====
  if (capturedNotes.length === 0) {
    console.log('⚠️  API 未捕获到，尝试 DOM 提取...');

    // 等待页面完全渲染
    await page.waitForTimeout(5000);

    const domNotes = await page.evaluate(() => {
      const results = [];
      const seen = new Set();

      // 通用提取: 找页面上所有可见文本块
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      while (walker.nextNode()) {
        const text = walker.currentNode.textContent.trim();
        if (text.length > 10) textNodes.push(text);
      }

      // 尝试找笔记链接
      document.querySelectorAll('a').forEach(a => {
        const href = a.href || '';
        const match = href.match(/\/(explore|note)\/([a-zA-Z0-9]+)/);
        if (match && !seen.has(match[2])) {
          seen.add(match[2]);
          const parentText = a.closest('section, div[class], li')?.textContent?.trim()?.substring(0, 300) || '';
          results.push({ noteId: match[2], href, textSnippet: parentText });
        }
      });

      return { notes: results, textSample: textNodes.slice(0, 5) };
    });

    console.log(`   DOM 找到 ${domNotes.notes.length} 个笔记链接`);
    if (domNotes.notes.length > 0) {
      domNotes.notes.forEach(n => {
        capturedNotes.push({
          noteId: n.noteId,
          title: n.textSnippet.substring(0, 80),
          desc: n.textSnippet,
          likes: 0, collects: 0, comments: 0,
          source: 'dom',
        });
      });
    }
    if (domNotes.textSample.length > 0) {
      console.log('\n📄 页面文本样本:');
      domNotes.textSample.forEach((t, i) => console.log(`   ${i + 1}. ${t.substring(0, 100)}`));
    }
  }

  // ===== 保存 =====
  const outDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // 去重
  const seen = new Set();
  const unique = [];
  capturedNotes.forEach(n => {
    if (!seen.has(n.noteId)) {
      seen.add(n.noteId);
      unique.push(n);
    }
  });
  unique.sort((a, b) => b.likes - a.likes);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({
    collectedAt: new Date().toISOString(),
    source: capturedAPIs.length > 0 ? 'api' : 'dom',
    apiCalls: capturedAPIs,
    total: unique.length,
    notes: unique,
  }, null, 2), 'utf-8');

  console.log(`\n✅ 保存 ${unique.length} 条笔记 → ${OUTPUT_FILE}`);

  if (unique.length > 0) {
    console.log('\n📊 按点赞排序 TOP 15:');
    console.log('─'.repeat(65));
    unique.slice(0, 15).forEach((n, i) => {
      const title = (n.title || n.desc || '(无)').replace(/\n/g, ' ').substring(0, 45);
      console.log(`${(i + 1).toString().padStart(2)}. [👍${String(n.likes).padStart(6)} ⭐${String(n.collects).padStart(6)}] ${title}`);
    });
  }

  await context.close();
  console.log('\n🏁 完成!');
})();
