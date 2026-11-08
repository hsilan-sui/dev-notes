const assert = require('node:assert/strict');
const {chromium,webkit} = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const base=process.env.WORDS_PREVIEW_URL||'http://127.0.0.1:3009/dev-notes/my-tide/words';
const words=['mission','missionary','commission','admit','admission','permit','permission','commit','commitment','submit','submission','emit','transmit','transmission','remit','remission','omit','omission','intermit','intermission','dismissal'];
const chapters=['使命與派遣','接受、允許與承擔','提交與屈服','傳遞與發出','省略、中斷與解散'];
async function bounds(page,label){
 const issues=await page.evaluate(()=>{
  const out=[];
  if(document.documentElement.scrollWidth>innerWidth)out.push('document overflow');
  const reader=document.querySelector('[aria-label$="詞源展間內容"]'),r=reader.getBoundingClientRect();
  if(reader.scrollWidth>reader.clientWidth+1)out.push('reader overflow');
  for(const el of reader.querySelectorAll('button,strong,p,a,h1,h2,summary')){
   const b=el.getBoundingClientRect();if(b.width&&(b.left<r.left-1||b.right>r.right+1))out.push(el.textContent.slice(0,50));
  }
  for(const network of reader.querySelectorAll('[class*=compactNetwork]')){
   const nodes=[...network.querySelectorAll('button')].map(el=>el.getBoundingClientRect()).filter(b=>b.width);
   for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
    const a=nodes[i],b=nodes[j];if(Math.min(a.right,b.right)>Math.max(a.left,b.left)&&Math.min(a.bottom,b.bottom)>Math.max(a.top,b.top))out.push('overlapping family nodes');
   }
  }
  return out;
 });assert.deepEqual(issues,[],label);
}
async function check(type,name,executablePath){
 const browser=await type.launch({headless:true,...(executablePath?{executablePath}:{})});
 try{
  const page=await browser.newPage({hasTouch:true,reducedMotion:'reduce'}),errors=[];
  page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
  for(const width of [320,375,390,834,1080,1280,1440]){
   await page.setViewportSize({width,height:900});
   for(const word of ['humble','humidity','mission']){
    await page.goto(`${base}/${word}`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.hasHydrated==='true');
    assert.equal(await page.locator('main').count(),1);
    const dialog=page.getByRole('dialog'),article=dialog.locator('article');
    const sections=await article.locator(':scope > section').evaluateAll(nodes=>nodes.map(el=>el.querySelector(':scope > small')?.textContent.split(' / ')[0]||'REFERENCES'));
    assert.deepEqual(sections,['WORD ANATOMY','WORD FAMILY','THE STORY','WORD BUILDING','REFERENCES'],'same concise section order as archive 002');
    assert.deepEqual(await article.locator(':scope > header').evaluate(el=>[...el.children].map(n=>n.tagName)),['SMALL','H1','H2','P']);
    assert.equal(await article.locator('[class*=anatomyParts]>a').count(),2);
    assert.equal(await article.locator('#mission-word-detail').count(),0,'no separate word-room flow');
    assert.equal(await article.locator('[class*=originSteps], [class*=topicEmblem], audio,video,iframe').count(),0);
    assert.equal(await article.locator(':scope > section').nth(2).locator('p').count()<=4,true,'short story');
    await bounds(page,`${name} ${width} ${word} compact format`);
    if(width===390||width===1440)await page.screenshot({path:`/private/tmp/compact-${name}-${width}-${word}-intro.png`});
    if(word==='mission'){
     for(const title of chapters){const summary=dialog.locator('summary').filter({hasText:title});if(!(await summary.locator('..').getAttribute('open')!==null))await summary.tap();}
     assert.equal(await dialog.locator('[class*=compactNetwork] button[class*=memoryNode]').count(),21);
     for(const term of words){const node=dialog.getByRole('button',{name:new RegExp(`^${term}\\s`)});await node.tap();assert.equal(await node.getAttribute('aria-pressed'),'true');}
     const ancestry=dialog.getByRole('link',{name:/mit- \/ mitt-/});await ancestry.tap();
     for(const title of chapters)assert.equal(await dialog.getByRole('group',{name:`${title} 詞族關係圖`}).getByRole('button',{name:/^mit- \/ mitt-/}).getAttribute('aria-pressed'),'true');
     await bounds(page,`${name} ${width} all 21 nodes expanded`);
    }else{
     const anatomy=article.locator('[class*=anatomyParts]>a').first();await anatomy.tap();
     const group=dialog.getByRole('group',{name:`${word} 詞族關係圖`});
     assert(await group.locator('line[class*=activeEdge]').count()>0);
    }
    if(width===390||width===1440)await page.screenshot({path:`/private/tmp/compact-${name}-${width}-${word}-family.png`});
    await article.locator(':scope > section').last().locator('summary').first().tap();
    await bounds(page,`${name} ${width} sources expanded`);
    await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'});
   }
   console.log(`${name} ${width}: three matching formats, 21 Mission words, anatomy selection, bounds and sources passed`);
  }
  for(const suffix of ['/mission/','/mission.html']){
   await page.goto(`${base}${suffix}?test=mission#mission-family`,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.documentElement.dataset.hasHydrated==='true');
   assert.match(page.url(),/\/mission\?test=mission#mission-family$/);assert.equal(await page.locator('main').count(),1);
   await page.reload({waitUntil:'domcontentloaded'});await page.getByRole('dialog').getByRole('heading',{name:'mission',exact:true}).waitFor();
  }
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.documentElement.dataset.hasHydrated==='true');
  const start=page.url();await page.getByRole('button',{name:/^mission，/}).tap();await page.getByRole('dialog').getByRole('heading',{name:'mission',exact:true}).waitFor();assert.equal(page.url(),start);
  assert.deepEqual(errors,[]);console.log(`${name}: direct URLs, query/hash, reload, in-place reading passed`);
 }finally{await browser.close();}
}
(async()=>{await check(chromium,'Chrome',process.env.CHROME_EXECUTABLE);await check(webkit,'WebKit',process.env.WEBKIT_EXECUTABLE);})().catch(e=>{console.error(e);process.exitCode=1;});
