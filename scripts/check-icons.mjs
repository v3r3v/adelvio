import {readFileSync, readdirSync} from 'node:fs';
import {join} from 'node:path';

// UI sources only: ordinary punctuation and mathematical text remain allowed.
const forbidden = /[\u2190-\u21ff\u25cf\u2713\u2714\u2733\u2734\u2b05-\u2b07]/u;
function scan(directory) {
  return readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return scan(path);
    if (!/\.(tsx|jsx|html|css)$/.test(path)) return [];
    return readFileSync(path, 'utf8').split('\n').flatMap((line, index) => forbidden.test(line) ? [`${path}:${index + 1}`] : []);
  });
}
const failures = scan('app');
if (failures.length) {
  throw new Error(`Use SVG icons instead of Unicode UI symbols:\n${failures.join('\n')}`);
}
console.log('Icon check passed: no platform-dependent UI glyphs.');
