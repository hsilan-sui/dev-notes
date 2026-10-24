// Run against `npm run serve -- --port 3004`.
// PLAYWRIGHT_MODULE may point at an external playwright-core installation.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {chromium, webkit} = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const base = process.env.PAPYRUS_PREVIEW_URL || 'http://127.0.0.1:3004/dev-notes/失落文字博物館/';
const widths = [320, 375, 390, 834, 1080, 1280, 1440];
const artifacts = process.env.PAPYRUS_ARTIFACTS || '/private/tmp/mytide-step8-qa';
fs.mkdirSync(artifacts, {recursive: true});

async function write(page, finale) {
  await finale.getByRole('button', {name: 'Write on it', exact: true}).click();
  await finale.locator('svg').scrollIntoViewIfNeeded();
  const box = await finale.locator('svg').boundingBox();
  const p = (x, y) => [box.x + x / 360 * box.width, box.y + y / 240 * box.height];
  await page.mouse.move(...p(110, 90));
  await page.mouse.down();
  await page.mouse.move(...p(150, 150), {steps: 6});
  await page.mouse.move(...p(210, 100), {steps: 6});
  await page.mouse.up();
  await finale.getByRole('button', {name: 'Put it down', exact: true}).click();
}
async function run(type, name, options) {
  const browser = await type.launch({headless: true, ...options});
  try {
    const page = await browser.newPage({viewport: {width: 390, height: 844}, hasTouch: true});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base);
    await page.getByRole('radio', {name: 'English', exact: true}).click();
    const workshop = page.locator('[aria-labelledby="lw-workshop-title"]');
    await workshop.locator('.LostWords_overviewFlow button').nth(7).click();
    const finale = workshop.locator('.LostWords_papyrusFinale');
    await finale.waitFor();
    assert.equal(await finale.getAttribute('data-phase'), 'ready');
    assert.match(await finale.innerText(), /Your Papyrus/);
    assert.match(await finale.innerText(), /Every scroll begins with a mark\./);
    assert.equal(await finale.locator('[role="status"]').count(), 0);

    await write(page, finale);
    assert.equal(await finale.getAttribute('data-phase'), 'written');
    const ink = await finale.locator('[data-ink]').evaluateAll(nodes => nodes.map(n => n.outerHTML));
    assert.ok(ink.length);
    const time = finale.getByRole('status');
    assert.match(await time.innerText(), /Through Time/);
    const originalTime = await time.elementHandle();
    // A normal re-render (light toggle) must not remount the completion message.
    await finale.getByRole('button', {name: 'Hold it up to the light', exact: true}).click();
    assert.ok(await originalTime.evaluate(node => node.isConnected));
    await finale.getByRole('button', {name: 'Roll it up', exact: true}).click();
    assert.equal(await finale.getAttribute('data-phase'), 'rolling');
    // Animation is reversible immediately, without locking the UI.
    await finale.getByRole('button', {name: 'Unroll', exact: true}).click();
    assert.equal(await finale.getAttribute('data-phase'), 'unrolling');
    await finale.getByRole('button', {name: 'Roll it up', exact: true}).click();
    await page.waitForFunction(() => document.querySelector('.LostWords_papyrusFinale')?.dataset.phase === 'rolled');
    assert.match(await finale.innerText(), /A Message Across Time/);
    assert.match(await finale.innerText(), /Your words are now part of the scroll\./);
    assert.equal(await finale.getByRole('button', {name: 'Write on it', exact: true}).count(), 0);
    await finale.getByRole('button', {name: 'Unroll', exact: true}).click();
    await page.waitForFunction(() => document.querySelector('.LostWords_papyrusFinale')?.dataset.phase === 'written');
    assert.deepEqual(await finale.locator('[data-ink]').evaluateAll(nodes => nodes.map(n => n.outerHTML)), ink);
    assert.ok(await originalTime.evaluate(node => node.isConnected));
    assert.ok((await finale.innerText()).includes('Sheets joined end to end become a scroll.'));

    for (const width of widths) {
      await page.setViewportSize({width, height: 844});
      const overflow = await page.evaluate(() => {
        const room = document.querySelector('.LostWords_room');
        const finale = document.querySelector('.LostWords_papyrusFinale');
        const outliers = [...finale.querySelectorAll('*')].filter(node => {
          const box = node.getBoundingClientRect();
          return box.width > 0 && (box.left < -1 || box.right > innerWidth + 1);
        }).map(node => node.tagName + '.' + node.getAttribute('class'));
        const visibleRoomOutliers = [...room.querySelectorAll('*')].filter(node => {
          const box = node.getBoundingClientRect();
          if (!box.width || (box.left >= -1 && box.right <= innerWidth + 1)) return false;
          for (let ancestor = node; ancestor && ancestor !== room; ancestor = ancestor.parentElement) {
            const style = getComputedStyle(ancestor);
            if (style.clipPath !== 'none' || ['hidden', 'clip', 'scroll', 'auto'].includes(style.overflowX)) return false;
          }
          return true;
        }).map(node => node.tagName + '.' + node.getAttribute('class'));
        return {page: document.documentElement.scrollWidth > innerWidth,
          room: room.scrollWidth > room.clientWidth, outliers, visibleRoomOutliers};
      });
      assert.equal(overflow.page, false, `${name} ${width}px page overflow`);
      assert.deepEqual(overflow.outliers, [], `${name} ${width}px Step 8 overflow`);
      assert.deepEqual(overflow.visibleRoomOutliers, [], `${name} ${width}px visible exhibit overflow`);
      console.log(`${name} ${width}px: Step 8 fits; visible exhibit fits; existing clipped overflow=${overflow.room}`);
    }
    await page.setViewportSize({width: 390, height: 844});
    await finale.getByRole('button', {name: 'Erase', exact: true}).click();
    assert.equal(await finale.locator('[data-ink]').count(), 0);
    assert.equal(await finale.getAttribute('data-phase'), 'writing');
    assert.equal(await finale.getByRole('status').count(), 0);
    await finale.getByRole('button', {name: 'Put it down', exact: true}).click();
    assert.equal(await finale.getAttribute('data-phase'), 'ready');
    assert.equal(await finale.getByRole('status').count(), 0);
    await write(page, finale);
    await finale.getByRole('button', {name: 'Write on it', exact: true}).click();
    await finale.locator('svg').scrollIntoViewIfNeeded();
    const touchBox = await finale.locator('svg').boundingBox();
    await page.touchscreen.tap(touchBox.x + touchBox.width / 2, touchBox.y + touchBox.height / 2);
    await finale.getByRole('button', {name: 'Put it down', exact: true}).click();
    assert.equal(await finale.locator('[data-ink]').count(), 2, 'Touch tap leaves a visible ink dot');
    await finale.locator('svg').screenshot({path: `${artifacts}/${name}-paper.png`});
    await finale.getByRole('button', {name: 'Roll it up', exact: true}).click();
    await page.waitForFunction(() => document.querySelector('.LostWords_papyrusFinale')?.dataset.phase === 'rolled');
    await finale.locator('svg').screenshot({path: `${artifacts}/${name}-scroll.png`});
    await finale.getByRole('button', {name: 'Make another', exact: true}).click();
    assert.equal(await finale.count(), 0);
    assert.equal(await workshop.locator('.LostWords_workRail').getAttribute('aria-label'), 'Step 1 of 8');
    await workshop.locator('.LostWords_overviewFlow button').nth(7).click();
    assert.equal(await finale.getAttribute('data-phase'), 'ready');
    assert.equal(await finale.locator('[data-ink]').count(), 0);
    // Reduced motion still allows user-triggered roll/unroll, without animation.
    await page.emulateMedia({reducedMotion: 'reduce'});
    await write(page, finale);
    await finale.getByRole('button', {name: 'Roll it up', exact: true}).click();
    await page.waitForFunction(() => document.querySelector('.LostWords_papyrusFinale')?.dataset.phase === 'rolled');
    assert.equal(await finale.locator('.LostWords_papyrusRoll').evaluate(node => getComputedStyle(node).transitionDuration), '0s');
    await finale.getByRole('button', {name: 'Unroll', exact: true}).click();
    await page.waitForFunction(() => document.querySelector('.LostWords_papyrusFinale')?.dataset.phase === 'written');
    assert.ok(await finale.locator('[data-ink]').count());
    // Step 7 continues to use the original workbench.
    await workshop.locator('.LostWords_overviewFlow button').nth(6).click();
    assert.equal(await finale.count(), 0);
    assert.equal(await workshop.locator('.LostWords_workRail').getAttribute('aria-label'), 'Step 7 of 8');
    assert.deepEqual(errors, []);
    console.log(`${name}: writing, finish, roll, reverse, unroll, ink retention, message, erase, restart, reduced motion PASS`);
  } finally { await browser.close(); }
}
(async () => {
  await run(chromium, 'chromium', process.env.CHROMIUM_PATH ? {executablePath: process.env.CHROMIUM_PATH} : {});
  await run(webkit, 'webkit', process.env.WEBKIT_PATH ? {executablePath: process.env.WEBKIT_PATH} : {});
})().catch(error => {console.error(error); process.exitCode = 1;});
