const assert = require('node:assert/strict');
const {chromium, webkit} = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const url = process.env.SONG_PREVIEW_URL || 'http://127.0.0.1:3004/dev-notes/my-tide';

async function check(type, name, executablePath) {
  const browser = await type.launch({headless: true, ...(executablePath ? {executablePath} : {})});
  try {
    const page = await browser.newPage({hasTouch: true});
    // Stub third-party media; verify the selected source and play command,
    // without relying on YouTube availability or claiming audible playback.
    await page.route('https://www.youtube-nocookie.com/embed/**', route => route.fulfill({
      contentType: 'text/html',
      body: '<script>window.commands=[];addEventListener("message",e=>{try{window.commands.push(JSON.parse(e.data))}catch{}})</script>',
    }));
    await page.goto(url);
    await page.waitForFunction(() => document.querySelector('summary') !== null);
    for (const width of [320, 375, 390, 834, 1080, 1280, 1440]) {
      await page.setViewportSize({width, height: 844});
      const summary = page.locator('summary').filter({hasText: '歌單'}).filter({visible: true});
      const list = page.getByRole('group', {name: '選擇哪一天的歌'}).filter({visible: true});
      const iframe = page.locator('iframe[src*="youtube-nocookie.com/embed/"]');
      await summary.tap();
      const size = await list.evaluate(el => ({height: el.clientHeight, scroll: el.scrollHeight, left: el.getBoundingClientRect().left, right: el.getBoundingClientRect().right}));
      assert(size.height <= 220 && size.scroll > size.height);
      assert(size.left >= 0 && size.right <= width);
      // Regression: an already selected song must open the player too.
      await list.getByRole('button', {name: /全世界失眠/}).tap();
      await iframe.waitFor({state: 'visible'});
      assert.match(await iframe.getAttribute('src'), /\/E6A_cwM7PWY\?autoplay=1/);
      assert.equal(await summary.locator('..').getAttribute('open'), null);
      assert.equal(await page.getByRole('link', {name: '在 YouTube 聽這首歌 ↗'}).getAttribute('href'), 'https://www.youtube.com/watch?v=E6A_cwM7PWY');
      // Safari can blur the summary without focusing the tapped button.
      // Assert the source actually changes, not merely that the menu closes.
      await summary.tap();
      await list.getByRole('button', {name: /五月之戀/}).tap();
      await page.waitForFunction(() => document.querySelector('iframe[src*="/_5dZ38uLEBY?"]'));
      assert.match(await iframe.getAttribute('src'), /\/_5dZ38uLEBY\?autoplay=1/);
      await iframe.contentFrame().locator('body').waitFor();
      await summary.tap();
      await list.getByRole('button', {name: /五月之戀/}).tap();
      const frame = page.frames().find(f => f.url().includes('/_5dZ38uLEBY?'));
      await frame.waitForFunction(() => window.commands.some(c => c.func === 'playVideo'));
      await summary.tap();
      await summary.press('Escape');
      assert.equal(await summary.locator('..').getAttribute('open'), null);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.getByRole('button', {name: '停止並關閉播放器'}).click();
      console.log(`${name} ${width}: tapped song opens correct player, same-song resume, scrolling and bounds passed`);
    }
  } finally {
    await browser.close();
  }
}

(async () => {
  await check(chromium, 'Chrome', process.env.CHROME_EXECUTABLE);
  await check(webkit, 'WebKit', process.env.WEBKIT_EXECUTABLE);
})().catch(error => {console.error(error); process.exitCode = 1;});
