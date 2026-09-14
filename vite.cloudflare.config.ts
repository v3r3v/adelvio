import {defineConfig, mergeConfig} from 'vite';
import {fileURLToPath} from 'node:url';
import pagesConfig from './vite.pages.config';

export default defineConfig(() => {
  const configuredUrl = process.env.WEBSIRICO_SITE_URL;
  if (!configuredUrl) {
    throw new Error('Set WEBSIRICO_SITE_URL to your confirmed public HTTPS address before building for Cloudflare.');
  }
  const siteUrl = new URL(configuredUrl);
  if (siteUrl.protocol !== 'https:' || siteUrl.username || siteUrl.password || siteUrl.search || siteUrl.hash || siteUrl.pathname !== '/') {
    throw new Error('WEBSIRICO_SITE_URL must be an HTTPS origin, such as https://websirico.com.');
  }
  return mergeConfig(pagesConfig, {
    base: '/',
    plugins: [{
      name: 'websirico-public-address',
      transformIndexHtml(html: string) {
        return html.replaceAll('https://v3r3v.github.io/websirico/', `${siteUrl.origin}/`);
      },
    }],
    build: {
      outDir: fileURLToPath(new URL('./dist-cloudflare/', import.meta.url)),
    },
  });
});
