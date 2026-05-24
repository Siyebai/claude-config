/**
 * 诊断脚本 — 抓取页面实际结构 + 拦截 API 响应
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');

const TARGET_USER_ID = '11389383573';
const PROFILE_DIR = path.join(os.homedir(), '.xhs-browser-profile');
const OUTPUT_FILE = path.join(os.homedir(), 'temp', 'xhs_data.json');

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    channel: 'chromium',
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  });

  const page = await context.newPage();

  // 拦截 API 响应 — 这是最可靠的数据源
  const apiResponses = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/sns/web/v1/note/') || url.includes('user/posted')) {
      try {
        const body = await response.json();
        apiResponses.push({ url, data: body });
        console.log(`📦 捕获 API: ${url.substring(0, 100)}`);
      } catch (e) {}
    }
  });

  // 导航
  const profileUrl = `https://www.xiaohongshu.com/user/profile/${TARGET_USER_ID}`;
  console.log(`📍 ${profileUrl}`);
  await page.goto(profileUrl, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});

  // 等页面渲染
  await page.waitForTimeout(5000);

  // 诊断: 打印页面基本信息
  const pageInfo = await page.evaluate(() => ({
    title: document.title,
    url: location.href,
    bodyClasses: document.body.className,
    totalElements: document.querySelectorAll('*').length,
    links: Array.from(document.querySelectorAll('a')).filter(a => a.href.includes('/explore/') || a.href.includes('/note/')).slice(0, 10).map(a => ({ href: a.href, text: a.textContent?.trim()?.slice(0, 40) })),
    sections: Array.from(document.querySelectorAll('section')).length,
    allClassNames: Array.from(document.querySelectorAll('[class]')).slice(0, 50).map(el => el.className),
  }));

  console.log('\n📄 页面诊断:');
  console.log(JSON.stringify(pageInfo, null, 2));

  // 滚动加载
  console.log('\n📜 滚动加载...');
  for (let i = 0; i < 15; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
  }

  // 再次诊断
  const afterScroll = await page.evaluate(() => {
    const noteCards = [];
    // 尝试找所有包含 /explore/ 链接的元素
    const allLinks = document.querySelectorAll('a[href*="/explore/"], a[href*="/note/"]');
    const seen = new Set();
    allLinks.forEach(a => {
      const href = a.href;
      const noteId = href.match(/\/(?:explore|note)\/([a-zA-Z0-9]+)/)?.[1];
      if (noteId && !seen.has(noteId)) {
        seen.add(noteId);
        // 往上找父容器
        let parent = a;
        for (let i = 0; i < 10; i++) {
          parent = parent.parentElement;
          if (!parent) break;
          const text = parent.textContent?.trim()?.substring(0, 200);
          if (text && text.length > 20) {
            noteCards.push({ noteId, href, containerTag: parent.tagName, containerClass: parent.className, textSnippet: text });
            break;
          }
        }
      }
    });
    return { linkCount: allLinks.length, uniqueNotes: seen.size, noteCards: noteCards.slice(0, 20) };
  });

  console.log('\n📄 滚动后诊断:');
  console.log(JSON.stringify(afterScroll, null, 2));

  // 如果 API 捕获到了数据，直接用它
  if (apiResponses.length > 0) {
    console.log(`\n✅ 捕获到 ${apiResponses.length} 条 API 响应!`);
    const allNotes = [];
    apiResponses.forEach(r => {
      const data = r.data?.data;
      if (data?.notes) allNotes.push(...data.notes);
      if (Array.isArray(data)) allNotes.push(...data);
    });

    if (allNotes.length > 0) {
      const notes = allNotes.map(n => ({
        noteId: n.note_id || n.id || n.noteId,
        title: n.title || n.display_title || n.note_title || '',
        desc: n.desc || n.description || '',
        likes: n.likes || n.liked_count || n.like_count || 0,
        collects: n.collects || n.collected_count || n.collect_count || 0,
        comments: n.comments || n.comment_count || 0,
        type: n.type || n.note_type || '',
        tags: (n.tags || n.tag_list || []).map(t => t.name || t),
        time: n.time || n.create_time || n.publish_time || '',
        user: n.user?.nickname || n.user?.nick_name || '',
      }));

      notes.sort((a, b) => b.likes - a.likes);

      const outDir = path.dirname(OUTPUT_FILE);
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

      fs.writeFileSync(OUTPUT_FILE, JSON.stringify({
        collectedAt: new Date().toISOString(),
        total: notes.length,
        top30: notes.slice(0, 30),
        all: notes,
      }, null, 2), 'utf-8');

      console.log(`\n✅ 从 API 提取到 ${notes.length} 条笔记!`);
      console.log(`   保存到: ${OUTPUT_FILE}`);
      console.log('\n📊 TOP 10:');
      notes.slice(0, 10).forEach((n, i) => {
        const title = (n.title || n.desc || '').substring(0, 50);
        console.log(`${i + 1}. [👍${n.likes} | ⭐${n.collects}] ${title}`);
      });
    }
  } else {
    console.log('\n⚠️  未捕获到 API 响应。请手动检查页面是否正常显示笔记列表。');
  }

  await context.close();
  console.log('\n🏁 完成!');
})();
