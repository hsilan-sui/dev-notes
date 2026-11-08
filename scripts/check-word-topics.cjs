const assert = require('node:assert/strict');
const {chromium, webkit} = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const base = process.env.WORDS_PREVIEW_URL || 'http://127.0.0.1:3009/dev-notes/my-tide/words';
const widths = [320, 375, 390, 834, 1080, 1280, 1440];

async function bounds(page, label) {
  const problems = await page.evaluate(() => {
    const issues = [];
    if (document.documentElement.scrollWidth > innerWidth) issues.push('document overflow');
    const reader = document.querySelector('[aria-label$="詞源展間內容"]');
    if (reader) {
      if (reader.scrollWidth > reader.clientWidth + 1) issues.push('reader overflow');
      const outer = reader.getBoundingClientRect();
      for (const el of reader.querySelectorAll('button,strong,p,a,li,h1,h2')) {
        const r = el.getBoundingClientRect();
        if (r.width && (r.left < outer.left - 1 || r.right > outer.right + 1)) issues.push(el.textContent.slice(0, 50));
      }
      const nodes = [...reader.querySelectorAll('[aria-controls="topic-node-detail"]')];
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i].getBoundingClientRect(), b = nodes[j].getBoundingClientRect();
        if (Math.min(a.right,b.right)>Math.max(a.left,b.left) && Math.min(a.bottom,b.bottom)>Math.max(a.top,b.top)) issues.push(`overlapping nodes ${nodes[i].textContent}/${nodes[j].textContent}`);
      }
    }
    return issues;
  });
  assert.deepEqual(problems, [], label);
}

async function check(type, name, executablePath) {
  console.log(`${name}: launching browser`);
  const browser = await type.launch({headless:true, ...(executablePath ? {executablePath} : {})});
  const errors = [];
  try {
    console.log(`${name}: browser ready`);
    const page = await browser.newPage({hasTouch:true, reducedMotion:'reduce'});
    page.setDefaultTimeout(15000);
    page.setDefaultNavigationTimeout(20000);
    page.on('pageerror', err => errors.push(err.message));
    for (const width of widths) {
      await page.setViewportSize({width, height:900});
      console.log(`${name} ${width}: loading atlas`);
      await page.goto(base, {waitUntil:'domcontentloaded'});
      await page.getByRole('button', {name:/^humble，/}).waitFor();
      await page.waitForFunction(() => document.querySelector('[aria-label="可平移縮放的主詞彙星圖"]').clientWidth === innerWidth);
      await bounds(page, `${name} ${width} atlas`);
      const planets = await page.locator('button[aria-label*="，"]').evaluateAll(nodes => nodes.map(el => {const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};}));
      assert.equal(planets.length,5);
      for (const r of planets) assert(r.left>=0 && r.right<=width, `${name} ${width} planet is clipped`);
      for (let i=0;i<planets.length;i++) for(let j=i+1;j<planets.length;j++) {
        const a=planets[i], b=planets[j];
        assert(!(Math.min(a.right,b.right)>Math.max(a.left,b.left) && Math.min(a.bottom,b.bottom)>Math.max(a.top,b.top)), 'overlapping planet buttons');
      }
      if (width===390 || width===1440) await page.screenshot({path:`/private/tmp/words-${name}-${width}.png`,fullPage:true});
      for (const word of ['humble','humidity']) {
        const before = page.url();
        await page.getByRole('button', {name:new RegExp(`^${word}，`)}).tap();
        const dialog = page.getByRole('dialog');
        await dialog.getByRole('heading', {name:word, exact:true}).waitFor();
        assert.equal(page.url(),before,'opening an archive stays in the atlas');
        await bounds(page,`${name} ${width} ${word}`);
        const group = dialog.getByRole('group',{name:`${word} 詞族關係圖`});
        const node = group.getByRole('button',{name:word==='humble' ? 'humility n. 謙卑' : 'humidification n. 加濕作用',exact:true});
        await node.tap();
        assert.equal(await node.getAttribute('aria-pressed'),'true');
        assert(await group.locator('line[class*=activeEdge]').count()>0,'selected word highlights its family');
        assert.equal(await dialog.locator('audio,video,iframe').count(),0,'no media controls');
        if (width===390 || width===1440) await page.screenshot({path:`/private/tmp/words-${name}-${width}-${word}-family.png`});
        await page.keyboard.press('Escape');
        await page.getByRole('dialog').waitFor({state:'detached'});
      }
      console.log(`${name} ${width}: five planets, both graphs, selection, compact format, close, bounds passed`);
    }
    for (const word of ['humble','humidity']) {
      for (const suffix of ['', '/']) {
        await page.goto(`${base}/${word}${suffix}`);
        await page.getByRole('dialog').getByRole('heading',{name:word,exact:true}).waitFor();
        await page.reload();
        await page.getByRole('dialog').getByRole('heading',{name:word,exact:true}).waitFor();
      }
    }
    await page.goto(base);
    await page.getByRole('button',{name:/^nostalgia，/}).click();
    await page.getByRole('dialog').getByRole('heading',{name:'nostalgia',exact:true}).waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('button',{name:/^enthusiasm，/}).click();
    await page.getByRole('dialog').getByRole('heading',{name:'enthusiasm',exact:true}).waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'放大星圖'}).click();
    assert.equal(await page.getByRole('status').innerText(),'120%');
    await page.getByRole('button',{name:'重置視角'}).click();
    assert.equal(await page.getByRole('status').innerText(),'100%');
    assert.deepEqual(errors,[],'no browser runtime errors');
    console.log(`${name}: direct URLs, reload, previous archives and zoom passed`);
  } finally {await browser.close();}
}
(async () => {
  await check(chromium,'Chrome',process.env.CHROME_EXECUTABLE);
  await check(webkit,'WebKit',process.env.WEBKIT_EXECUTABLE);
})().catch(err => {console.error(err);process.exitCode=1;});
