// Browser smoke check. Requires a local Chrome debugging session on port 9333.
// Uses Node's built-in WebSocket/fetch; does not add a browser-test dependency.
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';

const origin = process.env.STUDIO_TEST_URL || 'http://127.0.0.1:4181/';
const output = 'work/studio-review';
await mkdir(output, {recursive: true});
const tab = await (await fetch('http://127.0.0.1:9333/json/new?about:blank', {method: 'PUT'})).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, {once: true}));
let sequence = 0;
const pending = new Map();
const runtimeErrors = [];
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params);
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') runtimeErrors.push(message.params.args);
  if (message.id) {
    const request = pending.get(message.id);
    pending.delete(message.id);
    clearTimeout(request.timer);
    message.error ? request.reject(message.error) : request.resolve(message.result);
  }
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => reject(new Error(`Timed out: ${method}`)), 20000);
    pending.set(id, {resolve, reject, timer});
    ws.send(JSON.stringify({id, method, params}));
  });
}
async function evaluate(expression) {
  const data = await send('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
  if (data.exceptionDetails) throw new Error(JSON.stringify(data.exceptionDetails));
  return data.result.value;
}
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function shot(name) {
  const image = await send('Page.captureScreenshot', {format: 'png'});
  await writeFile(`${output}/${name}.png`, Buffer.from(image.data, 'base64'));
}
async function click(selector) {
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({behavior:'instant',block:'center'})`);
  await pause(100);
  const bounds = () => evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  await send('Input.dispatchMouseEvent', {type: 'mouseMoved', ...await bounds()});
  await pause(500);
  const point = await bounds();
  await send('Input.dispatchMouseEvent', {type: 'mousePressed', button: 'left', clickCount: 1, ...point});
  await send('Input.dispatchMouseEvent', {type: 'mouseReleased', button: 'left', clickCount: 1, ...point});
  await pause(160);
}
async function size(width, height, motion = 'reduce') {
  await send('Emulation.setEmulatedMedia', {features: [{name: 'prefers-reduced-motion', value: motion}]});
  await send('Emulation.setDeviceMetricsOverride', {width, height, deviceScaleFactor: 1, mobile: false});
}

try {
  await send('Page.enable');
  await send('Runtime.enable');
  await size(1440, 900);
  await send('Page.navigate', {url: origin});
  for (let i = 0; i < 80; i++) {
    if (await evaluate('!!document.querySelector(".studio-hero")')) break;
    await pause(100);
  }
  await evaluate('document.fonts.ready');
  assert.match(await evaluate('document.title'), /Adelvio.*digital studio/);
  assert.equal(await evaluate('document.querySelector(".project-heading h2").textContent'), 'Let’s makewhat’s next.');
  assert.equal(await evaluate('document.querySelectorAll("h1").length'), 1);
  const brokenAnchors = await evaluate(`Array.from(document.querySelectorAll('a[href^="#"]')).filter(a=>a.hash&&a.hash!=='#'&&!document.getElementById(a.hash.slice(1))).map(a=>a.hash)`);
  assert.deepEqual(brokenAnchors, [], 'Every internal link must resolve');

  const layouts = [];
  for (const [width, height] of [[320,900], [390,844], [768,1024], [820,1180], [1024,768], [1440,900], [1920,1080]]) {
    await size(width, height);
    for (const selector of ['.studio-hero', '#approach', '#work', '.work-booking', '#packages', '#process', '#care', '#questions', '#about', '#project']) {
      await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({behavior:'instant'})`);
      await pause(70);
      assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'), `${width}px: horizontal overflow at ${selector}`);
    }
    const outsideControls = await evaluate(`Array.from(document.querySelectorAll('a,button,input,select,textarea')).filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&(r.left < -1||r.right>innerWidth+1)}).map(e=>e.textContent.trim().slice(0,60))`);
    assert.deepEqual(outsideControls, [], `${width}px: controls outside the viewport`);
    layouts.push({width,height,overflow:false});
  }
  assert.equal(await evaluate('Array.from(document.images).filter(i=>!i.complete||!i.naturalWidth).length'), 0, 'All images load');

  await size(1440, 900, 'no-preference');
  for (const [index, progress] of [[0,.1], [1,.5], [2,.9]]) {
    await evaluate(`(()=>{const e=document.querySelector('#approach');window.scrollTo({top:e.getBoundingClientRect().top+scrollY+(e.offsetHeight-innerHeight)*${progress},behavior:'instant'})})()`);
    await pause(850);
    assert.equal(await evaluate('document.querySelector("#approach").dataset.stage'), String(index), 'Scroll advances the system story');
    await shot(`desktop-system-${index+1}`);
  }
  await evaluate('scrollTo({top:0,behavior:"instant"})');
  await pause(600);
  await shot('desktop-hero');

  await size(390, 844);
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".system-sticky")).position'), 'relative');
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".hero-type")).animationName'), 'none');
  await click('.chapter-controls button:nth-child(2)');
  assert.equal(await evaluate('document.querySelector("#approach").dataset.stage'), '1', 'Touch-friendly chapter controls work without scroll motion');
  await click('.chapter-controls button:nth-child(3)');
  assert.match(await evaluate('document.querySelector(".chapter-copy").textContent'), /separate scope/);
  await evaluate('document.querySelector("#approach").scrollIntoView({behavior:"instant"})');
  await shot('mobile-system-3');

  await evaluate('scrollTo({top:0,behavior:"instant"})');
  await click('.menu-toggle');
  assert.equal(await evaluate('document.querySelector(".menu-toggle").getAttribute("aria-expanded")'), 'true');
  await send('Input.dispatchKeyEvent', {type:'keyDown', key:'Escape', code:'Escape'});
  await send('Input.dispatchKeyEvent', {type:'keyUp', key:'Escape', code:'Escape'});
  assert.equal(await evaluate('document.querySelector(".menu-toggle").getAttribute("aria-expanded")'), 'false');
  assert.equal(await evaluate('document.activeElement.className'), 'menu-toggle');
  await shot('mobile-hero');

  await click('.booking-days button:nth-child(5)');
  await click('.booking-times button:nth-child(2)');
  assert.match(await evaluate('document.querySelector(".booking-selection").textContent'), /Day 16 · 2:30 PM/);
  const calendarTargets = await evaluate('Array.from(document.querySelectorAll(".booking-days button,.booking-times button")).map(e=>({w:e.offsetWidth,h:e.offsetHeight}))');
  assert.ok(calendarTargets.every(r=>r.w>=44&&r.h>=44), 'Calendar controls have comfortable touch targets');
  await evaluate('document.querySelector(".work-booking").scrollIntoView({behavior:"instant"})');
  await shot('mobile-calendar');

  await click('#package-business .button');
  assert.equal(await evaluate('document.querySelector("#build").value'), '1');
  assert.equal(await evaluate('document.activeElement.id'), 'business');
  await click('.care-row:nth-child(2)>a');
  assert.equal(await evaluate('document.querySelector("#monthly").value'), '2');
  assert.equal(await evaluate('document.querySelector(".project-form").checkValidity()'), false);
  await evaluate(`(()=>{
    const set=(selector,value)=>{const el=document.querySelector(selector);Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el),'value').set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}))};
    set('#business','Studio browser test');set('#goal','A clear website and booking inquiry.');
    const create=URL.createObjectURL.bind(URL);URL.createObjectURL=blob=>{window.__brief=blob;return create(blob)};
    const anchorClick=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(this.download){window.__download=this.download}else{anchorClick.call(this)}};
  })()`);
  await click('button[data-action="download"]');
  const brief = await evaluate('window.__brief.text()');
  assert.match(brief, /Business — \$1,250 one-time/);
  assert.match(brief, /Care Plus — \$99\/month/);
  assert.match(brief, /50% to begin/);
  assert.equal(await evaluate('window.__download'), 'adelvio-project-brief.txt');
  assert.match(await evaluate('document.querySelector(".download-note").textContent'), /Nothing has been submitted/);

  await evaluate('document.querySelector(".faq-list summary").scrollIntoView({behavior:"instant",block:"center"});document.querySelector(".faq-list summary").focus()');
  await send('Input.dispatchKeyEvent', {type:'keyDown', key:'Enter', code:'Enter', text:'\r', unmodifiedText:'\r', windowsVirtualKeyCode:13, nativeVirtualKeyCode:13});
  await send('Input.dispatchKeyEvent', {type:'keyUp', key:'Enter', code:'Enter', windowsVirtualKeyCode:13});
  await pause(100);
  assert.equal(await evaluate('document.querySelector(".faq-list details").open'), true, 'FAQ works from the keyboard');
  assert.deepEqual(runtimeErrors, [], 'No uncaught browser errors');
  const report = {layouts, scrollStages:3, mobileChapters:true, reducedMotion:true, menuEscape:true, calendar:true, packageAndCareSelection:true, downloadedBrief:true, keyboardFaq:true, runtimeErrors:0};
  await writeFile(`${output}/report.json`, JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
} finally {
  await send('Page.close');
  ws.close();
}
