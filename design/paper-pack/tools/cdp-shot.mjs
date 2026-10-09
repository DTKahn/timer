// Own headless Chrome via CDP: phone viewport, color scheme emulation, clicks, screenshots.
// usage: node cdp-shot.mjs '<json>'  where json = {shots:[{url, out, dark, steps:[{click:"aria label"}|{wait:ms}|{eval:"js"}]}]}
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const arg = process.argv[2];
const cfg = JSON.parse(arg.trim().startsWith('{') ? arg : (await import('node:fs')).readFileSync(arg, 'utf8'));
const PORT = 9341;
const profile = mkdtempSync(join(tmpdir(), 'cdp-prof-'));
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`, '--no-first-run', 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 50; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); break; } catch { await sleep(200); }
}
const page = targets.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') console.log('console.error:', m.params.args.map((a) => a.value ?? a.description).join(' ').slice(0, 300));
  if (m.method === 'Runtime.exceptionThrown') console.log('exception:', JSON.stringify(m.params.exceptionDetails).slice(0, 400));
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

await send('Runtime.enable');
await send('Page.enable');
for (const shot of cfg.shots) {
  const w = shot.w ?? 390, h = shot.h ?? 844;
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: true });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: shot.dark ? 'dark' : 'light' }] });
  await send('Page.navigate', { url: `http://localhost:8091${shot.url}` });
  await sleep(shot.wait ?? 3500);
  for (const step of shot.steps ?? []) {
    if (step.wait) await sleep(step.wait);
    if (step.eval) { const r = await send('Runtime.evaluate', { expression: step.eval, returnByValue: true }); console.log('eval:', JSON.stringify(r.result?.result?.value)); }
    if (step.click) {
      const r = await send('Runtime.evaluate', {
        expression: `(() => { const el = [...document.querySelectorAll('[aria-label]')].find(e => e.getAttribute('aria-label') === ${JSON.stringify(step.click)}); if (!el) return null; const b = el.getBoundingClientRect(); return [b.x + b.width/2, b.y + b.height/2]; })()`,
        returnByValue: true,
      });
      const pt = r.result?.result?.value;
      if (!pt) { console.log('not found:', step.click); continue; }
      for (const type of ['mousePressed', 'mouseReleased']) {
        await send('Input.dispatchMouseEvent', { type, x: pt[0], y: pt[1], button: 'left', clickCount: 1 });
      }
      await sleep(step.after ?? 800);
    }
  }
  const shotRes = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(shot.out, Buffer.from(shotRes.result.data, 'base64'));
  console.log('wrote', shot.out);
}
ws.close();
chrome.kill();
await sleep(300);
rmSync(profile, { recursive: true, force: true });
process.exit(0);
