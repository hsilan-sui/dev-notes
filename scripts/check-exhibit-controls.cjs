const assert = require('node:assert/strict');
const {chromium, webkit} = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const url = process.env.PAPYRUS_PREVIEW_URL || 'http://127.0.0.1:3004/dev-notes/失落文字博物館/';

async function check(type, name, executablePath) {
  const browser = await type.launch({headless: true, ...(executablePath ? {executablePath} : {})});
  try {
    const page = await browser.newPage({viewport: {width: 390, height: 844}, hasTouch: true});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url);
    await page.getByRole('radio', {name: 'English', exact: true}).click();
    const eruption = page.locator('[aria-labelledby="lw-eruption-title"]');
    const controls = eruption.locator(':scope > .LostWords_unrollButtons');
    const model = eruption.locator(':scope > .LostWords_stage3d');
    assert.equal(await controls.locator('button').count(), 3);
    for (const width of [320, 375, 390, 834, 1080, 1280, 1440]) {
      await page.setViewportSize({width, height: 844});
      const row = await controls.boundingBox(), picture = await model.boundingBox();
      assert.ok(row.y + row.height <= picture.y, `${name} ${width}: controls above model`);
      assert.ok(picture.y - row.y - row.height <= 32, `${name} ${width}: controls adjacent to model`);
      assert.ok(row.x >= 0 && row.x + row.width <= width);
      for (const button of await controls.locator('button').all()) {
        const box = await button.boundingBox();
        assert.ok(box.height >= 44 && box.x >= 0 && box.x + box.width <= width);
      }
    }
    await controls.getByRole('button', {name: /Next/}).click();
    assert.equal(await eruption.locator('input[type="range"]').inputValue(), '1');
    await controls.getByRole('button', {name: /Previous/}).click();
    assert.equal(await eruption.locator('input[type="range"]').inputValue(), '0');
    await controls.getByRole('button', {name: 'Play', exact: true}).click();
    await page.waitForFunction(() => document.querySelector('[aria-labelledby="lw-eruption-title"] input').value === '1');
    await controls.getByRole('button', {name: 'Pause', exact: true}).click();

    const workshop = page.locator('[aria-labelledby="lw-workshop-title"]');
    await workshop.locator('.LostWords_overviewFlow button').nth(2).click();
    const bench = workshop.locator('.LostWords_workStage');
    const tools = bench.locator('.LostWords_cutTools');
    assert.equal(await tools.getByRole('button').count(), 2);
    await tools.locator('summary').click();
    assert.ok(await tools.locator('details').evaluate(node => node.open));
    assert.match(await tools.locator('details').innerText(), /Crossing the strips comes later/);
    await tools.getByRole('button', {name: /Cut strips/}).click();
    await workshop.getByRole('button', {name: 'Cut a strip', exact: true}).click();
    assert.equal(await tools.getByRole('button', {name: /Cut strips/}).getAttribute('aria-pressed'), 'true');
    await tools.getByRole('button', {name: /Peel thin sheets/}).click();
    assert.equal(await tools.getByRole('button', {name: /Peel thin sheets/}).getAttribute('aria-pressed'), 'true');
    await workshop.getByRole('button', {name: 'Peel a sheet', exact: true}).click();
    assert.equal(await tools.getByRole('button').count(), 2, 'Options remain on the workbench after choosing');
    for (const width of [320, 375, 390, 834, 1080, 1280, 1440]) {
      await page.setViewportSize({width, height: 844});
      assert.ok(await bench.evaluate(node => node.scrollWidth <= node.clientWidth));
      for (const button of await tools.getByRole('button').all()) {
        const box = await button.boundingBox();
        assert.ok(box.x >= 0 && box.x + box.width <= width);
      }
    }
    await page.setViewportSize({width: 390, height: 844});
    await bench.screenshot({path: `/private/tmp/mytide-step8-qa/${name}-cutting.png`});
    await page.getByRole('radio', {name: '中文', exact: true}).click();
    assert.equal(await tools.getByRole('button', {name: /切成直條/}).count(), 1);
    assert.equal(await tools.getByRole('button', {name: /剝成薄片/}).count(), 1);
    assert.equal(await workshop.getByRole('button', {name: '剝下一片', exact: true}).count(), 1);
    assert.deepEqual(errors, []);
    console.log(`${name}: model controls, playback, persistent cutting choices, help, bilingual labels, seven widths PASS`);
  } finally { await browser.close(); }
}
(async () => {
  await check(chromium, 'Chrome', process.env.CHROMIUM_PATH);
  await check(webkit, 'WebKit', process.env.WEBKIT_PATH);
})().catch(error => {console.error(error); process.exitCode = 1;});
