import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const confirmation = '--confirm-production=adelvio.com';

/** Release guard, not a substitute for provider access controls. */
export function deployProduction(args, { env = process.env, run = spawnSync, exists = existsSync, log = console.log } = {}) {
  // A flag copied into the Cloudflare build settings must not enable auto-release.
  if (env.WORKERS_CI === '1' || (env.CI && !['0', 'false'].includes(env.CI.toLowerCase()))) {
    log('Production deployment blocked in CI. Build and preview only; release locally after approval.');
    return 1;
  }
  if (args.length !== 1 || args[0] !== confirmation) {
    log(`Production deployment blocked. An approved local release requires: npm run deploy:cloudflare -- ${confirmation}`);
    return 1;
  }
  if (!exists(resolve(root, 'dist-cloudflare/index.html'))) {
    log('Production build missing. Set SITE_URL=https://adelvio.com and run npm run build:cloudflare first.');
    return 1;
  }
  const result = run(process.execPath, [
    resolve(root, 'node_modules/wrangler/bin/wrangler.js'),
    'deploy', '--config', resolve(root, 'wrangler.cloudflare.jsonc'),
  ], { cwd: root, env, stdio: 'inherit', shell: false });
  if (result.error) {
    log(`Could not start Wrangler: ${result.error.message}`);
    return 1;
  }
  return result.status ?? 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = deployProduction(process.argv.slice(2));
}
