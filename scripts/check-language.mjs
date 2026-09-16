import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { createServer } from 'vite';

const server = await createServer({ configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, watch: null } });
try {
  const { resolveLanguage, translate } = await server.ssrLoadModule('/app/i18n/language.ts');
  const { spanish } = await server.ssrLoadModule('/app/i18n/es.ts');
  const { packages, carePlans, extras, questions } = await server.ssrLoadModule('/app/offerings.ts');
  for (const [query, saved, browser, expected] of [
    [null, null, [], 'es'],
    [null, null, ['fr-FR'], 'es'],
    [null, null, ['en-US', 'es-PR'], 'en'],
    [null, null, ['es-PR', 'en-US'], 'es'],
    [null, null, ['fr', 'EN-gb'], 'en'],
    [null, 'es', ['en-US'], 'es'],
    [null, 'en', ['es-PR'], 'en'],
    ['es', 'en', ['en-US'], 'es'],
    ['en', 'es', ['es-PR'], 'en'],
    ['invalid', 'invalid', ['es_PR'], 'es'],
  ]) assert.equal(resolveLanguage(query, saved, browser), expected);

  const requireTranslation = (text) => assert.ok(Object.hasOwn(spanish, text), `Missing Spanish translation: ${text}`);
  for (const pkg of packages) {
    [pkg.name, pkg.description, pkg.tag, ...pkg.features].forEach(requireTranslation);
    assert.equal(translate('en', pkg.description), pkg.description);
  }
  carePlans.forEach(({ name }) => requireTranslation(name));
  extras.forEach(([name, price]) => { requireTranslation(name); if (!price.startsWith('$')) requireTranslation(price); });
  questions.flat().forEach(requireTranslation);
  // Every literal translation call must be backed by the dictionary.
  for (const file of ['app/page.tsx', 'app/components/SiteHeader.tsx', 'app/components/StudioExperience.tsx']) {
    const ast = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node) {
      if (ts.isCallExpression(node) && node.expression.getText(ast) === 't' && ts.isStringLiteral(node.arguments[0])) requireTranslation(node.arguments[0].text);
      ts.forEachChild(node, visit);
    }
    visit(ast);
  }
  for (const [key, value] of Object.entries(spanish)) {
    assert.deepEqual([...key.matchAll(/\{\w+\}/g)].map(x => x[0]).sort(), [...value.matchAll(/\{\w+\}/g)].map(x => x[0]).sort(), `Interpolation mismatch: ${key}`);
  }
  assert.equal(translate('es', 'Unknown {count}', { count: 0 }), 'Unknown 0');
  assert.deepEqual(packages.map(p => p.price), [750, 1250, 1900]);
  assert.deepEqual(carePlans.map(p => p.price), [0, 49, 99, 199]);
  console.log(`Language priority, regional preferences, ${Object.keys(spanish).length} translations, interpolation and offering prices verified.`);
} finally {
  await server.close();
}
