import { resolve } from 'node:path';

/** Repository root, two levels above `tui/src/lib`. */
export const REPO_ROOT = resolve(import.meta.dirname, '../../..');
export const DATA_DIR = resolve(REPO_ROOT, 'data');
export const INCIDENTS_DIR = resolve(DATA_DIR, 'incidents');
export const MAINTENANCES_DIR = resolve(DATA_DIR, 'maintenances');

export const HOSTS = [
  { name: 'Netlify', origin: 'https://status.datocms.com' },
  { name: 'GitHub Pages', origin: 'https://status2.datocms.com' },
] as const;
