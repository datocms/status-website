/**
 * Serves `e2e/.dist` as a static host does. There are no API routes, as on
 * the GitHub Pages mirror: a test that needs one gives the reply itself.
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const root = join(import.meta.dirname, '.dist');
const port = Number(process.env.PORT ?? 4387);

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.rss': 'application/rss+xml; charset=utf-8',
  '.atom': 'application/atom+xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const resolve = (pathname: string) => {
  const path = join(root, normalize(decodeURIComponent(pathname)));
  if (!path.startsWith(root) || !existsSync(path)) return null;
  if (!statSync(path).isDirectory()) return path;
  const index = join(path, 'index.html');
  return existsSync(index) ? index : null;
};

createServer((request, response) => {
  const { pathname } = new URL(request.url ?? '/', 'http://localhost');
  const file = resolve(pathname);

  if (!file) {
    response.writeHead(404, { 'content-type': TYPES['.html'] });
    response.end(readFileSync(join(root, '404.html')));
    return;
  }

  response.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  response.end(readFileSync(file));
}).listen(port, () => console.log(`e2e: serving ${root} on http://localhost:${port}`));
