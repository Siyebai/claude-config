/**
 * 小红书博主内容提取 — Playwright 浏览器操控版
 *
 * 用法:
 *   node scrape.js
 *
 * 首次运行会打开浏览器，需要手动扫码/手机号登录一次。
 * 登录信息保存在 ~/.xhs-browser-profile/，以后再跑不用重新登录。
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');

const TARGET_USER_ID = '11389383573';
const PROFILE_DIR = path.join(os.homedir(), '.xhs-browser-profile');
const OUTPUT_FILE = path.join(os.homedir(), 'temp', 'xhs_data.json');

(async () => {
  console.log('🚀 启动浏览器...');

  // 持久化浏览器上下文 — 保存登录状态
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    channel: 'chromium',
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  // ===== 打开博主主页 =====
  const profileUrl = `https://www.xiaohongshu.com/user/profile/${TARGET_USER_ID}`;
  console.log(`📍 导航到: ${profileUrl}`);
  await page.goto(profileUrl, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {
    console.log('⚠️  页面加载较慢，继续尝试...');
  });

  await page.waitForTimeout(3000);

  // ===== 检查是否需要登录 =====
  const loginButton = await page.$('text=登录');
  if (loginButton) {
    console.log('🔐 需要登录！请在浏览器中手动扫码或手机验证码登录。');
    console.log('⏳ 等待登录完成 (最多 120 秒)...');
    await page.waitForURL('**/user/profile/**', { timeout: 120000 }).catch(() => {});
    console.log('✅ 登录似乎已完成');
    await page.waitForTimeout(3000);
  }

  // ===== 自动滚动加载全部笔记 =====
  console.log('📜 开始滚动加载全部笔记...');
  let lastCount = 0;
  let noChange = 0;
  let scrollCount = 0;

  while (noChange < 5 && scrollCount < 100) {
    // 滚动到底部
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(2000 + Math.random() * 1000);

    // 统计可见笔记数
    const count = await page.evaluate(() => {
      return document.querySelectorAll('section.note-item, a[href*="/explore/"], a[href*="/note/"], [class*="noteItem"]').length;
    });

    if (count === lastCount) {
      noChange++;
    } else {
      noChange = 0;
      process.stdout.write(`\r   📄 已发现 ${count} 张笔记卡片...`);
    }
    lastCount = count;
    scrollCount++;
  }
  console.log('');

  // ===== 提取笔记列表 =====
  console.log('🔍 提取笔记列表...');

  const notes = await page.evaluate(() => {
    const results = [];
    const seen = new Set();

    // 尝试多种选择器匹配笔记卡片
    const cardSelectors = [
      'section.note-item',
      '[class*="noteItem"]',
      'a[href*="/explore/"]',
      'a[href*="/note/"]',
    ];

    for (const sel of cardSelectors) {
      document.querySelectorAll(sel).forEach(card => {
        try {
          const linkEl = card.tagName === 'A' ? card : card.querySelector('a');
          const href = linkEl?.href || card.href || '';
          const noteId = href.match(/\/(?:explore|note)\/([a-zA-Z0-9]+)/)?.[1];
          if (!noteId || seen.has(noteId)) return;
          seen.add(noteId);

          const title = card.querySelector('[class*="title"], .title, h3')?.textContent?.trim() || '';
          const desc = card.querySelector('[class*="desc"], .desc, p')?.textContent?.trim() || '';
          const likeEl = card.querySelector('[class*="like"] span, [class*="count"], .like-count');
          const likes = likeEl?.textContent?.trim() || '0';
          const imgEl = card.querySelector('img');
          const coverImg = imgEl?.src || '';

          results.push({ noteId, href, title: title || desc.slice(0, 80), likes, coverImg });
        } catch (e) { /* skip */ }
      });
      if (results.length > 3) break;
    }
    return results;
  });

  console.log(`✅ 提取到 ${notes.length} 条笔记`);

  // ===== 按点赞数排序并打开高赞笔记获取完整内容 =====
  // 先估算点赞数用于排序
  function parseLikes(s) {
    s = String(s);
    if (s.includes('万') || s.includes('w')) return parseFloat(s) * 10000;
    return parseInt(s.replace(/[^0-9]/g, '')) || 0;
  }

  notes.sort((a, b) => parseLikes(b.likes) - parseLikes(a.likes));

  // 取前 30 条高赞笔记，逐个打开获取完整内容
  const TOP_N = Math.min(30, notes.length);
  console.log(`\n📖 打开前 ${TOP_N} 条高赞笔记获取完整内容...\n`);

  for (let i = 0; i < TOP_N; i++) {
    const note = notes[i];
    const noteUrl = `https://www.xiaohongshu.com/explore/${note.noteId}`;
    process.stdout.write(`   [${i + 1}/${TOP_N}] ${note.title?.substring(0, 30) || note.noteId}... `);

    try {
      await page.goto(noteUrl, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1500 + Math.random() * 1000);

      // 提取笔记完整内容
      const detail = await page.evaluate(() => {
        const desc = document.querySelector('#detail-desc, [class*="note-text"], [class*="desc"], [class*="content"]')?.textContent?.trim() || '';
        const title = document.querySelector('[class*="title"], h1')?.textContent?.trim() || '';
        const likes = document.querySelector('[class*="like"] span, [class*="likes"]')?.textContent?.trim() || '';
        const collects = document.querySelector('[class*="collect"] span, [class*="collects"]')?.textContent?.trim() || '';
        const comments = document.querySelector('[class*="comment"] span, [class*="comments"]')?.textContent?.trim() || '';

        // 提取图片 alt 文本 (小红书笔记通常是图文)
        const images = Array.from(document.querySelectorAll('img[alt]')).map(img => img.alt).filter(Boolean);

        // 提取话题标签
        const tags = Array.from(document.querySelectorAll('[class*="tag"], [class*="topic"], a[href*="/topic/"]'))
          .map(el => el.textContent.trim()).filter(Boolean);

        return { title, desc, likes, collects, comments, imageAlts: images, tags };
      });

      note.fullContent = detail.desc || note.title;
      note.detailTitle = detail.title;
      note.likes = detail.likes || note.likes;
      note.collects = detail.collects;
      note.comments = detail.comments;
      note.tags = detail.tags;
      note.imageTexts = detail.imageAlts;

      console.log(`👍${note.likes} 📝${(detail.desc?.length || 0)}字`);
    } catch (e) {
      console.log(`⚠️ 跳过: ${e.message?.substring(0, 30)}`);
    }

    // 每 10 条休息一下
    if ((i + 1) % 10 === 0) {
      await page.waitForTimeout(2000);
    }
  }

  // ===== 保存数据 =====
  const outDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const output = {
    collectedAt: new Date().toISOString(),
    totalNotes: notes.length,
    fullContentFetched: TOP_N,
    notes,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n✅ 数据已保存到: ${OUTPUT_FILE}`);
  console.log(`   共 ${notes.length} 条笔记，前 ${TOP_N} 条已获取完整内容`);

  // ===== 打印摘要 =====
  console.log('\n📊 高赞内容 TOP 10:');
  console.log('─'.repeat(60));
  notes.slice(0, 10).forEach((n, i) => {
    const title = (n.detailTitle || n.title || '(无标题)').substring(0, 50);
    console.log(`${i + 1}. [👍${n.likes} | ⭐${n.collects || '-'}] ${title}`);
  });

  await context.close();
  console.log('\n🏁 完成!');
})();
