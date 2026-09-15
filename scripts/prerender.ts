import {createServer, type Plugin, type ResolvedConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {createElement} from 'react';
import {renderToString} from 'react-dom/server';
import {fileURLToPath} from 'node:url';

/** Render the same React page at build time; hosting remains entirely static. */
export function prerenderHome(): Plugin {
  let config: ResolvedConfig;
  return {
    name: 'adelvio-prerender-home',
    apply: 'build',
    enforce: 'post',
    configResolved(resolved) { config = resolved; },
    async generateBundle(_, bundle) {
      const document = bundle['index.html'];
      if (!document || document.type !== 'asset') throw new Error('Missing homepage build output');
      const renderer = await createServer({
        configFile: false,
        root: fileURLToPath(new URL('../', import.meta.url)),
        plugins: [react()],
        server: {middlewareMode: true, watch: null},
        appType: 'custom',
        ssr: {external: ['react', 'react-dom']},
      });
      try {
        const {default: Home} = await renderer.ssrLoadModule('/app/page.tsx');
        const markup = renderToString(createElement(Home, {assetBase: config.base}));
        const html = String(document.source);
        if (!html.includes('<div id="root"></div>')) throw new Error('Missing homepage render target');
        document.source = html.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
      } finally {
        await renderer.close();
      }
    },
  };
}
