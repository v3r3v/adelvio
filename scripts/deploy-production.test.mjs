import assert from 'node:assert/strict';
import test from 'node:test';
import { deployProduction } from './deploy-production.mjs';

const approved = ['--confirm-production=adelvio.com'];
const refuseSpawn = () => assert.fail('Wrangler must not run for a blocked release');
const blocked = { env: {}, run: refuseSpawn, exists: () => true, log: () => {} };

test('missing, incorrect and additional arguments never invoke Wrangler', () => {
  for (const args of [[], ['--confirm-production'], ['--confirm-production=true'], ['--confirm-production=example.com'], [...approved, '--env', 'other']]) {
    assert.equal(deployProduction(args, blocked), 1);
  }
});
test('CI and Workers Builds cannot release, even with the confirmation flag', () => {
  for (const env of [{ CI: 'true' }, { CI: '1' }, { CI: 'TRUE' }, { WORKERS_CI: '1', CI: 'false' }]) {
    assert.equal(deployProduction(approved, { ...blocked, env }), 1);
  }
});
test('missing production assets block release before starting a process', () => {
  assert.equal(deployProduction(approved, { ...blocked, exists: () => false }), 1);
});
test('approved local release uses the fixed config and installed CLI without a shell', () => {
  let calls = 0;
  const result = deployProduction(approved, { ...blocked, run: (exe, args, options) => {
    calls++;
    assert.equal(exe, process.execPath);
    assert.match(args[0].replaceAll('\\', '/'), /\/node_modules\/wrangler\/bin\/wrangler\.js$/);
    assert.deepEqual(args.slice(1, 3), ['deploy', '--config']);
    assert.match(args[3], /wrangler\.cloudflare\.jsonc$/);
    assert.equal(args.length, 4);
    assert.equal(options.shell, false);
    return { status: 0 };
  } });
  assert.equal(calls, 1);
  assert.equal(result, 0);
});
test('CLI failure and termination are not reported as success', () => {
  for (const [response, status] of [[{ status: 3 }, 3], [{ status: null }, 1], [{ error: new Error('test failure') }, 1]]) {
    assert.equal(deployProduction(approved, { ...blocked, run: () => response }), status);
  }
});
