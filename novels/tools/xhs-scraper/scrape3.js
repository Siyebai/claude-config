/**
 * 小红书内容提取 v3 — 文件信号控制 + API 拦截
 *
 * 用法:
 *   终端1: node scrape3.js    (启动浏览器)
 *   终端2: touch ~/temp/xhs_ready    (当浏览器页面看到博主笔记列表后)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');

const TARGET = 'https://www.xiaohongshu.com/user/profile/11389383573';
const OUTPUT = path.join(os.homedir(), 'temp', 'xhs_data.json');
const SIGNAL = path.join(os.homedir(), 'temp', 'xhs_ready');
const PROFILE_DIR = path.join(os.homedir(), '.xhs-browser-profile');

// 清理信号文件
if (fs.existsSync(SIGNAL)) fs.unlinkSync(SIGNAL);
if (fs.existsSync(path.join(os.homedir(), 'temp', 'xhs_done'))) fs.unlinkSync(path.join(os.homedir(), 'temp', 'xhs_done'));

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = context.pages()[0] || await context.newPage();

  // ===== API 响应拦截 =====
  const capturedNotes = [];

  await page.route('**/*', (route) => {
    route.continue();
  });

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('user_posted') || url.includes('note/user/posted')) {
      try {
        const body = await response.json();
        const notes = body?.data?.notes || body?.data || [];
        if (Array.isArray(notes) && notes.length > 0) {
          notes.forEach(n => {
            capturedNotes.push({
              noteId: n.note_id || n.noteId || n.id,
              title: n.display_title || n.title || '',
              desc: n.desc || n.description || '',
              likes: parseInt(n.likes || n.liked_count || n.like_count || 0),
              collects: parseInt(n.collects || n.collected_count || n.collect_count || 0),
              comments: parseInt(n.comments || n.comment_count || 0),
              type: n.type || 'normal',
              tags: (n.tag_list || n.tags || []).map(t => typeof t === 'string' ? t : (t.name || t.tag_name || '')),
              time: n.time || n.create_time || '',
            });
          });
          console.log(`📦 捕获 ${notes.length} 条 (累计 ${capturedNotes.length})`);
        }
      } catch (e) {}
    }
  });

  // ===== 导航到博主主页 =====
  console.log(`📍 打开 ${TARGET}`);
  console.log('⏳ 等待页面加载 & 登录...');
  await page.goto(TARGET, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(5000);

  // 检测是否需要登录
  const bodyText = await page.evaluate(() => document.body.textContent || '');
  if (bodyText.includes('登录') && bodyText.length < 500) {
    console.log('🔐 检测到登录页面。请在浏览器中登录，登录后:');
    console.log('   touch ~/temp/xhs_ready');
    console.log('⏳ 等待信号文件...');
  } else {
    console.log('✅ 页面已加载 (可能已登录)');
  }

  // ===== 等待信号文件 =====
  let waitCount = 0;
  while (!fs.existsSync(SIGNAL)) {
    await new Promise(r => setTimeout(r, 1000));
    waitCount++;

    // 每 30 秒提示
    if (waitCount % 30 === 0) {
      console.log(`   ⏳ 等待中... (${waitCount}s)`);
      // 尝试重新导航
      if (waitCount % 60 === 0) {
        await page.goto(TARGET, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
      }
    }

    // 超时 5 分钟
    if (waitCount > 300) {
      console.log('⏰ 超时，尝试继续提取...');
      break;
    }
  }

  fs.unlinkSync(SIGNAL);
  console.log('🔍 开始提取笔记数据...');

  // ===== 滚动加载全部笔记 =====
  const maxScrolls = 200;
  let prevCount = 0;
  let noChange = 0;

  for (let i = 0; i < maxScrolls; i++) {
    // 鼠标滚轮滚动
    await page.evaluate(() => {
      window.scrollBy(0, 800);
    });
    await page.waitForTimeout(1500);

    // 翻到底用 PageDown
    if (i % 5 === 0) {
      await page.keyboard.press('PageDown');
      await page.waitForTimeout(1000);
    }

    if (capturedNotes.length > prevCount) {
      noChange = 0;
      prevCount = capturedNotes.length;
    } else {
      noChange++;
      if (noChange >= 8) {
        console.log(`   📄 无新笔记，停止滚动`);
        break;
      }
    }

    if (i % 10 === 0) {
      console.log(`   📜 滚动中... ${i} 次 | ${capturedNotes.length} 条笔记`);
    }
  }

  // ===== 如果 API 无数据，回退到 DOM 提取 =====
  if (capturedNotes.length === 0) {
    console.log('⚠️  API 拦截无数据，尝试 DOM 提取...');
    await page.waitForTimeout(3000);

    const domResult = await page.evaluate(() => {
      const notes = [];
      const seen = new Set();
      document.querySelectorAll('a').forEach(a => {
        const m = (a.href || '').match(/\/(explore|note)\/([a-zA-Z0-9]+)/);
        if (m && !seen.has(m[2])) {
          seen.add(m[2]);
          const el = a.closest('section, div[class]') || a;
          notes.push({
            noteId: m[2],
            href: a.href,
            textPreview: (el.textContent || '').trim().substring(0, 200),
          });
        }
      });
      return notes;
    });

    domResult.forEach(n => {
      capturedNotes.push({
        noteId: n.noteId,
        title: n.textPreview.substring(0, 80),
        desc: n.textPreview,
        likes: 0, collects: 0, comments: 0,
        source: 'dom',
      });
    });
  }

  // ===== 去重 + 排序 + 保存 =====
  const seen = new Set();
  const unique = [];
  capturedNotes.forEach(n => {
    if (!seen.has(n.noteId)) {
      seen.add(n.noteId);
      unique.push(n);
    }
  });
  unique.sort((a, b) => b.likes - a.likes);

  const outDir = path.dirname(OUTPUT);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify({ collectedAt: new Date().toISOString(), total: unique.length, notes: unique }, null, 2), 'utf-8');

  console.log(`\n✅ ${unique.length} 条笔记 → ${OUTPUT}`);
  console.log('\n📊 TOP 15:');
  console.log('─'.repeat(65));
  unique.slice(0, 15).forEach((n, i) => {
    const t = (n.title || n.desc || '').replace(/\n/g, ' ').substring(0, 45);
    console.log(`${(i+1).toString().padStart(2)}. [👍${String(n.likes).padStart(6)}] ${t}`);
  });

  // 写完成信号
  fs.writeFileSync(path.join(os.homedir(), 'temp', 'xhs_done'), 'done');

  await context.close();
  console.log('\n🏁 完成!');
})();
